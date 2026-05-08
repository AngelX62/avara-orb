# Avara Crystal — Make the Shards Truly 3D & Alive

The current shards are flat triangles glued to a sphere — they only move because the whole ball rotates. The fix is two-fold: give each shard **real volumetric depth** (so it reads as a chunk of crystal, not a paper cutout) and give each shard **its own continuous, organic motion** (so the surface feels alive, like a slowly breathing geode).

## 1. Volumetric shards (real 3D, not flat)

Each facet becomes a thin **prism**, not a single polygon:

- **Front face**: the existing triangle, at `translateZ(radius)` (outer skin).
- **Back face**: same triangle, at `translateZ(radius - depth)` (inner skin), darker fill (`#7A5A28` @ 0.35) so we see "into" the crystal.
- **Side walls**: 3 thin quads connecting the edges of front→back. Rendered as separate `<div>`s with their own CSS transforms (`rotateY/rotateX` to align with each edge, then `scaleY` to the depth).
- **Depth**: ~6–10% of the sphere radius. Just enough to catch a different brightness than the front face when the rotor turns.

Result: as the ball spins, you see the bevelled side walls of each shard catch and lose light — the unmistakable look of cut glass.

The Lambertian lighting loop already computes a per-face normal; we extend it to also light the side walls (their normals are tangent to the sphere, perpendicular to the face normal). Each side wall gets its own brightness CSS var.

## 2. Per-shard organic motion (the "alive" part)

Each shard gets three independent, continuous motions layered on top of the rotor's spin:

- **Radial breathing** — every shard pulses in/out along its own normal (`translateZ` between `radius` and `radius + 4–8px`) on a per-shard phase offset. Period ~5–9s, randomized per shard. Gives a subtle "the crystal is breathing" feel.
- **Facet jitter** — tiny rotation around the shard's own normal (`rotateZ ±2°`) on a slow sine, different phase per shard. Makes adjacent facets shimmer-shift relative to each other.
- **Occasional bloom** — every ~6s a random shard briefly translates outward an extra ~6px and brightens (~1.5×) over 1.2s, then settles back. Reads like light catching one specific facet, then another. Sequenced so 1–2 shards are blooming at any moment.

All three are driven from the **same RAF loop** that already updates lighting — no new timers. Per-shard state is precomputed (phase offsets, periods, bloom schedule) and the loop writes:

- `--z-offset` (radial breath, px)
- `--rz` (jitter, deg)
- `--bloom` (0..1 multiplier on outward push + brightness)

Each shard's transform becomes:
`translate(...) rotateY(yaw) rotateX(-pitch) translateZ(calc(var(--base-r) + var(--z-offset) + var(--bloom) * 6px)) rotateZ(var(--rz))`

Brightness becomes:
`filter: brightness(calc(var(--b) + var(--bloom) * 0.5))`

## 3. Inner refraction layer (sells the "glass")

Behind the shards (closer to center, at `translateZ(radius * 0.55)`) add 6–8 small floating "inclusions" — tiny gradient orbs in lavender/teal/champagne that drift on slow random paths inside the sphere. Visible *through* the shards because shard fills are semi-transparent. This is the part that makes you feel the crystal has interior volume.

## 4. Edge sparkles (optional polish)

When a shard's bloom peaks, a tiny `<circle>` flashes at its centroid (200ms scale + fade). One simple keyframe, triggered by toggling a class via the same RAF scheduler.

## Files to change

- **`src/components/AvaraOrb.tsx`** — extend each face to a prism (front + back + 3 sides as separate child divs inside `.avara-shard`). Precompute per-shard `phase`, `breathPeriod`, `jitterPeriod`, and a shared `bloomSchedule` (next-bloom timestamp + which shard index). Extend RAF loop to also update side-wall brightness, write `--z-offset`/`--rz`/`--bloom` per shard, and trigger sparkle flashes. Add inner-inclusion divs (6–8) in a sibling layer with their own transforms updated each frame on slow Lissajous paths. Keep `.avara-core-glow` as the base warmth.

- **`src/styles.css`** — add `.avara-shard-front`, `.avara-shard-back`, `.avara-shard-side` styles (with `transform-style: preserve-3d`, backface, and per-element brightness via `--bs` for sides). Add `.avara-inclusion` with blur + mix-blend-mode. Add `.avara-sparkle` keyframe (scale 0→1.6, opacity 1→0, 200ms). Keep all existing rotor/scene/aura/contact rules.

- **`src/routes/index.tsx`** — no change.

## Performance

- 20 shards × 5 sub-elements (1 front + 1 back + 3 sides) = 100 nodes, plus ~8 inclusions. One RAF loop, all writes are CSS variables on existing elements (no DOM mutations after mount). No React re-renders after mount. Stays smooth at 60fps.

## Result

A slowly turning crystal where every shard has visible bevelled depth, breathes on its own rhythm, and occasionally one facet blooms outward with a tiny sparkle — a living geode, unmistakably 3D, unmistakably Avara. Wordmark stays untouched.