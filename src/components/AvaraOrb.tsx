import { useEffect, useMemo, useRef, useState } from "react";

/**
 * AvaraOrb — rotating 3D crystal shard sphere.
 *
 * Built from a low-poly icosahedron (20 triangular faces). Each face is
 * rendered as an SVG triangle placed in 3D space using CSS transforms.
 * The whole rotor spins continuously around Y with a slow X tilt wobble.
 * A directional "light" (top-left) modulates per-shard opacity each frame
 * via a single CSS variable + per-shard base offsets — no React re-renders.
 */

type Vec3 = [number, number, number];

// ── Icosahedron geometry (unit radius) ───────────────────────────────────
const PHI = (1 + Math.sqrt(5)) / 2;
const RAW_VERTS: Vec3[] = [
  [-1,  PHI, 0], [ 1,  PHI, 0], [-1, -PHI, 0], [ 1, -PHI, 0],
  [ 0, -1,  PHI], [ 0,  1,  PHI], [ 0, -1, -PHI], [ 0,  1, -PHI],
  [ PHI, 0, -1], [ PHI, 0,  1], [-PHI, 0, -1], [-PHI, 0,  1],
];
const ICO_FACES: [number, number, number][] = [
  [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
  [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
  [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
  [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1],
];

// Normalize all vertices to unit sphere
const VERTS: Vec3[] = RAW_VERTS.map(([x, y, z]) => {
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l];
});

// Per-face precomputed centroid + normal (= centroid for unit sphere)
type Face = {
  p1: Vec3; p2: Vec3; p3: Vec3;
  centroid: Vec3;
  // base rotation angle in degrees that brings facet to face the camera
  // we rotate the planar triangle in CSS using rotateY then rotateX based on
  // the centroid spherical coords.
  yawDeg: number;   // rotateY
  pitchDeg: number; // rotateX
  // 2D triangle in the facet's local plane (after rotating to face camera)
  local: { x: number; y: number }[];
};

function buildFaces(radius: number): Face[] {
  return ICO_FACES.map(([a, b, c]) => {
    const p1 = VERTS[a]; const p2 = VERTS[b]; const p3 = VERTS[c];
    const cx = (p1[0] + p2[0] + p3[0]) / 3;
    const cy = (p1[1] + p2[1] + p3[1]) / 3;
    const cz = (p1[2] + p2[2] + p3[2]) / 3;
    const cl = Math.hypot(cx, cy, cz);
    const centroid: Vec3 = [cx / cl, cy / cl, cz / cl];

    // Spherical → rotateY (yaw around Y) + rotateX (pitch)
    // We want the facet plane normal to point along centroid direction.
    // After rotateY(yaw) rotateX(-pitch), the local +Z axis maps to centroid.
    const yaw = Math.atan2(centroid[0], centroid[2]) * 180 / Math.PI;
    const pitch = Math.asin(centroid[1]) * 180 / Math.PI;

    // Build an orthonormal basis (u, v, n) where n = centroid
    const n: Vec3 = centroid;
    // pick reference up
    const upRef: Vec3 = Math.abs(n[1]) > 0.95 ? [1, 0, 0] : [0, 1, 0];
    // u = normalize(upRef × n)
    const ux = upRef[1] * n[2] - upRef[2] * n[1];
    const uy = upRef[2] * n[0] - upRef[0] * n[2];
    const uz = upRef[0] * n[1] - upRef[1] * n[0];
    const ul = Math.hypot(ux, uy, uz);
    const u: Vec3 = [ux / ul, uy / ul, uz / ul];
    // v = n × u
    const v: Vec3 = [
      n[1] * u[2] - n[2] * u[1],
      n[2] * u[0] - n[0] * u[2],
      n[0] * u[1] - n[1] * u[0],
    ];

    // Project each vertex onto the (u,v) plane relative to centroid
    const proj = (p: Vec3) => {
      const dx = p[0] - centroid[0];
      const dy = p[1] - centroid[1];
      const dz = p[2] - centroid[2];
      // local x in CSS → along u; local y in CSS (down-positive) → along -v
      const lx = dx * u[0] + dy * u[1] + dz * u[2];
      const ly = -(dx * v[0] + dy * v[1] + dz * v[2]);
      return { x: lx * radius, y: ly * radius };
    };

    return {
      p1, p2, p3, centroid,
      yawDeg: yaw,
      pitchDeg: pitch,
      local: [proj(p1), proj(p2), proj(p3)],
    };
  });
}

export function AvaraOrb({ size = 360 }: { size?: number }) {
  const [reduced, setReduced] = useState(false);
  const rotorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const radius = size * 0.42; // sphere radius in px
  const faces = useMemo(() => buildFaces(radius), [radius]);

  // RAF loop: write current global yaw to a CSS var; per-shard opacity is
  // computed in CSS using the shard's stored base yaw — but CSS can't easily
  // do trig, so we compute brightness in JS once per frame and write each
  // shard's opacity. To stay cheap we batch: 20 facets * 60fps = 1200 writes/s.
  useEffect(() => {
    if (reduced) return;
    const rotor = rotorRef.current;
    if (!rotor) return;
    const shards = Array.from(rotor.querySelectorAll<HTMLElement>("[data-shard]"));
    let raf = 0;
    const start = performance.now();
    const SPIN_MS = 22000; // Y rotation period
    const TILT_MS = 40000; // X wobble period

    const tick = (t: number) => {
      const dt = t - start;
      const yaw = (dt / SPIN_MS) * 360; // deg
      const tilt = Math.sin((dt / TILT_MS) * Math.PI * 2) * 12 - 14; // base tilt -14, wobble ±12
      rotor.style.transform = `rotateX(${tilt}deg) rotateY(${yaw}deg)`;

      // Light direction in world space (top-left front): normalized
      // Lx=-0.5, Ly=0.7, Lz=0.5
      const Lx = -0.5, Ly = 0.7, Lz = 0.5;
      const Ll = Math.hypot(Lx, Ly, Lz);
      const lx = Lx / Ll, ly = Ly / Ll, lz = Lz / Ll;

      // Apply rotor rotation to each face normal: rotateY(yaw) then rotateX(tilt)
      const yr = (yaw * Math.PI) / 180;
      const xr = (tilt * Math.PI) / 180;
      const cy = Math.cos(yr), sy = Math.sin(yr);
      const cx = Math.cos(xr), sx = Math.sin(xr);

      for (let i = 0; i < faces.length; i++) {
        const n = faces[i].centroid;
        // rotateY
        let nx = n[0] * cy + n[2] * sy;
        let ny = n[1];
        let nz = -n[0] * sy + n[2] * cy;
        // rotateX
        const ny2 = ny * cx - nz * sx;
        const nz2 = ny * sx + nz * cx;
        ny = ny2; nz = nz2;

        // Lambertian (clamped) + ambient
        const dot = nx * lx + ny * ly + nz * lz;
        const lam = Math.max(0, dot);
        // Front-facing factor (camera looks down -Z, so nz>0 means facing camera)
        const front = (nz + 1) / 2; // 0..1
        const brightness = 0.18 + lam * 0.65 + front * 0.25; // 0..~1.08
        const opacity = Math.min(1, 0.22 + front * 0.78);
        const el = shards[i];
        el.style.opacity = String(opacity);
        el.style.setProperty("--b", brightness.toFixed(3));
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [faces, reduced]);

  return (
    <div
      className="avara-orb"
      style={{ width: size, height: size }}
      data-reduced={reduced ? "true" : "false"}
      aria-label="Avara assistant crystal"
      role="img"
    >
      <div className="avara-contact" aria-hidden />
      <div className="avara-aura" aria-hidden />

      <div className="avara-3d-scene" style={{ width: size, height: size }}>
        <div
          ref={rotorRef}
          className="avara-3d-rotor"
          style={{ width: size, height: size, transform: "rotateX(-14deg) rotateY(0deg)" }}
        >
          {/* Inner core glow — visible through the shards */}
          <div
            className="avara-core-glow"
            style={{
              width: radius * 1.6,
              height: radius * 1.6,
              left: size / 2 - radius * 0.8,
              top: size / 2 - radius * 0.8,
            }}
            aria-hidden
          />

          {faces.map((f, i) => {
            // Bounding box for SVG viewBox
            const xs = f.local.map((p) => p.x);
            const ys = f.local.map((p) => p.y);
            const minX = Math.min(...xs), maxX = Math.max(...xs);
            const minY = Math.min(...ys), maxY = Math.max(...ys);
            const w = maxX - minX, h = maxY - minY;
            const pad = 1;
            const points = f.local
              .map((p) => `${(p.x - minX + pad).toFixed(2)},${(p.y - minY + pad).toFixed(2)}`)
              .join(" ");

            // Choose gradient palette based on facet vertical position
            const cy = f.centroid[1];
            const palette =
              cy > 0.4
                ? ["#FFF7EA", "#FBE6D2", "#D8B76A"] // top: ivory→champagne
                : cy > -0.2
                ? ["#FFF7EA", "#F4C9B0", "#F4A7B9"] // mid: ivory→blush
                : ["#F4A7B9", "#C9A7FF", "#78D6C6"]; // bottom: blush→lavender→teal

            const gradId = `avara-shard-grad-${i}`;
            const transform =
              `translate(${size / 2}px, ${size / 2}px) ` +
              `rotateY(${f.yawDeg}deg) rotateX(${-f.pitchDeg}deg) ` +
              `translateZ(${radius}px)`;

            return (
              <div
                key={i}
                data-shard
                className="avara-shard"
                style={{
                  width: w + pad * 2,
                  height: h + pad * 2,
                  marginLeft: -(w + pad * 2) / 2,
                  marginTop: -(h + pad * 2) / 2,
                  transform,
                }}
              >
                <svg
                  viewBox={`0 0 ${w + pad * 2} ${h + pad * 2}`}
                  width="100%"
                  height="100%"
                  style={{ display: "block", overflow: "visible" }}
                >
                  <defs>
                    <linearGradient id={gradId} x1="20%" y1="10%" x2="80%" y2="90%">
                      <stop offset="0%" stopColor={palette[0]} stopOpacity="0.85" />
                      <stop offset="55%" stopColor={palette[1]} stopOpacity="0.55" />
                      <stop offset="100%" stopColor={palette[2]} stopOpacity="0.40" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={points}
                    fill={`url(#${gradId})`}
                    stroke="#D8B76A"
                    strokeOpacity="0.55"
                    strokeWidth="0.5"
                    strokeLinejoin="round"
                  />
                  {/* inner highlight streak for glass feel */}
                  <polygon
                    points={points}
                    fill="none"
                    stroke="#FFF7EA"
                    strokeOpacity="0.35"
                    strokeWidth="0.3"
                    strokeLinejoin="round"
                    transform="scale(0.78) translate(8 6)"
                  />
                </svg>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
