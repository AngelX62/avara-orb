## Avara prism — coral warmth refinement

This is a **color and accent pass only**. The faceted icosahedron prism, its 3D rotation, breathing, jitter, and bloom motion all stay exactly as they are. No geometry, layout, typography system, or page structure changes.

### Goals

- Inject controlled coral warmth (~10–15% of overall presence)
- Make the center more readable (slightly higher contrast/opacity)
- Reduce pale beige/champagne dominance
- Promote one or two facets to coral-accent role
- Repurpose the existing bloom animation as the "activation triangle" coral pop
- Update tagline text

### Changes

**1. `src/components/AvaraOrb.tsx` — palette + accent assignment**

- Introduce a small palette constant at the top of the file:
  - `CORAL_PRIMARY = "#F26D5B"`
  - `CORAL_LIGHT   = "#FF7A6B"`
  - `CORAL_DEEP    = "#E96A5B"`
  - Existing supporting tones kept: deep teal `#3E7A74`, charcoal `#2A2622`, muted violet `#8E7AA8`, smoky green `#6B7A65`, warm stone `#C9A98A`, dusty rose `#D49A92`.
- Designate **2 of the 20 facets as "coral accent" facets** (deterministic indices, e.g. face 4 and face 13 — chosen so one sits upper-right, one lower-left, ensuring at least one is usually camera-facing during rotation). All other facets keep their current zone-based palette but with the champagne/ivory presence reduced.
- Rebalance the zone palettes (used by the front-face linear gradient):
  - Top zone (`cy > 0.4`):   stone → muted violet → deep teal
  - Mid zone:                stone → dusty rose → smoky green
  - Bottom zone:             muted violet → deep teal → charcoal
  - Coral facets override:   `CORAL_LIGHT → CORAL_PRIMARY → CORAL_DEEP`
- Slightly raise opacity stops on the front gradient (e.g. `0.85 → 0.92`, `0.55 → 0.65`, `0.40 → 0.50`) so the prism reads more solidly at the center.
- Inner inclusions (`buildInclusions`): reduce champagne/ivory dots, replace with `CORAL_PRIMARY` ×1, deep teal ×2, muted violet ×2, dusty rose ×1, stone ×1, charcoal-warm ×1. Drop count from 8 → 6 to reduce noise.

**2. Activation triangle pop (reuse existing bloom system, no new animation cost)**

The existing RAF loop already picks a random shard for an occasional `--bloom`. Bias selection so the **two coral accent facets are 3× more likely** to be the chosen bloom target. When they bloom, multiply the bloom brightness factor in the inline `filter` so the coral shard "pops" more visibly than other facets (`var(--bloom) * 0.85` for coral vs `* 0.55` for others — controlled via a `--bloom-gain` per-shard CSS var). No new keyframes, no glow, no particles.

**3. `src/styles.css` — center warmth + aura tone**

- `.avara-core-glow` background gradient: shift the second stop from amber `rgba(255,184,112,0.55)` to coral `rgba(242,109,91,0.42)`, keep violet/teal stops, and bump the inner ivory stop alpha from `0.95 → 0.88` so coral reads through more. This delivers the "soft inner warmth near the center."
- `.avara-aura`: replace the amber inner stop with a softer coral `rgba(242,109,91,0.18)` and reduce overall intensity so the surrounding ambient is calmer (less beige bloom).
- `.avara-stage` background: nudge the radial-gradient stops toward a slightly cooler stone (`#F6F0E6 → #ECE3D4 → #E0D5C2`) so champagne dominance recedes.
- No changes to `.avara-shard*`, `.avara-inclusion`, transform-style, blend-modes, or motion.

**4. `src/routes/index.tsx` — tagline only**

- Change `<small>AI command assistant · Avitus</small>` → `<small>Lead intelligence assistant · Avitus</small>`
- Update `<head>` `title` and `meta description` to reflect "Lead Intelligence Assistant" (keeps SEO honest).
- AVARA wordmark unchanged (spacing, weight, casing).

### What stays exactly the same

- Icosahedron geometry (20 faces), prism front+back structure, bevel inset, vertex sparkle dot
- All RAF motion: spin (24s), tilt (40s), per-shard breath, jitter, bloom timing
- `transform-style: preserve-3d`, blend modes, drop-shadow stack
- Reduced-motion fallback
- File layout, route structure, design tokens

### Out of scope

- No WebGL/canvas/particles
- No new fonts, no nav, no extra sections
- No semantic token churn in `:root` / `.dark` (the prism uses its own palette by design — those tokens stay untouched)
