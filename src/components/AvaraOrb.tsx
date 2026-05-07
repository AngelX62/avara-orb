import { useEffect, useState } from "react";

/**
 * AvaraOrb — translucent bubble sphere.
 * Soft ivory/blush interior, amber caustic rim glow that slowly travels,
 * gentle bubble wobble. Designed to sit on a light surface.
 */
export function AvaraOrb({ size = 360 }: { size?: number }) {
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
      {/* Soft contact shadow on the surface beneath the bubble */}
      <div className="avara-contact" aria-hidden />

      {/* Outer caustic glow — the warm light the bubble casts */}
      <div className="avara-caustic" aria-hidden />

      <div className="avara-wobble">
        <svg viewBox="0 0 220 220" width="100%" height="100%" className="avara-svg">
          <defs>
            {/* Subtle liquid distortion for organic edges */}
            <filter id="avara-liquid" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="3">
                <animate
                  attributeName="baseFrequency"
                  dur="22s"
                  values="0.010;0.014;0.011;0.010"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" scale="4" />
            </filter>

            {/* Translucent body — ivory core fading to soft blush at edges */}
            <radialGradient id="avara-body" cx="42%" cy="40%" r="62%">
              <stop offset="0%"   stopColor="#FFF7EA" stopOpacity="0.95" />
              <stop offset="40%"  stopColor="#FBE6D2" stopOpacity="0.85" />
              <stop offset="75%"  stopColor="#F4C9B0" stopOpacity="0.70" />
              <stop offset="92%"  stopColor="#F4A7B9" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#F4A7B9" stopOpacity="0.25" />
            </radialGradient>

            {/* Inner thinking pools (lavender + teal) — very faint */}
            <radialGradient id="avara-lav" cx="65%" cy="60%" r="40%">
              <stop offset="0%"  stopColor="#C9A7FF" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#C9A7FF" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="avara-teal" cx="32%" cy="68%" r="32%">
              <stop offset="0%"  stopColor="#78D6C6" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#78D6C6" stopOpacity="0" />
            </radialGradient>

            {/* Top-left specular highlight (the small bright dab) */}
            <radialGradient id="avara-spec" cx="32%" cy="22%" r="22%">
              <stop offset="0%"  stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>

            {/* Soft outer rim — like light hitting the curve of glass */}
            <radialGradient id="avara-rim" cx="50%" cy="50%" r="50%">
              <stop offset="84%" stopColor="#D8B76A" stopOpacity="0" />
              <stop offset="93%" stopColor="#E8B36A" stopOpacity="0.45" />
              <stop offset="98%" stopColor="#D8946A" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#D8946A" stopOpacity="0" />
            </radialGradient>

            {/* The traveling caustic — bright amber arc that orbits */}
            <radialGradient id="avara-caustic-arc" cx="50%" cy="88%" r="42%">
              <stop offset="0%"  stopColor="#FFB870" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#F5915A" stopOpacity="0.65" />
              <stop offset="70%" stopColor="#D86A48" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#D86A48" stopOpacity="0" />
            </radialGradient>

            <clipPath id="avara-clip">
              <circle cx="110" cy="110" r="92" />
            </clipPath>

            <mask id="avara-rim-mask">
              <circle cx="110" cy="110" r="92" fill="white" />
              <circle cx="110" cy="110" r="80" fill="black" />
            </mask>
          </defs>

          {/* Translucent body */}
          <circle
            cx="110" cy="110" r="92"
            fill="url(#avara-body)"
            filter="url(#avara-liquid)"
          />

          {/* Inside the bubble */}
          <g clipPath="url(#avara-clip)">
            <g className="avara-pool-a" style={{ transformOrigin: "110px 110px" }}>
              <circle cx="110" cy="110" r="92" fill="url(#avara-lav)" />
            </g>
            <g className="avara-pool-b" style={{ transformOrigin: "110px 110px" }}>
              <circle cx="110" cy="110" r="92" fill="url(#avara-teal)" />
            </g>

            {/* Caustic arc — concentrated bright glow that travels around the rim */}
            <g className="avara-caustic-orbit" style={{ transformOrigin: "110px 110px" }}>
              <circle
                cx="110" cy="110" r="92"
                fill="url(#avara-caustic-arc)"
                mask="url(#avara-rim-mask)"
              />
            </g>

            {/* Secondary, subtler caustic on the opposite side */}
            <g className="avara-caustic-orbit-2" style={{ transformOrigin: "110px 110px" }}>
              <circle
                cx="110" cy="110" r="92"
                fill="url(#avara-caustic-arc)"
                mask="url(#avara-rim-mask)"
                opacity="0.45"
              />
            </g>
          </g>

          {/* Soft outer rim glow */}
          <circle cx="110" cy="110" r="92" fill="url(#avara-rim)" />

          {/* Hairline edge — barely-there definition */}
          <circle
            cx="110" cy="110" r="92"
            fill="none"
            stroke="#E8B36A"
            strokeOpacity="0.35"
            strokeWidth="0.6"
          />

          {/* Top-left specular dab */}
          <circle cx="110" cy="110" r="92" fill="url(#avara-spec)" />

          {/* Tiny secondary highlight bead */}
          <ellipse
            className="avara-bead"
            cx="78" cy="72" rx="6" ry="3.5"
            fill="#FFFFFF"
            opacity="0.85"
            transform="rotate(-30 78 72)"
          />
        </svg>
      </div>
    </div>
  );
}
