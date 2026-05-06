# Avara Orb — Animated AI Assistant Visual

A single, premium animated orb representing **Avara**, the AI command assistant inside Avitus. The orb lives on the index page on a clean dark canvas, centered, with subtle "Avara" wordmark below. No surrounding UI — just the orb as a hero piece.

## Visual Concept

A glassy, liquid-metal sphere that feels alive and intelligent — like it's quietly thinking. Inspired by Apple's Siri orb and the Humane Ai pin's bloom, but with its own identity: deeper, calmer, more "command center" than "voice assistant."

**Palette (deep, premium, calm):**
- Background: near-black with a faint radial vignette (#08090C → #000)
- Orb core gradient: indigo → violet → soft cyan rim (#5B6CFF, #8A5BFF, #6FE3FF accents)
- Highlight: warm white bloom
- Wordmark: off-white, low-opacity, ultralight tracking-wide

## Motion System (smooth, flowy, premium, unique)

Multiple layers compose the orb. Each moves on its own slow curve — they never sync, which gives it organic life.

1. **Inner liquid core** — animated SVG/Canvas blob with metaball-style noise, slowly morphing (8–12s loop). Gradient shifts hue subtly as it breathes.
2. **Breathing scale** — whole orb gently scales 1.00 → 1.04 → 1.00 on a slow sine (~5s), like inhale/exhale.
3. **Soft rotation** — the inner gradient rotates very slowly (~30s/full turn), so highlights drift around the surface.
4. **Specular highlight** — a soft white bloom that orbits off-center, catching the orb like light on glass.
5. **Outer halo / aura** — a blurred glow ring that pulses in counter-rhythm to the breath, expanding outward.
6. **Particle wisps** — 4–6 faint dots drifting in slow arcs around the orb, fading in/out, suggesting "thinking" without being literal.
7. **Idle → Listening micro-state (optional toggle)** — when hovered, the orb intensifies: highlight brightens, halo expands, inner morph speeds up subtly. Smooth ease, no snap.

All motion uses long durations (4–30s), soft easings (cubic-bezier ease-in-out), and layered phase offsets so it never feels looped.

## Layout

```
            ┌─────────────────────────┐
            │                         │
            │                         │
            │          ◉              │   ← orb, centered, ~320px
            │                         │
            │        Avara            │   ← wordmark, small caps
            │                         │
            └─────────────────────────┘
```

Full-viewport dark background, orb vertically centered, wordmark 40px below.

## Technical Notes

- Single component `src/components/AvaraOrb.tsx`, rendered from `src/routes/index.tsx`.
- Implemented with layered divs + SVG filters (Gaussian blur, displacement map for liquid feel) + CSS keyframe animations (ok here — this is a UI page, not a Remotion video).
- Use `feTurbulence` + `feDisplacementMap` for the morphing inner liquid; animate the turbulence `baseFrequency` and a `<animateTransform>` for slow drift.
- Performance: GPU-friendly transforms only (translate, scale, opacity, filter). No layout thrash.
- Respects `prefers-reduced-motion` — falls back to a static orb with a very gentle breath.
- Replaces the placeholder index content.
