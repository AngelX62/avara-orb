# Avara — Rotating Crystal Shard Sphere

Replace the current translucent bubble orb with a **faceted crystal glass ball** made of shards that continuously rotates, giving a real 3D sense of depth — like a slowly turning gemstone catching light. Wordmark ("A V A R A · AI command assistant · Avitus") stays exactly as is.

## Visual concept

A sphere built from ~18–24 triangular/quadrilateral glass shards arranged like a low-poly gem. Each facet is semi-transparent with its own subtle gradient (ivory core → blush/champagne edges) so adjacent facets refract slightly differently. The whole ball rotates slowly and continuously around a tilted vertical axis (~22s per rotation), so the user always sees facets travelling across the silhouette — front-facing shards bright, side shards darker, back shards faintly visible through the glass.

Key qualities:
- **3D feel without WebGL**: pure SVG + CSS 3D transforms. Each shard is a `<polygon>` placed on its own `transform: rotateY(...) rotateX(...) translateZ(...)` plane inside a `transform-style: preserve-3d` container.
- **Continuous rotation**: one slow Y-axis spin (22s linear, infinite) + a very slow X-axis wobble (40s ease-in-out) so it never looks mechanical.
- **Light response**: a fixed directional "light" — facets whose normal faces the top-left get a brighter ivory/champagne fill; back-facing facets fade to ~25% opacity. We approximate this by precomputing a per-facet brightness based on its base orientation and modulating it with the current rotation angle via CSS custom properties updated through a single `requestAnimationFrame` loop (cheap, 1 RAF, ~60 lines).
- **Caustic core**: a soft inner glow (warm ivory + faint lavender/teal) sits at the center of the sphere and is visible *through* the shards — sells the "glass" feel.
- **Edge highlights**: each shard has a 0.4px champagne stroke that catches light as it passes the front.
- **Specular sparkles**: 2–3 tiny white dots that briefly flash on shard vertices as they rotate past the top-left light direction.

## Structure

```
.avara-stage
  .avara-vignette
  .avara-center
    .avara-orb
      .avara-contact            (ground shadow, breathes)
      .avara-aura               (warm caustic glow around ball)
      .avara-3d-scene           (perspective: 1200px)
        .avara-3d-rotor         (preserve-3d, rotates Y continuously + X wobble)
          .avara-core-glow      (centered sphere of warm light, behind shards)
          .avara-shard × N      (each: absolute, preserve-3d, own transform)
            <svg><polygon/></svg>
          .avara-sparkle × 3
      .avara-rim-glow           (2D radial behind/in-front for soft halo)
    .avara-wordmark             (UNCHANGED)
```

## Files to change

- `src/components/AvaraOrb.tsx` — full rewrite. Generate shard geometry from a low-poly icosphere (hardcoded vertex/face table, ~20 faces). For each face compute centroid + normal at rest; render a div per face with a CSS transform that places it as a tangent plane, containing an SVG polygon with the facet shape and gradient. A small `useEffect` runs an RAF loop that writes the current Y-rotation to a CSS variable `--rot` on `.avara-3d-rotor`; per-shard brightness is computed in CSS via `calc()` using each shard's stored `--base-angle` custom property (no per-frame React state).
- `src/styles.css` — replace orb-specific styles (`.avara-wobble`, `.avara-caustic-orbit*`, `.avara-pool-*`, `.avara-bead`) with new shard/3D styles: `.avara-3d-scene` (perspective), `.avara-3d-rotor` (preserve-3d + rotation animation), `.avara-shard` (backface-visibility, transition on opacity), `.avara-core-glow`, `.avara-sparkle`, plus new keyframes `avara-spin-y`, `avara-tilt-x`, `avara-sparkle-flash`. Keep `.avara-stage`, `.avara-vignette`, `.avara-center`, `.avara-wordmark`, `.avara-contact`, `.avara-aura` as-is (or lightly adjusted). Reduced-motion fallback freezes rotation at a flattering angle.
- `src/routes/index.tsx` — **no change**. Wordmark stays.

## Color palette (kept from current direction)

- Ivory core `#FFF7EA`, champagne rim `#D8B76A`, warm amber highlight `#FFB870`, soft blush `#F4A7B9`, lavender thinking `#C9A7FF`, teal signal `#78D6C6`, deep bronze edges `#7A5A28`. Each shard gradient picks 2–3 of these based on its position (top facets warmer/lighter, bottom facets cooler/blush).

## Performance

- ~22 DOM nodes for shards + 1 RAF loop writing one CSS variable. No canvas, no WebGL, no per-frame React renders. Reduced-motion users get a static tilted snapshot.

## Result

A slowly turning crystal sphere of glass shards — clearly 3D, premium, architectural — replacing the current bubble while keeping the same warm Avara palette and the existing wordmark below it untouched.