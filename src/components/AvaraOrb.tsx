import { useEffect, useState } from "react";

/**
 * AvaraOrb — animated AI assistant orb.
 * Layered SVG turbulence + radial gradients + drifting glow.
 * All motion is GPU-friendly (transform / opacity / filter).
 */
export function AvaraOrb({ size = 320 }: { size?: number }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div
      className="avara-orb"
      style={{ width: size, height: size }}
      data-reduced={reduced ? "true" : "false"}
      aria-label="Avara assistant orb"
      role="img"
    >
      {/* Outer aura — soft pulsing halo */}
      <div className="avara-aura" />

      {/* Particle wisps */}
      <div className="avara-wisps">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className={`avara-wisp avara-wisp-${i}`} />
        ))}
      </div>

      {/* The orb itself — breathing wrapper */}
      <div className="avara-breath">
        <svg
          viewBox="0 0 200 200"
          width="100%"
          height="100%"
          className="avara-svg"
        >
          <defs>
            {/* Liquid morph filter */}
            <filter id="avara-liquid" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.012 0.018"
                numOctaves="2"
                seed="3"
                result="noise"
              >
                <animate
                  attributeName="baseFrequency"
                  dur="14s"
                  values="0.010 0.018;0.018 0.012;0.014 0.020;0.010 0.018"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
                />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" />
            </filter>

            {/* Core gradient */}
            <radialGradient id="avara-core" cx="42%" cy="38%" r="70%">
              <stop offset="0%" stopColor="#E9E6FF" stopOpacity="1" />
              <stop offset="22%" stopColor="#9C8BFF" stopOpacity="1" />
              <stop offset="55%" stopColor="#5B6CFF" stopOpacity="1" />
              <stop offset="85%" stopColor="#2A1E6B" stopOpacity="1" />
              <stop offset="100%" stopColor="#0A0721" stopOpacity="1" />
            </radialGradient>

            {/* Specular sheen */}
            <radialGradient id="avara-sheen" cx="35%" cy="28%" r="32%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>

            {/* Cyan rim light */}
            <radialGradient id="avara-rim" cx="50%" cy="50%" r="50%">
              <stop offset="78%" stopColor="#6FE3FF" stopOpacity="0" />
              <stop offset="94%" stopColor="#6FE3FF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#6FE3FF" stopOpacity="0" />
            </radialGradient>

            {/* Mask to clip everything to sphere */}
            <clipPath id="avara-clip">
              <circle cx="100" cy="100" r="86" />
            </clipPath>
          </defs>

          {/* Slow rotating gradient body, morphed by liquid filter */}
          <g clipPath="url(#avara-clip)">
            <g className="avara-rotate" style={{ transformOrigin: "100px 100px" }}>
              <circle
                cx="100"
                cy="100"
                r="86"
                fill="url(#avara-core)"
                filter="url(#avara-liquid)"
              />
              {/* Inner drifting light blob */}
              <circle
                cx="80"
                cy="78"
                r="42"
                fill="#B3A8FF"
                opacity="0.55"
                filter="url(#avara-liquid)"
                className="avara-blob-a"
              />
              <circle
                cx="128"
                cy="120"
                r="36"
                fill="#6FE3FF"
                opacity="0.35"
                filter="url(#avara-liquid)"
                className="avara-blob-b"
              />
            </g>

            {/* Specular highlight that orbits subtly */}
            <g className="avara-spec">
              <circle cx="100" cy="100" r="86" fill="url(#avara-sheen)" />
            </g>
          </g>

          {/* Cyan rim light overlay */}
          <circle cx="100" cy="100" r="88" fill="url(#avara-rim)" />
        </svg>
      </div>
    </div>
  );
}
