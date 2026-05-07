# Avara Orb — Living Rim & Surface

The orb currently reads as static: the rim is a flat champagne stroke and the inside drifts like a lava lamp. The fix is to keep the orb anchored in place (no translation drift) and instead make the **surface and rim themselves feel alive** — light traveling around the edge, energy threading through the glass, and a rim that breathes with the core.

## What changes

### 1. Living champagne rim (the headline change)
Replace the single flat stroke with a layered, animated rim:

- **Traveling light arc**: a bright champagne highlight (`#F1DCA0` → transparent) that sweeps slowly around the circumference (~14s loop), like light catching the edge of a polished bezel. Implemented as a rotating conic-gradient ring masked to a thin band.
- **Counter-rotating shadow arc**: a darker bronze (`#7A5A28`) arc rotating the opposite direction at a different speed (~22s) so the rim never looks like a single spinning highlight — it reads as a faceted metal ring with shifting reflections.
- **Twin hairline strokes**: two concentric SVG circles (0.4px champagne + 0.3px inner ivory at ~96% radius) for an architectural double-bezel.
- **Rim micro-pulse**: rim opacity breathes 0.55 → 0.85 in sync with the core breath (6s) so the gold "inhales" with the orb instead of sitting flat.
- **Tick accents**: 4 nearly invisible champagne tick marks at 12/3/6/9 (≤0.4 opacity) that brighten momentarily as the traveling highlight passes — gives the rim a sense of structure, like a watch bezel.

### 2. Inner energy threads (replaces the lava-lamp drift)
Remove the `translate()` drift on the lavender/teal pools. Replace with motion that lives *on the surface*:

- **Caustic threads**: 2–3 thin curved SVG paths inside the orb (lavender + teal, ~0.4 stroke, low opacity) that animate their `stroke-dashoffset` to look like light refracting through liquid glass — slow, continuous, never-repeating feel.
- **Pulse rings**: every ~7s a faint champagne ring expands from the core to the rim and fades — the orb's "heartbeat," very subtle.
- **Sheen sweep**: the existing top-left specular highlight gets a slow diagonal sweep (oblique gradient translating across the sphere on a 9s loop), like light moving across glass as you tilt it.

### 3. Core stays anchored
The core no longer translates. It only:
- Breathes (scale 1 → 1.035, 6s).
- Rotates internally under the liquid filter (42s) so the warm gradient slowly redistributes.
- Carries the lavender/teal as in-place hue shifts (opacity + scale only, no translate), so the "thinking" colors feel like they're glowing *through* the glass rather than floating around inside it.

### 4. Halo restraint
The outer conic shimmer halo gets dialed down (opacity 0.85 → 0.5, blur up) so the rim becomes the focal point instead of competing with it.

## Files

- `src/components/AvaraOrb.tsx`
  - Add new SVG defs: `avara-rim-arc` (conic gradient via foreignObject or layered `<circle>` with `pathLength` + `stroke-dasharray`), `avara-thread-*` paths, `avara-pulse` ring.
  - Restructure rim layer into: outer hairline + inner hairline + traveling highlight arc + counter arc + tick marks.
  - Remove translate-based pool drift; switch to opacity/scale-in-place animation classes.
  - Add caustic thread paths and pulse ring inside the clip group.

- `src/styles.css`
  - New keyframes: `avara-rim-travel` (rotate 360° / 14s linear), `avara-rim-counter` (rotate -360° / 22s linear), `avara-rim-pulse` (opacity 0.55↔0.85 / 6s sync with breath), `avara-thread` (stroke-dashoffset loop, 12s/16s offset), `avara-pulse-ring` (scale 0.4→1 + opacity 0.5→0 / 7s), `avara-sheen-sweep` (translate -15%↔15% / 9s).
  - Remove `translate()` from `.avara-pool-a`, `.avara-pool-b`, `.avara-blush-orbit`; replace with `opacity` + `scale` only.
  - Tone down `.avara-shimmer` (opacity 0.5, blur 28px).
  - Add reduced-motion entries for the new classes.

- `src/routes/index.tsx` — no change.

## Result

A still, anchored orb whose **rim is the most alive part**: a champagne bezel where light travels, ticks catch, and the gold breathes with the core. Inside, light threads through the glass and a soft heartbeat pulses outward — calm, architectural, unmistakably Avara, no floating.
