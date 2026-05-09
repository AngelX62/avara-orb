import { useEffect, useMemo, useRef, useState } from "react";

/**
 * AvaraOrb — floating cluster of crystal shards (icosahedral arrangement).
 *
 * Premium polish pass:
 *   - single clean facet per shard (no inset bevel)
 *   - back-face culled so the cluster reads cleanly
 *   - two-light brightness model (warm key + cool fill) with drifting key vector
 *   - per-shard breath/jitter + occasional eased bloom on a front-facing shard
 *   - whole-cluster slow inhale on the rotor wrapper
 *   - reduced-motion writes static lighting so depth survives
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
    const p1 = VERTS[a], p2 = VERTS[b], p3 = VERTS[c];
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
      breathPeriod: 6000 + rnd(1) * 4000,
      breathPhase: rnd(2) * Math.PI * 2,
      jitterPeriod: 8000 + rnd(3) * 5000,
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

function buildInclusions(radius: number): Inclusion[] {
  const palette = ["#FFB870", "#C9A7FF", "#78D6C6", "#F4A7B9", "#FFF7EA"];
  const orbitMax = radius * 0.45;
  return Array.from({ length: 5 }, (_, i) => {
    const r = (s: number) => {
      const v = Math.sin(s * 12.9898 + i * 78.233) * 43758.5453;
      return v - Math.floor(v);
    };
    return {
      ax: orbitMax * (0.4 + r(2) * 0.55),
      ay: orbitMax * (0.4 + r(3) * 0.55),
      az: orbitMax * (0.4 + r(4) * 0.55),
      px: 7000 + r(5) * 6000,
      py: 8000 + r(6) * 6000,
      pz: 9000 + r(7) * 6000,
      phx: r(8) * Math.PI * 2,
      phy: r(9) * Math.PI * 2,
      phz: r(10) * Math.PI * 2,
      size: 10 + r(11) * 8,
      color: palette[i % palette.length],
    };
  });
}

export function AvaraOrb({ size = 360 }: { size?: number }) {
  const [reduced, setReduced] = useState(false);
  const rotorRef = useRef<HTMLDivElement>(null);
  const breathRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const radius = size * 0.42;
  const faces = useMemo(() => buildFaces(radius), [radius]);
  const inclusions = useMemo(() => buildInclusions(radius), [radius]);

  // Brightness model used by both RAF and reduced-motion paths.
  const lightFace = (
    face: Face,
    cy: number, sy: number, cx: number, sx: number,
    keyLx: number, keyLy: number, keyLz: number,
  ) => {
    const n = face.centroid;
    let nx = n[0] * cy + n[2] * sy;
    let ny = n[1];
    let nz = -n[0] * sy + n[2] * cy;
    const ny2 = ny * cx - nz * sx;
    const nz2 = ny * sx + nz * cx;
    ny = ny2; nz = nz2;

    // key (warm, upper-left, slowly drifting), fill (cool, lower-right)
    const keyDot = Math.max(0, nx * keyLx + ny * keyLy + nz * keyLz);
    // fill light: opposite-ish, cool
    const fLx = 0.45, fLy = -0.4, fLz = 0.5;
    const fl = Math.hypot(fLx, fLy, fLz);
    const fillDot = Math.max(0, nx * (fLx / fl) + ny * (fLy / fl) + nz * (fLz / fl));

    const brightness = 0.30 + keyDot * 0.50 + fillDot * 0.20;
    const front = nz; // -1..1
    return { brightness, front };
  };

  useEffect(() => {
    const rotor = rotorRef.current;
    const breath = breathRef.current;
    if (!rotor) return;
    const shards = Array.from(rotor.querySelectorAll<HTMLElement>("[data-shard]"));

    if (reduced) {
      // Static resting pose lighting.
      const yaw = -25 * Math.PI / 180;
      const tilt = -14 * Math.PI / 180;
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const cx = Math.cos(tilt), sx = Math.sin(tilt);
      const Lx = -0.4, Ly = 0.7, Lz = 0.5;
      const Ll = Math.hypot(Lx, Ly, Lz);
      const lx = Lx / Ll, ly = Ly / Ll, lz = Lz / Ll;
      rotor.style.transform = `rotateX(-14deg) rotateY(-25deg)`;
      for (let i = 0; i < faces.length; i++) {
        const { brightness, front } = lightFace(faces[i], cy, sy, cx, sx, lx, ly, lz);
        const el = shards[i];
        el.style.opacity = front > 0.05 ? "1" : "0";
        el.style.setProperty("--b", brightness.toFixed(3));
        el.style.setProperty("--z-offset", "0px");
        el.style.setProperty("--rz", "0deg");
        el.style.setProperty("--bloom", "0");
      }
      return;
    }

    const incs = breath
      ? Array.from(breath.querySelectorAll<HTMLElement>("[data-inclusion]"))
      : [];

    let raf = 0;
    const start = performance.now();
    const SPIN_MS = 32000;
    const TILT_MS = 60000;
    const KEY_DRIFT_MS = 12000;
    const CLUSTER_BREATH_MS = 14000;

    type Bloom = { idx: number; start: number; dur: number };
    const blooms: Bloom[] = [];
    let nextBloomAt = start + 1500;

    // Initial paint: write resting pose synchronously to avoid mount pop.
    const initYaw = 0, initTilt = -10;
    rotor.style.transform = `rotateX(${initTilt}deg) rotateY(${initYaw}deg)`;

    const tick = (t: number) => {
      const dt = t - start;
      const yawDeg = (dt / SPIN_MS) * 360;
      const tiltDeg = -10 + Math.sin((dt / TILT_MS) * Math.PI * 2) * 8;
      rotor.style.transform = `rotateX(${tiltDeg}deg) rotateY(${yawDeg}deg)`;

      // Cluster breath
      if (breath) {
        const cb = Math.sin((dt / CLUSTER_BREATH_MS) * Math.PI * 2);
        const scale = 1 + cb * 0.012;
        breath.style.transform = `scale(${scale.toFixed(4)})`;
      }

      // Drifting key light
      const drift = (dt / KEY_DRIFT_MS) * Math.PI * 2;
      const baseAngle = Math.atan2(0.7, -0.4); // base in xy plane
      const angle = baseAngle + Math.sin(drift) * (3 * Math.PI / 180);
      const Lxy = Math.hypot(-0.4, 0.7);
      const Lx = Math.cos(angle) * Lxy;
      const Ly = Math.sin(angle) * Lxy;
      const Lz = 0.5;
      const Ll = Math.hypot(Lx, Ly, Lz);
      const lx = Lx / Ll, ly = Ly / Ll, lz = Lz / Ll;

      const yr = (yawDeg * Math.PI) / 180;
      const xr = (tiltDeg * Math.PI) / 180;
      const cy = Math.cos(yr), sy = Math.sin(yr);
      const cx = Math.cos(xr), sx = Math.sin(xr);

      // Pre-compute front-facing flags for bloom selection
      const fronts = new Float32Array(faces.length);
      for (let i = 0; i < faces.length; i++) {
        const n = faces[i].centroid;
        let nx = n[0] * cy + n[2] * sy;
        let ny = n[1];
        let nz = -n[0] * sy + n[2] * cy;
        const ny2 = ny * cx - nz * sx;
        const nz2 = ny * sx + nz * cx;
        nz = nz2; ny = ny2;
        void nx;
        fronts[i] = nz;
      }

      // Schedule next bloom
      if (t >= nextBloomAt && blooms.length === 0) {
        const candidates: number[] = [];
        for (let i = 0; i < fronts.length; i++) if (fronts[i] > 0.4) candidates.push(i);
        if (candidates.length) {
          const idx = candidates[Math.floor(Math.random() * candidates.length)];
          blooms.push({ idx, start: t, dur: 1800 });
        }
        nextBloomAt = t + 2800 + Math.random() * 1700;
      }
      for (let i = blooms.length - 1; i >= 0; i--) {
        if (t - blooms[i].start > blooms[i].dur) blooms.splice(i, 1);
      }

      for (let i = 0; i < faces.length; i++) {
        const f = faces[i];
        const { brightness, front } = lightFace(f, cy, sy, cx, sx, lx, ly, lz);

        const breathOsc = Math.sin((dt / f.breathPeriod) * Math.PI * 2 + f.breathPhase);
        const jitterOsc = Math.sin((dt / f.jitterPeriod) * Math.PI * 2 + f.jitterPhase);
        const zOff = breathOsc * 2.5;
        const rz = jitterOsc * 1.0;

        let bloom = 0;
        for (let b = 0; b < blooms.length; b++) {
          if (blooms[b].idx === i) {
            const p = (t - blooms[b].start) / blooms[b].dur;
            const s = Math.sin(p * Math.PI);
            bloom = s * s; // sin² eased
          }
        }

        const el = shards[i];
        el.style.opacity = front > 0.05 ? "1" : "0";
        el.style.setProperty("--b", brightness.toFixed(3));
        el.style.setProperty("--z-offset", `${zOff.toFixed(2)}px`);
        el.style.setProperty("--rz", `${rz.toFixed(2)}deg`);
        el.style.setProperty("--bloom", bloom.toFixed(3));
      }

      for (let i = 0; i < incs.length; i++) {
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
      <div className="avara-aura-cool" aria-hidden />

      <div className="avara-3d-scene" style={{ width: size, height: size }}>
        <div
          ref={breathRef}
          className="avara-cluster-breath"
        >
          <div
            ref={rotorRef}
            className="avara-3d-rotor"
            style={{ width: size, height: size, transform: "rotateX(-10deg) rotateY(0deg)" }}
          >
            <div
              className="avara-core-glow"
              style={{
                width: radius * 1.5,
                height: radius * 1.5,
                left: size / 2 - radius * 0.75,
                top: size / 2 - radius * 0.75,
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
              const pad = 3;
              const points = f.local
                .map((p) => `${(p.x - minX + pad).toFixed(2)},${(p.y - minY + pad).toFixed(2)}`)
                .join(" ");

              const cy = f.centroid[1];
              const palette =
                cy > 0.4
                  ? ["#FFF7EA", "#E8C893", "#B8893D"]
                  : cy > -0.2
                  ? ["#FFF7EA", "#F4B5A5", "#E8826A"]
                  : ["#B89BE8", "#5BC0AE", "#2A2350"];

              const gradId = `g-${i}`;
              const specId = `sp-${i}`;

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
                        `translateZ(calc(${radius}px + var(--z-offset, 0px) + var(--bloom, 0) * 5px)) ` +
                        `rotateZ(var(--rz, 0deg))`,
                      filter: `brightness(calc(var(--b, 1) + var(--bloom, 0) * 0.35))`,
                    } as React.CSSProperties
                  }
                >
                  <svg
                    viewBox={`0 0 ${w + pad * 2} ${h + pad * 2}`}
                    width="100%"
                    height="100%"
                    className="avara-shard-front"
                  >
                    <defs>
                      <linearGradient id={gradId} x1="20%" y1="10%" x2="80%" y2="95%">
                        <stop offset="0%" stopColor={palette[0]} stopOpacity="0.92" />
                        <stop offset="55%" stopColor={palette[1]} stopOpacity="0.72" />
                        <stop offset="100%" stopColor={palette[2]} stopOpacity="0.55" />
                      </linearGradient>
                      <radialGradient id={specId} cx="28%" cy="22%" r="42%">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                        <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.10" />
                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <polygon
                      points={points}
                      fill={`url(#${gradId})`}
                      stroke="#D8B76A"
                      strokeOpacity="0.45"
                      strokeWidth="0.5"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points={points}
                      fill={`url(#${specId})`}
                    />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
