import { useEffect, useState } from "react";

/**
 * AvaraOrb — premium ivory + champagne orb with a living rim.
 * Anchored core, traveling light along a champagne bezel, caustic threads,
 * and a soft heartbeat pulse. No floating drift.
 */
export function AvaraOrb({ size = 340 }: { size?: number }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Rim geometry: stroke-based circle at r=87 with circumference ~546.6
  const RIM_R = 87;
  const RIM_C = 2 * Math.PI * RIM_R;

  return (
    <div
      className="avara-orb"
      style={{ width: size, height: size }}
      data-reduced={reduced ? "true" : "false"}
      aria-label="Avara assistant orb"
      role="img"
    >
      <div className="avara-aura" />
      <div className="avara-shimmer" />

      <div className="avara-breath">
        <svg viewBox="0 0 200 200" width="100%" height="100%" className="avara-svg">
          <defs>
            <filter id="avara-liquid" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.010 0.014" numOctaves="2" seed="5">
                <animate
                  attributeName="baseFrequency"
                  dur="18s"
                  values="0.008 0.014;0.014 0.010;0.011 0.016;0.008 0.014"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
                />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" scale="10" />
            </filter>

            <filter id="avara-grain" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" />
              <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.92  0 0 0 0.08 0" />
            </filter>

            <radialGradient id="avara-core" cx="42%" cy="38%" r="72%">
              <stop offset="0%"  stopColor="#FFF7EA" />
              <stop offset="35%" stopColor="#F6E6CC" />
              <stop offset="70%" stopColor="#E6CFA4" />
              <stop offset="92%" stopColor="#9C7C46" />
              <stop offset="100%" stopColor="#3A2A14" />
            </radialGradient>

            <radialGradient id="avara-blush" cx="38%" cy="32%" r="36%">
              <stop offset="0%"  stopColor="#F4A7B9" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#F4A7B9" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#F4A7B9" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="avara-lavender" cx="62%" cy="64%" r="42%">
              <stop offset="0%"  stopColor="#C9A7FF" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#C9A7FF" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#C9A7FF" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="avara-teal" cx="30%" cy="70%" r="30%">
              <stop offset="0%"  stopColor="#78D6C6" stopOpacity="0.35" />
              <stop offset="80%" stopColor="#78D6C6" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#78D6C6" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="avara-sheen-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"  stopColor="#FFF7EA" stopOpacity="0" />
              <stop offset="35%" stopColor="#FFF7EA" stopOpacity="0.35" />
              <stop offset="55%" stopColor="#FFF7EA" stopOpacity="0.55" />
              <stop offset="75%" stopColor="#FFF7EA" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#FFF7EA" stopOpacity="0" />
            </linearGradient>

            <radialGradient id="avara-depth" cx="58%" cy="78%" r="55%">
              <stop offset="0%"  stopColor="#000000" stopOpacity="0" />
              <stop offset="70%" stopColor="#1a1208" stopOpacity="0" />
              <stop offset="100%" stopColor="#0a0703" stopOpacity="0.55" />
            </radialGradient>

            <clipPath id="avara-clip">
              <circle cx="100" cy="100" r="86" />
            </clipPath>
          </defs>

          {/* ── Inside the glass ── */}
          <g clipPath="url(#avara-clip)">
            {/* Anchored core (rotates internally only) */}
            <g className="avara-rotate" style={{ transformOrigin: "100px 100px" }}>
              <circle cx="100" cy="100" r="86" fill="url(#avara-core)" filter="url(#avara-liquid)" />
            </g>

            {/* In-place lavender + teal pools (no translate) */}
            <g className="avara-pool-a" style={{ transformOrigin: "100px 100px" }}>
              <circle cx="100" cy="100" r="86" fill="url(#avara-lavender)" />
            </g>
            <g className="avara-pool-b" style={{ transformOrigin: "100px 100px" }}>
              <circle cx="100" cy="100" r="86" fill="url(#avara-teal)" />
            </g>
            <g className="avara-blush-orbit" style={{ transformOrigin: "100px 100px" }}>
              <circle cx="100" cy="100" r="86" fill="url(#avara-blush)" />
            </g>

            {/* Caustic threads — light refracting through glass */}
            <g className="avara-threads" opacity="0.7">
              <path
                className="avara-thread avara-thread-1"
                d="M30,118 Q70,90 110,108 T180,96"
                fill="none"
                stroke="#C9A7FF"
                strokeOpacity="0.55"
                strokeWidth="0.5"
                strokeLinecap="round"
              />
              <path
                className="avara-thread avara-thread-2"
                d="M40,80 Q90,60 130,80 T175,118"
                fill="none"
                stroke="#78D6C6"
                strokeOpacity="0.45"
                strokeWidth="0.5"
                strokeLinecap="round"
              />
              <path
                className="avara-thread avara-thread-3"
                d="M55,150 Q100,134 150,148"
                fill="none"
                stroke="#F1DCA0"
                strokeOpacity="0.45"
                strokeWidth="0.4"
                strokeLinecap="round"
              />
            </g>

            {/* Static facets */}
            <g opacity="0.4">
              <path d="M40,70 Q100,30 160,70" fill="none" stroke="#FFF7EA" strokeOpacity="0.28" strokeWidth="0.6" />
              <path d="M30,110 Q100,80 170,110" fill="none" stroke="#FFF7EA" strokeOpacity="0.18" strokeWidth="0.5" />
              <path d="M50,150 Q100,130 150,150" fill="none" stroke="#D8B76A" strokeOpacity="0.25" strokeWidth="0.5" />
            </g>

            {/* Diagonal sheen sweep */}
            <g className="avara-sheen-sweep">
              <rect x="-60" y="0" width="120" height="200" fill="url(#avara-sheen-grad)" />
            </g>

            {/* Heartbeat pulse rings */}
            <circle className="avara-pulse-ring" cx="100" cy="100" r="86" fill="none" stroke="#F1DCA0" strokeOpacity="0.5" strokeWidth="0.6" />
            <circle className="avara-pulse-ring avara-pulse-ring-2" cx="100" cy="100" r="86" fill="none" stroke="#C9A7FF" strokeOpacity="0.4" strokeWidth="0.5" />

            {/* Depth + grain */}
            <circle cx="100" cy="100" r="86" fill="url(#avara-depth)" />
            <circle cx="100" cy="100" r="86" filter="url(#avara-grain)" opacity="0.18" />
          </g>

          {/* ── Living champagne rim ── */}
          {/* Outer hairline */}
          <circle cx="100" cy="100" r="88" fill="none" stroke="#D8B76A" strokeOpacity="0.45" strokeWidth="0.4" />
          {/* Inner hairline */}
          <circle cx="100" cy="100" r="84.5" fill="none" stroke="#FFF7EA" strokeOpacity="0.18" strokeWidth="0.3" />

          {/* Base bezel */}
          <circle className="avara-rim-base" cx="100" cy="100" r={RIM_R} fill="none" stroke="#D8B76A" strokeOpacity="0.55" strokeWidth="1.2" />

          {/* Counter-rotating bronze shadow arc */}
          <g className="avara-rim-counter" style={{ transformOrigin: "100px 100px" }}>
            <circle
              cx="100" cy="100" r={RIM_R}
              fill="none"
              stroke="#7A5A28"
              strokeOpacity="0.7"
              strokeWidth="1.2"
              strokeDasharray={`${RIM_C * 0.18} ${RIM_C}`}
              strokeLinecap="round"
            />
          </g>

          {/* Traveling champagne highlight arc */}
          <g className="avara-rim-travel" style={{ transformOrigin: "100px 100px" }}>
            <circle
              cx="100" cy="100" r={RIM_R}
              fill="none"
              stroke="#F1DCA0"
              strokeOpacity="0.95"
              strokeWidth="1.4"
              strokeDasharray={`${RIM_C * 0.12} ${RIM_C}`}
              strokeLinecap="round"
            />
            <circle
              cx="100" cy="100" r={RIM_R}
              fill="none"
              stroke="#FFF7EA"
              strokeOpacity="0.6"
              strokeWidth="0.6"
              strokeDasharray={`${RIM_C * 0.06} ${RIM_C}`}
              strokeLinecap="round"
            />
          </g>

          {/* Tick marks at 12/3/6/9 */}
          <g className="avara-ticks" stroke="#F1DCA0" strokeWidth="0.6" strokeLinecap="round" strokeOpacity="0.35">
            <line x1="100" y1="11"  x2="100" y2="15" />
            <line x1="189" y1="100" x2="185" y2="100" />
            <line x1="100" y1="189" x2="100" y2="185" />
            <line x1="11"  y1="100" x2="15"  y2="100" />
          </g>
        </svg>
      </div>
    </div>
  );
}
