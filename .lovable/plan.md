# Avara Crystal — Polish, No Sphere

Keep the current silhouette: a free-floating cluster of crystal shards, not a closed ball. The icosahedral arrangement and the "crown of glass" feel stays. This pass fixes the visual bugs that cheapen it and pushes the materials, light, and motion to feel premium and alive.

## Bugs to fix

1. **Inset bevel reads as a separate floating diamond.** Each shard currently has an inner polygon at 0.62 scale with its own gradient and stroke. On the front-facing shards it looks like a smaller shape stuck inside the bigger one. Replace with a single facet plus a soft specular highlight gradient — one cut of glass per face, not two.
2. **Back-face SVGs muddy the center.** The dark `#7A5A28` back polygons sit behind every shard at full opacity and bleed brown through the translucent fronts, dulling the colors. Remove the back SVG entirely; the shards float, they don't need a back skin.
3. **One-frame mount pop.** The rotor's inline `transform: rotateX(-14deg) rotateY(0deg)` paints once before RAF takes over, causing a visible jump on load. Set initial transform to match the first RAF frame (or `none` and start RAF synchronously).
4. **Reduced-motion shows uniform-bright shards.** When `prefers-reduced-motion: reduce`, the RAF loop never runs, so `--b` is never written and every shard renders at full brightness — flat, no depth. Compute static Lambertian lighting once for a fixed resting pose and write it before paint.
5. **Inclusions clip through shards.** Drift radius can exceed the inner shard envelope, making orbs poke out into empty space around the cluster. Constrain orbit to ~0.45 × radius and lower their opacity so they read as interior glow, not floating dots.
6. **Bloom occasionally fires on a back shard** (invisible). Gate bloom selection to faces whose normal currently has `nz > 0.4` so every bloom is seen.

## Premium upgrades

### Materials

- **Specular highlight per facet.** Replace the inset polygon with a small radial gradient anchored at the upper-left of each face (white → transparent, ~35% radius). Reads as a single light catching the cut.
- **Refined palette.** Three palette bands by latitude stay, but tighten:
  - top: ivory `#FFF7EA` → champagne `#E8C893` → gold `#B8893D`
  - mid: ivory → blush `#F4B5A5` → coral `#E8826A`
  - bottom: lavender `#B89BE8` → teal `#5BC0AE` → deep indigo `#2A2350`
  Higher-contrast stops give the cut-glass refraction look instead of pastel wash.
- **Gold rim, not gold fill.** Drop stroke opacity from 0.7 → 0.45 and width to 0.5. The edge should glint, not outline.
- **Edge fresnel.** Shards near the silhouette (low `|nz|`) get a faint cyan/lavender rim glow via a second drop-shadow filter on the SVG when `|nz| < 0.4`. Sells the "light wraps around glass" feel.

### Lighting

- Two-light model instead of one. Key light from upper-left (warm, current vector). Fill light from lower-right (cool, `#7AB8FF` at 0.3 weight). Per-face brightness becomes `0.30 + key·0.50 + fill·0.20`. Cool/warm contrast is what reads as "premium glass."
- Slight per-frame roll on the light vector (±3° over 12s) so highlights drift across facets even between bloom events.

### Motion (calmer, more deliberate)

- Spin: 32s (was 24s). Tilt: 60s, ±8° around resting -10° pitch.
- Breath amplitude: ±2.5px (was 4.5), period 6–10s per shard. Subtle.
- Jitter: ±1° (was 2.2). Just enough for neighbor shards to shimmer-shift.
- Bloom: one shard at a time, eased with `sin²(p·π)`, brightness gain 0.35×, outward push 5px, interval 2.8–4.5s, front-facing only.
- **New: occasional whole-cluster "breath"** — every ~14s the entire rotor scales 1.0 → 1.015 → 1.0 over 2.5s with cubic easing. Reads like the crystal inhales. Independent of per-shard breath.

### Background depth

- Soften `.avara-aura` to a wider, lower-opacity warm bloom (radius 1.6 × cluster, opacity 0.35).
- Add a second aura ring at the cluster's lower edge — cool lavender, very faint — so the shards feel grounded in atmosphere, not pasted on cream.
- Strengthen the contact shadow (`.avara-contact`) to an elliptical soft shadow under the cluster, ~12px blur, 0.18 opacity. The cluster currently floats with no weight.

## Files

- `src/components/AvaraOrb.tsx` — remove back-face SVG, remove inset polygon, add specular highlight radial, add fresnel rim drop-shadow on edge shards, two-light brightness model with drifting key vector, gate blooms to front-facing, add cluster-breath scale on rotor wrapper, fix mount-pop initial transform, write static lighting for reduced-motion, shrink inclusions and clamp their orbit radius.
- `src/styles.css` — drop `mix-blend-mode: screen` from `.avara-shard-front` (use straight alpha), remove `.avara-shard-back` block, soften `.avara-aura`, add `.avara-aura-cool` for the lower lavender bloom, strengthen `.avara-contact`, add `.avara-cluster-breath` wrapper rule (transform-origin center).
- `src/routes/index.tsx` — no change.

## Result

Same airborne crystal cluster, but every facet is a single clean cut of glass with a real highlight, the colors are saturated instead of washed, the cluster has weight and atmosphere around it, and the motion breathes slowly and deliberately instead of jiggling. No sphere added, no shards removed. Every movement are smooth with no lag.