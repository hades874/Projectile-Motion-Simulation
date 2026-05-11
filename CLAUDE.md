# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**SIM-P1** — Physics Simulation Hub for 10 Minute School's TenTen platform. A Bangla-first, mobile-first React app with two fully custom HTML5 Canvas simulations: **Forces and Motion** (Junior) and **Projectile Motion** (Senior). Spec: `md/projectile_motion_simulator_prd.md`. Design system: `md/design.md`.

Curriculum alignment: SSC Chapter 2 + HSC Chapter 3 (Bangladeshi board-exam format). The simulator teaches range symmetry (30°/60° pairs yield same R), and presents problems in the board-exam style: "v₀=20, θ=30° দেওয়া আছে → R, H, T নির্ণয় কর".

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # production build
npm test         # vitest — 17 physics unit tests
npm run lint
```

Run a single test file:
```bash
npx vitest src/lib/physics.test.js
```

## Architecture

React 18 + Vite SPA. React Router v6 in **hash mode** (iframe-embed safe).

**Routes:**
- `/` → `ModeSelect` — landing page: choose Junior (Forces) or Senior (Projectile Motion)
- `/junior` → `ForceScreen` — Forces and Motion simulation (4 tabs: Net Force, Motion, Friction, Tug of War)
- `/senior` → `SeniorPage` → `SeniorScreen` — full-featured projectile motion sim

### ModeSelect layout

`ModeSelect` (`src/components/Layout/ModeSelect.jsx`) has three sections:

1. **Hero band** (`heroSection`) — gradient background (`#FFF5F6 → #fff`), decorative corner SVG geometry (clipped by `overflow: hidden` on the section, NOT on `.page`), brand row, headline, subtitle, and an animated `TrajectoryHero` canvas.

2. **Scrollable content** (`content`) — two numbered section labels with Bengali kicker text, product cards, and a features rail:
   - **Cards** (`juniorCard` / `seniorCard`) — each has a featured color bar (top 3px), SVG icon, tag+age row, title+sub, arrow affordance, and a 3-column stats strip (dashed border-top). Cards use inline SVG components `ForcesIcon` and `ProjectileIcon` (not `<img>` tags).
   - **Features rail** (`featuresRail`) — 3-column grid of `featureTile` items (real-time, board-standard, Bangla).

3. **Sticky bottom callout** (`bottomCallout`) — `position: sticky; bottom: 0`, blur backdrop, green "শুরু করো →" CTA navigating to `/senior`.

**CSS sticky note:** `.page` must NOT have `overflow-x: hidden` — doing so would implicitly set `overflow-y: auto` (CSS spec), making `.page` a scroll container and breaking `position: sticky` on `.bottomCallout`. The hero section's own `overflow: hidden` clips the geo SVGs instead.

**`TrajectoryHero`** — inline sub-component; uses `requestAnimationFrame` to animate a red ball along a 45° parabola ghost arc. Checks `window.matchMedia('(prefers-reduced-motion: reduce)')` before starting RAF — if true, renders the full arc statically (`t=1`) with no animation. Canvas drawn at `devicePixelRatio` scale for sharpness on Retina/high-DPI screens.

Bangla strings in JSX use actual UTF-8 characters. Do NOT write bare `\uXXXX` escapes in JSX text nodes (between tags) or JSX attribute strings \u2014 JSX does not process JS escape sequences there, so they render as literal backslash text. JS string literals inside `{" "}` expressions do process `\uXXXX` correctly if needed.

### Forces and Motion (Junior)

`ForceScreen` owns `useForceSimulator`. Four tabs, each with a canvas + controls panel:
- **নেট বল (Net Force):** Toggle up to 4 pushers per side on a cart. F_net arrows update live.
- **গতি (Motion):** Sliding force on object presets (skate/box/fridge/car). Friction toggle.
- **ঘর্ষণ (Friction):** Same as Motion but adds a live F vs F_friction graph.
- **টানা-হেঁচড়া (Tug of War):** Two 4-person teams. Rope moves to winning side. Win overlay.

### Projectile Motion (Senior)

`SeniorPage` wraps `useSimulator('senior')` and renders `SeniorScreen`. Split layout:
- Left: canvas (trajectory + animation)
- Right panel: sliders for v₀/θ/h₀, result cards (R, H, T, v_impact)
- Bottom: action bar (launch/pause/speed/reset) + collapsible tabs (vectors/formulas/graphs/comparison)

**Mobile canvas constraint (≤639px):** `canvasContainer` is `flex: none; height: 220px` (fixed, smaller) and `sidebar` becomes `flex: 1; height: auto` (takes remaining space). Desktop (≥1024px) layout is unchanged.

### Forces simulation state

`useForceSimulator` (`src/hooks/useForceSimulator.js`) — `useReducer` with shape:
```
{
  activeTab: 'netforce'|'motion'|'friction'|'tug',
  netforce: { leftPushers[4], rightPushers[4], cartX, cartV, isRunning },
  motion:   { Fapplied, selectedObject, frictionOn, boxX, boxV, isRunning },
  friction: { Fapplied, surface, mass, boxX, boxV, isRunning },
  tug:      { leftTeam[4], rightTeam[4], ropeX, ropeV, isRunning, winner },
}
```
Actions: SET_TAB, TOGGLE_PUSHER, SET_PARAM, START, PAUSE, RESET, TICK.
The TICK action runs physics integration (F=ma, friction, clamping) for the active tab.

Forces physics in `src/lib/forcesPhysics.js`: `netForceFromPushers`, `frictionForce`, `netMotionForce`, `step`, `clamp`, `accel`. Object/surface presets exported as `OBJECTS` and `SURFACES`.

Canvas drawing in `src/lib/forceCanvas.js`: four draw functions (`drawNetForce`, `drawMotion`, `drawFriction`, `drawTug`) — called by `ForceCanvas` component.

### Projectile simulation state

State lives in the **`useSimulator` hook** (`src/hooks/useSimulator.js`) using `useReducer`. Shape:

```
{
  mode: 'junior' | 'senior',
  params: { v0, theta, h0, g },
  animation: { status: 'idle'|'playing'|'paused'|'finished', t, speed },
  overlays: { vectors, dots, axes, formulas, graphs },   // senior only
  display: { numerals: 'bangla' | 'western' },
  results: { T, H, R, impact },
  comparison: null | { params, results },
  degenerate: null | 'flat' | 'vertical' | 'no-velocity',
}
```

The hook exports memoized action dispatchers (e.g. `setParam`, `launch`, `pause`, `reset`, `setComparison`). Components never call `dispatch` directly.

**Degenerate states** (`isDegenerate` in physics.js) must be checked before drawing — `flat` (θ=0), `vertical` (θ=90°), and `no-velocity` (v0=0) all produce undefined or trivial trajectories.

### Animation & rendering loop

- `useAnimationFrame` hook — `requestAnimationFrame` + delta timing, drives `animation.t` forward
- `useViewport` hook — `ResizeObserver` on the canvas container, provides `{width, height}`
- `SimCanvas` redraws on every `animation.t` change via `useEffect` dependencies
- Canvas primitives are in `src/lib/canvas.js` (11 functions: scale, transform, grid, axes, trajectory, ball, vectors, launcher, arrow)

### Physics engine (`src/lib/physics.js`)

Nine exported pure functions:

| Function | Returns |
|---|---|
| `timeOfFlight(v0, θ, h0)` | Total flight time T |
| `maxHeight(v0, θ, h0)` | Peak altitude H |
| `range(v0, θ, h0)` | Horizontal distance R |
| `position(v0, θ, h0, t)` | `{x, y}` at time t |
| `velocity(v0, θ, t)` | `{vx, vy, speed}` at time t |
| `impactVelocity(v0, θ, h0)` | Impact angle + speed |
| `trajectoryPoints(v0, θ, h0)` | 201 sample `{x,y}` points for canvas |
| `computeResults(v0, θ, h0)` | `{T, H, R, impact}` all at once |
| `isDegenerate(v0, θ, h0)` | `null \| 'flat' \| 'vertical' \| 'no-velocity'` |

### Localization

All Bangla UI strings live in `src/content/`:
- `forces.bn.json` — tab names, labels, actions, object/surface names for Forces sim
- `senior.bn.json` — tabs, controls, overlay labels, speed options for Projectile sim
- `glossary.bn.json` — physics term definitions (v₀, θ, h₀, R, H, T, g, vₓ, vᵧ)

No English fallback — Bangla-only by design. Numeral conversion in `src/lib/bangla.js`: `toBn(n)`, `toEn(n)`, `formatNum(value, 'bangla'|'western', decimals)`. All readouts honor `display.numerals`.


## Key files

| File | Role |
|---|---|
| `src/hooks/useSimulator.js` | Projectile motion state (`useReducer`) — accepts `initialMode` param |
| `src/hooks/useForceSimulator.js` | Forces & Motion state (`useReducer`) — 4-tab simulation |
| `src/hooks/useAnimationFrame.js` | RAF loop with delta timing |
| `src/hooks/useViewport.js` | ResizeObserver for canvas dimensions |
| `src/lib/physics.js` | Projectile motion physics (9 pure functions) |
| `src/lib/forcesPhysics.js` | F=ma physics — friction, net force, step, clamp |
| `src/lib/canvas.js` | Projectile canvas drawing primitives (11 functions) |
| `src/lib/forceCanvas.js` | Forces canvas drawing — 4 tab draw functions |
| `src/lib/bangla.js` | Numeral conversion utilities |
| `src/lib/physics.test.js` | 17 vitest tests (projectile physics) |
| `src/content/forces.bn.json` | Bangla strings for Forces simulation |
| `src/content/senior.bn.json` | Bangla strings for Projectile simulation |
| `src/content/glossary.bn.json` | Physics term definitions |
| `src/styles/tokens.css` | 10MS design tokens |
| `src/components/Layout/ModeSelect.jsx` | Landing page — hero, animated canvas, cards, sticky callout |
| `src/components/Layout/ModeSelect.module.css` | ModeSelect styles — heroSection, cards, featuresRail, bottomCallout |
| `src/components/Layout/ForceScreen.jsx` | Forces sim — 4-tab shell with ForceCanvas |
| `src/components/Layout/SeniorPage.jsx` | Wrapper: `useSimulator('senior')` → SeniorScreen |
| `src/components/Layout/SeniorScreen.jsx` | Projectile sim — split canvas/panel layout |
| `src/components/Forces/*.jsx` | NetForceTab, MotionTab, FrictionTab, TugOfWarTab, ForceCanvas |
| `src/components/Simulator/SimCanvas.jsx` | Projectile canvas + animation loop |

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

## Mobile-first constraints

- Design floor: **360 px width**
- All touch targets: minimum **44×44 px**
- No hover-only interactions
- Performance budget: initial JS bundle ≤ 200 KB gzipped (currently ~57 KB)
- Canvas fills `100dvh` minus header + controls (~80px total)

## Common extension patterns

**Add a new overlay toggle (e.g. "show velocity components"):**
1. Add a boolean key to `overlays` in the reducer initial state (`useSimulator.js`)
2. Read the flag in `SimCanvas.jsx` and pass it to the relevant `canvas.js` drawing function
3. Add a toggle in `SeniorScreen`'s vectors tab; add the label string to `senior.bn.json`

**Add a new Forces tab scenario:**
1. Add a new tab entry to `TABS` in `ForceScreen.jsx`
2. Add the tab state slice to `makeInitial()` in `useForceSimulator.js`
3. Handle `TICK` and `RESET` for the new tab in the reducer
4. Create a new `XxxTab.jsx` in `src/components/Forces/`
5. Add a draw function to `forceCanvas.js`
6. Add Bangla strings to `forces.bn.json`

**Modify gravity constant:** `g` is a user-controllable param in `params.g`, not a hardcoded constant.
