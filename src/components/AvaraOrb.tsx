import { useEffect, useMemo, useRef, useState } from "react";

/**
 * AvaraOrb — rotating 3D crystal sphere of living shards.
 *
 * Geometry: low-poly icosahedron (20 triangular faces). Each face is a thin
 * "prism" — front polygon + darker back polygon offset inward — plus an
 * internal bevel inside the SVG to fake the side walls.
 *
 * Per-shard motion (single RAF loop, no React re-renders):
 *   --z-offset : continuous radial breathing, per-shard phase
 *   --rz       : tiny rotation jitter around the shard normal
 *   --bloom    : occasional outward "catch the light" bloom
 *   --b        : Lambertian brightness from a fixed top-left light
 *
 * Inside the sphere, ~8 "inclusions" drift on slow Lissajous paths and are
 * visible *through* the translucent shards.
 */

type Vec3 = [number, number, number];

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
const VERTS: Vec3[] = RAW_VERTS.map(([x, y, z]) => {
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l];
});

type Face = {
  centroid: Vec3;
  yawDeg: number;
  pitchDeg: number;
  local: { x: number; y: number }[];
  breathPeriod: number;
  breathPhase: number;
  jitterPeriod: number;
  jitterPhase: number;
};

function buildFaces(radius: number): Face[] {
  return ICO_FACES.map(([a, b, c], idx) => {
    const p1 = VERTS[a]; const p2 = VERTS[b]; const p3 = VERTS[c];
    const cx = (p1[0] + p2[0] + p3[0]) / 3;
    const cy = (p1[1] + p2[1] + p3[1]) / 3;
    const cz = (p1[2] + p2[2] + p3[2]) / 3;
    const cl = Math.hypot(cx, cy, cz);
    const centroid: Vec3 = [cx / cl, cy / cl, cz / cl];

    const yaw = Math.atan2(centroid[0], centroid[2]) * 180 / Math.PI;
    const pitch = Math.asin(centroid[1]) * 180 / Math.PI;

    const n: Vec3 = centroid;
    const upRef: Vec3 = Math.abs(n[1]) > 0.95 ? [1, 0, 0] : [0, 1, 0];
    const ux = upRef[1] * n[2] - upRef[2] * n[1];
    const uy = upRef[2] * n[0] - upRef[0] * n[2];
    const uz = upRef[0] * n[1] - upRef[1] * n[0];
    const ul = Math.hypot(ux, uy, uz);
    const u: Vec3 = [ux / ul, uy / ul, uz / ul];
    const v: Vec3 = [
      n[1] * u[2] - n[2] * u[1],
      n[2] * u[0] - n[0] * u[2],
      n[0] * u[1] - n[1] * u[0],
    ];

    const proj = (p: Vec3) => {
      const dx = p[0] - centroid[0];
      const dy = p[1] - centroid[1];
      const dz = p[2] - centroid[2];
      const lx = dx * u[0] + dy * u[1] + dz * u[2];
      const ly = -(dx * v[0] + dy * v[1] + dz * v[2]);
      return { x: lx * radius, y: ly * radius };
    };

    const rnd = (seed: number) => {
      const s = Math.sin(seed * 9301 + idx * 49297) * 233280;
      return s - Math.floor(s);
    };

    return {
      centroid,
      yawDeg: yaw,
      pitchDeg: pitch,
      local: [proj(p1), proj(p2), proj(p3)],
      breathPeriod: 5000 + rnd(1) * 4000,
      breathPhase: rnd(2) * Math.PI * 2,
      jitterPeriod: 7000 + rnd(3) * 5000,
      jitterPhase: rnd(4) * Math.PI * 2,
    };
  });
}

type Inclusion = {
  ax: number; ay: number; az: number;
  px: number; py: number; pz: number;
  phx: number; phy: number; phz: number;
  size: number;
  color: string;
};

// Coral accents — used sparingly (~10–15% of presence)
const CORAL_PRIMARY = "#F26D5B";
const CORAL_LIGHT = "#FF7A6B";
const CORAL_DEEP = "#E96A5B";
// Designated coral accent facets (out of 20)
const CORAL_FACETS = new Set<number>([4, 13]);

function buildInclusions(radius: number): Inclusion[] {
  // Reduced champagne dominance; one coral inclusion for inner warmth
  const palette = [CORAL_PRIMARY, "#3E7A74", "#8E7AA8", "#3E7A74", "#D49A92", "#C9A98A"];
  return Array.from({ length: 6 }, (_, i) => {
    const r = (s: number) => {
      const v = Math.sin(s * 12.9898 + i * 78.233) * 43758.5453;
      return v - Math.floor(v);
    };
    return {
      ax: radius * (0.15 + r(2) * 0.30),
      ay: radius * (0.15 + r(3) * 0.30),
      az: radius * (0.15 + r(4) * 0.30),
      px: 6000 + r(5) * 6000,
      py: 7000 + r(6) * 6000,
      pz: 8000 + r(7) * 6000,
      phx: r(8) * Math.PI * 2,
      phy: r(9) * Math.PI * 2,
      phz: r(10) * Math.PI * 2,
      size: 16 + r(11) * 24,
      color: palette[i % palette.length],
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

  const radius = size * 0.42;
  const depth = radius * 0.09;
  const faces = useMemo(() => buildFaces(radius), [radius]);
  const inclusions = useMemo(() => buildInclusions(radius), [radius]);

  useEffect(() => {
    if (reduced) return;
    const rotor = rotorRef.current;
    if (!rotor) return;
    const shards = Array.from(rotor.querySelectorAll<HTMLElement>("[data-shard]"));
    const incs = Array.from(rotor.querySelectorAll<HTMLElement>("[data-inclusion]"));
    let raf = 0;
    const start = performance.now();
    const SPIN_MS = 24000;
    const TILT_MS = 40000;

    type Bloom = { idx: number; start: number; dur: number };
    const blooms: Bloom[] = [];
    let nextBloomAt = start + 1500;

    const Lx = -0.55, Ly = 0.7, Lz = 0.45;
    const Ll = Math.hypot(Lx, Ly, Lz);
    const lx = Lx / Ll, ly = Ly / Ll, lz = Lz / Ll;

    const tick = (t: number) => {
      const dt = t - start;
      const yaw = (dt / SPIN_MS) * 360;
      const tilt = Math.sin((dt / TILT_MS) * Math.PI * 2) * 12 - 14;
      rotor.style.transform = `rotateX(${tilt}deg) rotateY(${yaw}deg)`;

      if (t >= nextBloomAt) {
        // Bias selection toward coral facets (~3× more likely)
        const coralArr = Array.from(CORAL_FACETS);
        const useCoral = Math.random() < 0.55;
        const idx = useCoral
          ? coralArr[Math.floor(Math.random() * coralArr.length)]
          : Math.floor(Math.random() * faces.length);
        blooms.push({ idx, start: t, dur: 1600 });
        nextBloomAt = t + 1800 + Math.random() * 2200;
      }
      for (let i = blooms.length - 1; i >= 0; i--) {
        if (t - blooms[i].start > blooms[i].dur) blooms.splice(i, 1);
      }

      const yr = (yaw * Math.PI) / 180;
      const xr = (tilt * Math.PI) / 180;
      const cy = Math.cos(yr), sy = Math.sin(yr);
      const cx = Math.cos(xr), sx = Math.sin(xr);

      for (let i = 0; i < faces.length; i++) {
        const f = faces[i];
        const n = f.centroid;
        let nx = n[0] * cy + n[2] * sy;
        let ny = n[1];
        let nz = -n[0] * sy + n[2] * cy;
        const ny2 = ny * cx - nz * sx;
        const nz2 = ny * sx + nz * cx;
        ny = ny2; nz = nz2;

        const dot = nx * lx + ny * ly + nz * lz;
        const lam = Math.max(0, dot);
        const front = (nz + 1) / 2;
        const brightness = 0.35 + lam * 0.55 + front * 0.20;
        const opacity = Math.min(1, 0.30 + front * 0.70);

        const breath = Math.sin((dt / f.breathPeriod) * Math.PI * 2 + f.breathPhase);
        const jitter = Math.sin((dt / f.jitterPeriod) * Math.PI * 2 + f.jitterPhase);
        const zOff = breath * 4.5;
        const rz = jitter * 2.2;

        let bloom = 0;
        for (let b = 0; b < blooms.length; b++) {
          if (blooms[b].idx === i) {
            const p = (t - blooms[b].start) / blooms[b].dur;
            bloom = Math.sin(p * Math.PI);
          }
        }

        const el = shards[i];
        el.style.opacity = String(opacity);
        el.style.setProperty("--b", brightness.toFixed(3));
        el.style.setProperty("--z-offset", `${zOff.toFixed(2)}px`);
        el.style.setProperty("--rz", `${rz.toFixed(2)}deg`);
        el.style.setProperty("--bloom", bloom.toFixed(3));
      }

      for (let i = 0; i < inclusions.length; i++) {
        const inc = inclusions[i];
        const x = Math.sin((dt / inc.px) * Math.PI * 2 + inc.phx) * inc.ax;
        const y = Math.sin((dt / inc.py) * Math.PI * 2 + inc.phy) * inc.ay;
        const z = Math.cos((dt / inc.pz) * Math.PI * 2 + inc.phz) * inc.az;
        incs[i].style.transform =
          `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px)`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [faces, inclusions, reduced]);

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
          <div
            className="avara-core-glow"
            style={{
              width: radius * 1.7,
              height: radius * 1.7,
              left: size / 2 - radius * 0.85,
              top: size / 2 - radius * 0.85,
            }}
            aria-hidden
          />

          <div
            className="avara-inclusion-layer"
            style={{ left: size / 2, top: size / 2 }}
            aria-hidden
          >
            {inclusions.map((inc, i) => (
              <div
                key={i}
                data-inclusion
                className="avara-inclusion"
                style={{
                  width: inc.size,
                  height: inc.size,
                  marginLeft: -inc.size / 2,
                  marginTop: -inc.size / 2,
                  background: `radial-gradient(circle, ${inc.color} 0%, ${inc.color}00 70%)`,
                }}
              />
            ))}
          </div>

          {faces.map((f, i) => {
            const xs = f.local.map((p) => p.x);
            const ys = f.local.map((p) => p.y);
            const minX = Math.min(...xs), maxX = Math.max(...xs);
            const minY = Math.min(...ys), maxY = Math.max(...ys);
            const w = maxX - minX, h = maxY - minY;
            const pad = 2;
            const points = f.local
              .map((p) => `${(p.x - minX + pad).toFixed(2)},${(p.y - minY + pad).toFixed(2)}`)
              .join(" ");
            const lcx = (minX + maxX) / 2;
            const lcy = (minY + maxY) / 2;
            const inset = f.local
              .map((p) => {
                const ix = lcx + (p.x - lcx) * 0.62;
                const iy = lcy + (p.y - lcy) * 0.62;
                return `${(ix - minX + pad).toFixed(2)},${(iy - minY + pad).toFixed(2)}`;
              })
              .join(" ");

            const cy = f.centroid[1];
            const isCoral = CORAL_FACETS.has(i);
            const palette = isCoral
              ? [CORAL_LIGHT, CORAL_PRIMARY, CORAL_DEEP]
              : cy > 0.4
              ? ["#C9A98A", "#8E7AA8", "#3E7A74"]
              : cy > -0.2
              ? ["#C9A98A", "#D49A92", "#6B7A65"]
              : ["#8E7AA8", "#3E7A74", "#2A2622"];

            const gradId = `g-${i}`;
            const gradInner = `gi-${i}`;
            const gradBack = `gb-${i}`;

            const baseTransform =
              `translate(${size / 2}px, ${size / 2}px) ` +
              `rotateY(${f.yawDeg}deg) rotateX(${-f.pitchDeg}deg)`;

            return (
              <div
                key={i}
                data-shard
                className="avara-shard"
                style={
                  {
                    width: w + pad * 2,
                    height: h + pad * 2,
                    marginLeft: -(w + pad * 2) / 2,
                    marginTop: -(h + pad * 2) / 2,
                    transform:
                      `${baseTransform} ` +
                      `translateZ(calc(${radius}px + var(--z-offset, 0px) + var(--bloom, 0) * ${isCoral ? 12 : 8}px)) ` +
                      `rotateZ(var(--rz, 0deg))`,
                    filter: `brightness(calc(var(--b, 1) + var(--bloom, 0) * ${isCoral ? 0.85 : 0.55}))`,
                  } as React.CSSProperties
                }
              >
                {/* BACK face */}
                <svg
                  viewBox={`0 0 ${w + pad * 2} ${h + pad * 2}`}
                  width="100%"
                  height="100%"
                  className="avara-shard-back"
                  style={{ transform: `translateZ(${-depth}px)` }}
                >
                  <defs>
                    <linearGradient id={gradBack} x1="20%" y1="10%" x2="80%" y2="90%">
                      <stop offset="0%" stopColor="#7A5A28" stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#15120F" stopOpacity="0.45" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={points}
                    fill={`url(#${gradBack})`}
                    stroke="#7A5A28"
                    strokeOpacity="0.7"
                    strokeWidth="0.6"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* FRONT face with bevel */}
                <svg
                  viewBox={`0 0 ${w + pad * 2} ${h + pad * 2}`}
                  width="100%"
                  height="100%"
                  className="avara-shard-front"
                >
                  <defs>
                    <linearGradient id={gradId} x1="20%" y1="10%" x2="80%" y2="90%">
                      <stop offset="0%" stopColor={palette[0]} stopOpacity="0.92" />
                      <stop offset="55%" stopColor={palette[1]} stopOpacity="0.68" />
                      <stop offset="100%" stopColor={palette[2]} stopOpacity="0.55" />
                    </linearGradient>
                    <radialGradient id={gradInner} cx="35%" cy="30%" r="70%">
                      <stop offset="0%" stopColor={isCoral ? "#FFE4DC" : "#FFF7EA"} stopOpacity="0.88" />
                      <stop offset="60%" stopColor={palette[1]} stopOpacity="0.55" />
                      <stop offset="100%" stopColor={palette[2]} stopOpacity="0.38" />
                    </radialGradient>
                  </defs>
                  <polygon
                    points={points}
                    fill={`url(#${gradId})`}
                    stroke="#D8B76A"
                    strokeOpacity="0.7"
                    strokeWidth="0.7"
                    strokeLinejoin="round"
                  />
                  <polygon
                    points={inset}
                    fill={`url(#${gradInner})`}
                    stroke="#FFF7EA"
                    strokeOpacity="0.55"
                    strokeWidth="0.4"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx={f.local[0].x - minX + pad}
                    cy={f.local[0].y - minY + pad}
                    r="0.9"
                    fill="#FFFFFF"
                    opacity="0.9"
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
