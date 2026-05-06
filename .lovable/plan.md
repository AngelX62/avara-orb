# Avara Orb — Ivory & Champagne Refinement

Keep the layered SVG architecture (turbulence morph, drifting pools, breathing scale, halo, rim) but re-skin the orb around a warm ivory + champagne palette. Replace the indigo/violet system entirely.

## Palette mapping

- Core fill: ivory `#FFF7EA` → soft beige `#F6E6CC` → warm sand `#E6CFA4` → deep bronze `#9C7C46` → near-black `#3A2A14` (radial)
- Rim: thin champagne stroke `#D8B76A` with a brighter `#F1DCA0` micro-highlight at ~96%
- Highlight: blush `#F4A7B9` at ~40% opacity, top-left
- Thinking pool A: lavender `#C9A7FF` ~45% opacity, drifting bottom-right
- Thinking pool B: teal `#78D6C6` ~35% opacity, drifting bottom-left
- Specular sheen: warm ivory (not pure white), low opacity
- Page background: `#15120F` with a soft warm vignette

## Visual additions

- **Thin champagne rim**: a 0.6px stroke `#D8B76A` at the sphere edge plus a soft outer rim gradient — clearly architectural, not glow-heavy.
- **Glass facets**: 2–3 very faint curved highlight arcs (ivory + champagne, ≤0.6 stroke, ~20% opacity) inside the sphere to suggest faceted glass without being literal.
- **Inner depth**: a bottom-right radial shadow tint to give the orb weight.
- **Grain texture**: an `feTurbulence` noise layer at ~18% opacity, color-matrixed warm, to give a tactile glass surface.

## Motion

- **Idle (default)**: slow breath (1.00 → 1.035, 6s ease-in-out), soft warm aura pulse (7.5s), champagne rim static.
- **Thinking**: lavender + teal pools drift on independent 11s / 13s ease curves, blush highlight orbits subtly, specular sheen drifts, a faint lavender→teal shimmer halo rotates slowly (~24s) outside the orb at low opacity. This is the default ambient state — calm enough to read as idle, just enough motion to read as alive.
- Internal core gradient still rotates very slowly (~38s) under the morph filter so light catches differently over time.
- Wisps removed — they read too "magical." Replaced by the shimmer halo, which is more architectural.

## Files

- `src/components/AvaraOrb.tsx` — rewrite SVG defs (gradients, filters), restructure layers (core → pools → blush → facets → sheen → depth → grain → rim).
- `src/styles.css` — update Avara CSS block: new aura color (warm amber, not violet), add `.avara-shimmer` rotating halo, add `.avara-pool-a/b` and `.avara-blush-orbit` keyframes, retune `.avara-stage` background to `#15120F` warm vignette, retint wordmark to ivory.
- `src/routes/index.tsx` — no structural change.

Result: a calm, architectural ivory sphere with a thin gold rim, soft blush light, and the lavender/teal "thinking" colors living *inside* the glass rather than on top of it.
