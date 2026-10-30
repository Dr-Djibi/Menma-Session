# Palette's Journal - Menma-MD Session Generator

## 2025-05-18 - Quick Country Prefix Chips Input Auto-Focus & Screen Reader Labelling
**Learning:** In mobile-first pairing pages, tapping quick prefix chips without auto-focusing the input forces users to perform an additional manual tap to place the cursor in the input field. Furthermore, emoji/code chip buttons lack descriptive context for screen reader users.
**Action:** Always auto-focus the target input when selecting preset chip options and provide descriptive `aria-label` attributes containing the full country name and code.

## 2025-05-19 - 3D Particle Globe Landmass Mapping & Canvas Accessibility
**Learning:** Pure mathematical particle spheres lack geographical context and fail to convey a "world map" representation to users. Sampling grid particles against latitude/longitude continent coordinates transforms abstract particle spheres into recognizable 3D Earth maps. Adding `role="img"` and a descriptive `aria-label` to WebGL `<canvas>` elements ensures screen readers convey the visual context accurately.
**Action:** Use latitude/longitude landmass coordinate sampling for 3D globe visualizations, and always provide explicit `role="img"` and descriptive `aria-label` tags on WebGL canvas elements.

## 2025-05-20 - WAI-ARIA Accordion Pattern for Collapsible FAQ Components
**Learning:** Collapsible accordion buttons that only use `aria-expanded` leave screen reader users unaware of which content region is being toggled. Linking the accordion trigger button to its panel container via explicit `aria-controls`, `id`, `role="region"`, and `aria-labelledby` ensures assistive technologies properly announce expanded regions and convey relationships.
**Action:** Always link accordion trigger buttons to collapsible panels using explicit matching `id`, `aria-controls`, `role="region"`, and `aria-labelledby` attributes.
