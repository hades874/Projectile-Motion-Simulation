# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**SIM-P1** — Physics Simulation Hub for 10 Minute School's TenTen platform. A Bangla-first, mobile-first React app that wraps PhET Interactive Simulations (University of Colorado Boulder, CC BY-NC 4.0) in the 10MS design system. Spec: `md/projectile_motion_simulator_prd.md`. Design system: `md/design.md`.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # production build
npm test         # vitest (physics unit tests)
npm run lint
```

## Architecture

React 18 + Vite SPA. React Router v6 in **hash mode** (iframe-embed safe).

**Two routes:**
- `/` → `SimSelector` — 10MS-styled landing page listing available PhET simulations
- `/sim/:simId` → `SimViewer` — full-height iframe embedding the PhET sim + 10MS header + CC BY-NC attribution

**Simulation catalog:** `src/data/simulations.js` — each entry holds Bangla/English titles, description, PhET CDN URLs (`_bn.html` and `_en.html`), topic chips, and tab labels.

**PhET embedding approach:**
- Bengali versions (`_bn.html`) are the default; an EN/BN language toggle in the header hot-swaps the `iframe src`
- The iframe takes `flex: 1` and fills all space between the 52px header and the attribution bar
- A loading spinner overlays the iframe until `onLoad` fires
- Fullscreen uses the browser Fullscreen API (`requestFullscreen` on the page container); CSS `:fullscreen` selector hides chrome when active

**State:** `useState` only inside `SimViewer` (lang, loading, isFullscreen). No global state needed.

## Key files

| File | Role |
|---|---|
| `src/data/simulations.js` | Catalog of PhET sims (IDs, URLs, Bangla metadata) |
| `src/components/Layout/SimSelector.jsx` | Landing page — sim cards with SVG illustrations |
| `src/components/Layout/SimViewer.jsx` | iframe wrapper, language toggle, fullscreen, attribution |
| `src/styles/tokens.css` | 10MS design tokens (from `md/design.md §3`) |
| `src/lib/physics.js` | Pure physics functions (kept for unit tests and future use) |
| `src/lib/physics.test.js` | 17 vitest tests covering the physics engine |

## Design system (10MS tokens)

Import `src/styles/tokens.css` in every component. Key rules from `md/design.md`:
- **Action color:** `--success` (`#1CAB55`) — primary buttons. Never red for CTAs.
- **Brand red:** `--ten-red` (`#E8001D`) — logo, curriculum labels, accents only.
- **Body text:** `--ten-ink` (`#111827`), never pure `#000`.
- **Cards:** `1px solid var(--border)` + `--r-xl` (24px) radius. Borders not shadows for elevation.
- **Fonts:** Inter (English) + Hind Siliguri (Bangla). Bangla blocks: `letter-spacing: 0.01em; line-height: 1.5`.
- **Spacing:** 4pt grid (`--s-1` … `--s-10`).
- **Motion:** 120–260 ms, `--ease-out`. No bounces/parallax. Honor `prefers-reduced-motion`.
- **Icons:** Lucide-style SVGs inline. No emoji in product UI.

## Adding a new simulation

1. Add an entry to `src/data/simulations.js` with `id`, Bangla/English metadata, PhET CDN URLs, `tabs`, `color`, `accentColor`
2. Optionally add a custom `SimIllustration` branch in `SimSelector.jsx`
3. No routing changes needed — `/sim/:simId` is dynamic

## Attribution (required by license)

Every page embedding a PhET sim must display:
> "PhET Interactive Simulations, University of Colorado Boulder — CC BY-NC 4.0 — https://phet.colorado.edu"

This is rendered in `SimViewer`'s `.attribution` bar. Do not remove it.

## Mobile-first constraints

- Design floor: **360 px width**
- All touch targets: minimum **44×44 px**
- No hover-only interactions
- Performance budget: initial JS bundle ≤ 200 KB gzipped (currently ~57 KB)
- iframe fills `100dvh` minus header + tabs + attribution bar (~80px total)
