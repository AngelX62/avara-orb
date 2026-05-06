import { useEffect, useState } from "react";

/**
 * AvaraOrb — premium ivory + champagne orb.
 * Warm ivory core, thin champagne rim, blush highlight, lavender/teal shimmer.
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

            <radialGradient id="avara-sheen" cx="34%" cy="26%" r="26%">
              <stop offset="0%"  stopColor="#FFF7EA" stopOpacity="0.65" />
              <stop offset="65%" stopColor="#FFF7EA" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#FFF7EA" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="avara-rim" cx="50%" cy="50%" r="50%">
              <stop offset="86%" stopColor="#D8B76A" stopOpacity="0" />
              <stop offset="94%" stopColor="#D8B76A" stopOpacity="0.85" />
              <stop offset="97%" stopColor="#F1DCA0" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#D8B76A" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="avara-depth" cx="58%" cy="78%" r="55%">
              <stop offset="0%"  stopColor="#000000" stopOpacity="0" />
              <stop offset="70%" stopColor="#1a1208" stopOpacity="0" />
              <stop offset="100%" stopColor="#0a0703" stopOpacity="0.55" />
            </radialGradient>

            <clipPath id="avara-clip">
              <circle cx="100" cy="100" r="86" />
            </clipPath>
          </defs>

          <g clipPath="url(#avara-clip)">
            <g className="avara-rotate" style={{ transformOrigin: "100px 100px" }}>
              <circle cx="100" cy="100" r="86" fill="url(#avara-core)" filter="url(#avara-liquid)" />
            </g>

            <g className="avara-pool-a" style={{ transformOrigin: "100px 100px" }}>
              <circle cx="100" cy="100" r="86" fill="url(#avara-lavender)" />
            </g>
            <g className="avara-pool-b" style={{ transformOrigin: "100px 100px" }}>
              <circle cx="100" cy="100" r="86" fill="url(#avara-teal)" />
            </g>

            <g className="avara-blush-orbit" style={{ transformOrigin: "100px 100px" }}>
              <circle cx="100" cy="100" r="86" fill="url(#avara-blush)" />
            </g>

            <g className="avara-facets" opacity="0.4">
              <path d="M40,70 Q100,30 160,70" fill="none" stroke="#FFF7EA" strokeOpacity="0.28" strokeWidth="0.6" />
              <path d="M30,110 Q100,80 170,110" fill="none" stroke="#FFF7EA" strokeOpacity="0.18" strokeWidth="0.5" />
              <path d="M50,150 Q100,130 150,150" fill="none" stroke="#D8B76A" strokeOpacity="0.25" strokeWidth="0.5" />
            </g>

            <g className="avara-spec" style={{ transformOrigin: "100px 100px" }}>
              <circle cx="100" cy="100" r="86" fill="url(#avara-sheen)" />
            </g>

            <circle cx="100" cy="100" r="86" fill="url(#avara-depth)" />
            <circle cx="100" cy="100" r="86" filter="url(#avara-grain)" opacity="0.18" />
          </g>

          <circle cx="100" cy="100" r="86.5" fill="none" stroke="#D8B76A" strokeOpacity="0.55" strokeWidth="0.6" />
          <circle cx="100" cy="100" r="88" fill="url(#avara-rim)" />
        </svg>
      </div>
    </div>
  );
}
