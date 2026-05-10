## Avara prism — warm boutique palette shift

Color-only refinement. Geometry, motion, layout, and tagline stay as-is.

### Palette swap (in `src/components/AvaraOrb.tsx`)

Remove teal `#3E7A74` and smoky green `#6B7A65` entirely. Replace with a warm, boutique-property palette:

- `ESPRESSO   = #2A1F1A` (deep brown-black, anchors the dark zone)
- `GRAPHITE   = #3A332E` (warm charcoal)
- `SMOKY_BROWN = #5C4A3E`
- `WARM_TAUPE = #8C7867`
- `MUTED_PLUM = #6E5263`
- `DUSTY_ROSE = #C9A29A` (kept, slightly desaturated)
- `CHAMPAGNE  = #D9C4A3` (warm, not pale)
- `ROSE_GOLD  = #E8B89A` (highlight)
- `IVORY      = #F4E8D8` (highlight only)
- Coral kept: `CORAL_LIGHT #FF7A6B`, `CORAL_PRIMARY #F26D5B`, `CORAL_DEEP #E96A5B`

### Zone palettes (replace current 3-zone block)

- Top zone (`cy > 0.4`):   `WARM_TAUPE → MUTED_PLUM → GRAPHITE`
- Mid zone:                `CHAMPAGNE → DUSTY_ROSE → SMOKY_BROWN`
- Bottom zone:             `MUTED_PLUM → SMOKY_BROWN → ESPRESSO`
- Coral facets override:   `CORAL_LIGHT → CORAL_PRIMARY → CORAL_DEEP`

### Coral facet allocation

- Reduce coral facet count from 2 → keep 2, but pick **one upper-mid facet and one side facet** (avoid the large bottom-front facet that currently dominates). Update `CORAL_FACETS` indices to e.g. `[3, 14]` (one upper-right, one side-mid). Bloom bias logic stays — coral facets remain the primary "activation pop."
- Inner radial highlight on coral facets uses `ROSE_GOLD` instead of pinkish ivory, so the coral reads warm-metallic, not candy.

### Inclusions (inner floating spheres)

Replace current set with warm-only tones, no teal:
`[CORAL_PRIMARY, MUTED_PLUM, WARM_TAUPE, ROSE_GOLD, SMOKY_BROWN, DUSTY_ROSE]` — 6 total, unchanged motion.

### Back face (shard underside)

Current back gradient: `#7A5A28 → #15120F`. Shift to warmer espresso:
`#3A2820 → #15100C`, stroke `#3A2820`. Keeps depth, removes amber-yellow undertone.

### Center & ambient (in `src/styles.css`)

- `.avara-core-glow`: shift to a warmer, slightly darker mix so the center reads more solid:
  - `rgba(244, 232, 216, 0.78) 0%` (ivory, slightly less bright)
  - `rgba(242, 109, 91, 0.38) 25%` (coral)
  - `rgba(110, 82, 99, 0.40) 55%` (muted plum, replaces violet)
  - `rgba(92, 74, 62, 0.30) 78%` (smoky brown, replaces teal)
  - `rgba(244, 232, 216, 0) 100%`
- `.avara-aura`: warm coral + plum, no teal:
  - `rgba(242, 109, 91, 0.18) 0%`
  - `rgba(110, 82, 99, 0.10) 40%`
  - `transparent 70%`
- `.avara-stage` background: shift to a slightly deeper warm stone so the prism doesn't sit on washed beige — `#EFE5D4 → #E0D2BC → #C9B69C`.
- `.avara-contact` (contact shadow): nudge from amber-brown to neutral espresso `rgba(58, 40, 32, 0.20)`.

### Front gradient opacity

Keep the previously raised opacities (0.92 / 0.68 / 0.55) so the prism stays solid and readable. No change.

### Out of scope

- Geometry, RAF motion, breathing, jitter, bloom timing — unchanged.
- Wordmark and subtitle — unchanged ("AVARA" / "Lead intelligence assistant · Avitus").
- No new keyframes, no glow effects, no WebGL/canvas/particles.
- Design tokens in `:root`/`.dark` — untouched.

### Files touched

- `src/components/AvaraOrb.tsx` — palette constants, `CORAL_FACETS` indices, zone palette block, inclusion palette, back-face gradient, inner highlight color.
- `src/styles.css` — `.avara-core-glow`, `.avara-aura`, `.avara-stage`, `.avara-contact`.
