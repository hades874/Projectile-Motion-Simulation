# Projectile Motion Simulator — Product Requirements Document

| Field | Value |
|---|---|
| **Project codename** | SIM-P1 |
| **Owner** | cm.ops, Content Operations, 10 Minute School |
| **Document status** | Draft v1.0 — Planning |
| **Last updated** | 02 May 2026 |
| **Target platform** | TenTen (10 Minute School), mobile-first web |
| **Source references** | Internal `Simulation_Development_Instructions.md` (TenTen sims mandate, §4.2.1 mobile checklist, SIM-P1 spec) |

---

## 1. Executive summary

A Bangla-first, mobile-first interactive simulation of projectile motion under vacuum, built as a custom React + HTML5 Canvas + Recharts web app. The simulator targets two student segments — **Junior (Class 6–8)** for concept introduction and **Senior (Class 9–10 / HSC)** for board-aligned deep study — with a single underlying physics engine and two distinct UI modes. V1 ships pure vacuum motion; air resistance, planet selector, and gamified challenges are deferred to later versions.

**Primary success metric for V1:** a Class 9 student can use the simulator on a low-end Android phone over 3G to discover, on their own, why launches at 30° and 60° give the same range — without reading any external explanation.

---

## 2. Background and context

### 2.1 The internal mandate

10MS's TenTen platform identified projectile motion as the highest-priority simulation need (5 occurrences in content data, most-documented Physics sim need). The original internal proposal (`Simulation_Development_Instructions.md`, SIM-P1) recommended forking the PhET "Projectile Motion" simulation, swapping UI strings to Bangla, and embedding via iframe at an estimated 2–3 dev-days.

### 2.2 Why we are building custom instead of forking PhET

After review, this PRD deviates from the PhET-fork plan and proposes building from scratch on React + HTML5 Canvas + Recharts. Reasons:

1. **Mobile fit.** PhET sims are built on the Scenery framework and were originally desktop-first. Their mobile experience, while improved, doesn't natively meet TenTen's strict mobile checklist (44 px touch targets, 360–414 px portrait, sub-5 s load on 3G).
2. **Localization depth.** "Replace UI strings" undersells the work. PhET's text is woven through Scenery scene-graph nodes; Bangla rendering, font loading, and numeral conversion (১২৩ vs 123) are non-trivial inside a fork.
3. **NCTB alignment.** PhET terminology, defaults, and pedagogical framing follow the US/AP curriculum. Aligning to NCTB Chapter 2 (SSC) and HSC 1st Paper Chapter 3 from inside a fork means fighting the framework.
4. **Bundle size.** A typical PhET sim is several MB. A focused custom build can ship under 250 KB gzipped — material on 3G.
5. **Future extensibility.** Custom code means features like comparison mode, NCTB problem presets, and eventual lesson embedding fit naturally. A fork keeps us perpetually downstream of PhET upstream.

**Trade-off accepted:** ~5–7 dev-days for V1 vs. 2–3 for a PhET fork. We accept this as a one-time investment that pays off across the full simulation roadmap.

### 2.3 Curriculum context

| Segment | Curriculum reference | Coverage |
|---|---|---|
| Junior (Class 6–8) | NCTB বিজ্ঞান, basic motion concepts | Informal — projectile not formally covered |
| SSC (Class 9–10) | NCTB পদার্থ বিজ্ঞান, Chapter 2 — গতি | 2D motion introduced; projectile usually as worked example |
| HSC | HSC Physics 1st Paper, Chapter 3 (Kinematics) | Full projectile treatment: equations, derivations, problems |

Board-exam pattern: numerical questions of the form "v₀ = 20 m/s, θ = 30° দেওয়া আছে — R, H এবং T নির্ণয় কর।" The simulator must let students validate textbook answers visually.

---

## 3. Goals and non-goals

### 3.1 Goals (V1)

1. Let a Bangladeshi physics student set v₀ and θ and instantly see the trajectory.
2. Display R, H, T live as parameters change, with the formulas visible.
3. Make the H–R trade-off across angles intuitive without text instruction.
4. Run smoothly on a low-end Android phone (≤ 2 GB RAM) over 3G.
5. Read entirely in Bangla (with Western/Bangla numeral toggle, see §10.3).
6. Serve two student segments with distinct UI density.
7. Ship as a standalone deployable Vercel app, ready to embed via iframe later.

### 3.2 Non-goals (V1)

1. Air resistance, drag, wind, Magnus effect.
2. Planet/gravity selector.
3. Gamification (targets, scoring, levels).
4. User accounts, saved progress, history.
5. Real-world object presets (cricket ball, javelin, football).
6. Analytics / event tracking.
7. Accessibility audit (keyboard nav, screen reader, contrast).
8. English-first UI (V1 is Bangla-only; English string layer in V2).
9. Live embedding inside TenTen lesson pages (designed embed-ready, but actual embedding is V2).
10. Challenges, quizzes, "predict before you launch" prompts.

---

## 4. Users and segmentation

### 4.1 Two-segment model

The app launches with a one-tap mode switch on the home screen:

- **জুনিয়র (৬–৮ শ্রেণি)** — Junior
- **সিনিয়র (৯–১০ ও এইচএসসি)** — Senior

Mode is remembered for the session. (Cross-session persistence is V2.)

### 4.2 Junior mode (Class 6–8)

**Purpose:** First exposure to "what happens when you throw something." No formal physics expected.

**UI characteristics:**
- Friendly framing: a character/launcher (final art per `design.md`).
- Two controls only: speed (গতি) and angle (কোণ) — sliders only, no numeric input.
- Outputs labeled in everyday Bangla: "কত দূরে গেল", "কত উঁচুতে উঠল", "কতক্ষণ আকাশে ছিল"
- No vector overlays, no formula panel, no graphs — none of that exists in this mode.
- A single "এটা কী?" button opens a 3-screen illustrated explainer.
- A small visual flourish when the ball lands — engagement, not gamification.

**What's hidden in Junior mode:** numerical inputs, component velocities, vector overlays, formula panel, graphs, comparison mode.

### 4.3 Senior mode (Class 9–10 and HSC)

**Purpose:** Board-exam-aligned exploration and verification.

**UI characteristics:**
- Three controls: v₀, θ, h₀, with both slider **and** numeric input.
- Formal Bangla terminology aligned with NCTB.
- Live readouts: R, H, T, |v at impact|, angle at impact.
- Vector overlay (toggleable, on by default): v, vₓ, vᵧ, g.
- Equally-spaced time-stamped dots along the trajectory (toggleable).
- Side panel with formulas and live-substituted values.
- Graphs panel (y-t, vᵧ-t) — collapsible, off by default to preserve mobile screen space.
- Comparison mode: launch a second (ghost) projectile with different params; both animate together.

**Implicit progression:** A Senior student can collapse all advanced overlays and use the sim simply, then expand them as understanding grows.

---

## 5. V1 feature scope

### 5.1 Core simulator (both modes)

| # | Feature | Junior | Senior |
|---|---|---|---|
| F-1 | Set initial velocity v₀ via slider | ✓ (labeled "গতি") | ✓ (slider + numeric, "প্রাথমিক বেগ") |
| F-2 | Set launch angle θ via slider | ✓ ("কোণ") | ✓ (slider + numeric, "উৎক্ষেপণ কোণ") |
| F-3 | Set initial height h₀ | — (fixed at 0) | ✓ (slider + numeric, "প্রাথমিক উচ্চতা") |
| F-4 | Drag-on-canvas to set angle and velocity (touch-friendly) | ✓ | ✓ |
| F-5 | Live trajectory preview (updates as sliders move) | ✓ | ✓ |
| F-6 | Launch button to animate ball along the trajectory | ✓ | ✓ |
| F-7 | Reset button | ✓ | ✓ |
| F-8 | Pause / resume during animation | — | ✓ |
| F-9 | Slow-motion (0.5× / 1× / 2×) | — | ✓ |

### 5.2 Senior-only features

| # | Feature | Description |
|---|---|---|
| F-10 | Vector overlay | Live v vector with vₓ, vᵧ components, plus g pointing down |
| F-11 | Time-stamped trajectory dots | Equal-time dots along the parabola — visual proof of equal-Δt-unequal-Δx |
| F-12 | Formula panel | Live formulas with substituted values for R, H, T |
| F-13 | Graphs panel | y-t and vᵧ-t graphs (Recharts); updates when params change |
| F-14 | Comparison mode | Add a second projectile (different colour, dashed); both animate together |
| F-15 | Concepts panel | Collapsible side panel with NCTB-aligned theory snippets |

### 5.3 Junior-only features

| # | Feature | Description |
|---|---|---|
| F-16 | Illustrated 3-screen explainer | "ছোঁড়া কী?", "কেন নিচে নেমে আসে?", "নিজে চেষ্টা করো!" |
| F-17 | Friendly outcome readouts | "৩৫ মিটার দূরে গেল!" rather than R = 35 m |
| F-18 | Landing celebration | Small visual flourish (confetti or bounce) when ball lands |

### 5.4 Cross-cutting features

| # | Feature | Description |
|---|---|---|
| F-19 | Mode switcher | One-tap toggle between Junior and Senior on the home screen and in the header |
| F-20 | Numeral toggle | Display digits as ০–৯ or 0–9 (default: ০–৯ in Junior, 0–9 in Senior) |
| F-21 | Tooltip on every control | Tap-and-hold reveals a one-sentence Bangla definition |
| F-22 | Reset to defaults | Restores v₀ = 20 m/s, θ = 45°, h₀ = 0 |

> **Scope-cut candidate:** If V1 dev time stretches, Comparison Mode (F-14) is the first feature to defer to V2. Rationale: highest implementation cost relative to flexibility, and the H–R trade-off can still be discovered with single-projectile slider sweeps.

---

## 6. Physics specification

### 6.1 Equations (vacuum, 2D, closed-form)

Position at time t (initial height h₀):

- x(t) = v₀ · cos(θ) · t
- y(t) = h₀ + v₀ · sin(θ) · t − ½ · g · t²

Velocity components:

- vₓ(t) = v₀ · cos(θ)  *(constant)*
- vᵧ(t) = v₀ · sin(θ) − g · t

Derived quantities:

- **Time of flight** (h₀ = 0): T = 2 v₀ sin(θ) / g
- **Time of flight** (h₀ > 0): solve y(T) = 0 with the quadratic formula:
  T = [v₀ sin(θ) + √((v₀ sin(θ))² + 2 g h₀)] / g
- **Maximum height:** H = h₀ + (v₀ sin(θ))² / (2g)
- **Range:** R = x(T)
- **Speed at impact:** |v(T)| = √(vₓ² + vᵧ(T)²)
- **Angle at impact:** arctan(|vᵧ(T)| / vₓ)

### 6.2 Constants and ranges

| Parameter | Symbol | Range | Default | Step | Units |
|---|---|---|---|---|---|
| Initial velocity | v₀ | 0 – 100 | 20 | 1 (slider), 0.1 (numeric) | m/s |
| Launch angle | θ | 0 – 90 | 45 | 1 (slider), 0.1 (numeric) | degrees |
| Initial height | h₀ | 0 – 50 | 0 | 1 (slider), 0.1 (numeric) | m |
| Gravitational acceleration | g | fixed | 9.8 | — | m/s² |

### 6.3 Edge cases

| Case | Behaviour |
|---|---|
| θ = 0° and h₀ = 0 | Ball rolls along ground; show degenerate case + tooltip "এই কোণে কোনো প্রক্ষেপ নেই — কোণ বাড়ান।" |
| θ = 90° and h₀ = 0 | Vertical launch and return; render as a vertical line with offset for visibility |
| v₀ = 0 | No motion; show prompt "গতি বাড়ান।" |
| Trajectory exceeds canvas bounds | Auto-scale camera (fit-to-trajectory) so the full parabola is always visible with a 10% padding margin |

### 6.4 Numerical strategy

No numerical integration required — closed-form analytical solution is exact for vacuum motion. Generate **200 sample points** along the trajectory for smooth canvas/chart rendering, but use the formulas directly for any specific (x, y, vₓ, vᵧ) lookup. This keeps CPU near zero and lets the device focus on smooth animation.

### 6.5 Units

All SI: metres, seconds, m/s, degrees. No imperial units anywhere.

---

## 7. UX flows

### 7.1 First-launch flow

1. App loads → 10MS splash (≤ 500 ms).
2. Mode-select screen: two large tappable cards — Junior and Senior.
3. Selection is remembered for the session.

### 7.2 Junior mode flow

1. Land on simulator with a friendly launcher visible, ball at origin, default trajectory previewed.
2. Two sliders below: "গতি" and "কোণ" with arrow labels ("ধীর ←→ দ্রুত", "নিচু ←→ উঁচু").
3. Big launch button: "ছুঁড়ে দাও!"
4. Animation plays; ball lands; readouts appear: "৩৫ মিটার দূরে গেল!", "১১ মিটার উঁচুতে উঠেছিল!", "৩ সেকেন্ড আকাশে ছিল!"
5. Reset button: "আবার চেষ্টা করো"
6. "এটা কী?" at top-right opens 3-screen explainer.

### 7.3 Senior mode flow

1. Land on simulator with a denser layout: launcher + trajectory + readouts strip visible from the start.
2. Three sliders (v₀, θ, h₀) with numeric inputs alongside.
3. Live trajectory preview updates as sliders move (no need to launch to see the path).
4. Tap "উৎক্ষেপণ" to animate the ball.
5. Readouts strip always visible: R, H, T, v at impact, angle at impact.
6. Bottom-sheet tabs (collapsed by default): "ভেক্টর", "সূত্র", "গ্রাফ", "তুলনা".
7. Reset button: "রিসেট"

### 7.4 Mode switching mid-session

A small icon in the header toggles modes. Switching resets the simulator to the new mode's defaults (no carry-over of state, to avoid confusion).

---

## 8. Information architecture

```
/
├── splash (~500 ms)
└── /mode-select
    ├── /junior
    │   ├── simulator (main)
    │   └── /explainer (3-screen modal)
    └── /senior
        ├── simulator (main)
        └── side panels (bottom sheets on mobile, side panel on desktop)
            ├── vectors
            ├── formulas
            ├── graphs
            └── comparison
```

Routes: simple SPA with React Router in **hash mode** for iframe-embed safety (avoids server config dependencies).

---

## 9. Mobile-first design specifications

### 9.1 Viewport targets

Design for **360 px width as the floor**. Verify at 360, 390, 414, 768, 1024, 1440. Portrait by default; landscape is supported on phones but is not the primary layout.

### 9.2 Mobile portrait layout (360–414 px)

```
┌─────────────────────────┐
│ Header (mode switcher)  │  48 px
├─────────────────────────┤
│                         │
│   Canvas (sim)          │  ~45 vh
│                         │
├─────────────────────────┤
│ Live readouts strip     │  ~10 vh
├─────────────────────────┤
│ Sliders + inputs        │  ~25 vh
├─────────────────────────┤
│ Action buttons          │  ~10 vh
├─────────────────────────┤
│ Bottom sheet tabs       │  collapsed
└─────────────────────────┘
```

### 9.3 Touch targets

- All interactive elements: minimum **44 × 44 px** (per TenTen mandate).
- Slider thumbs: 48 × 48 px hit area, even if visually smaller.
- Tap-and-hold for tooltips. **No hover dependence anywhere.**

### 9.4 Performance budget

| Metric | Target |
|---|---|
| First contentful paint (3G) | ≤ 2.0 s |
| Time to interactive (3G) | ≤ 5.0 s |
| Initial JS bundle (gzipped) | ≤ 200 KB |
| Total initial assets | ≤ 350 KB |
| Animation FPS (low-end Android) | ≥ 30 |
| Animation FPS (modern devices) | 60 |

### 9.5 Iframe / WebView readiness

- No external scrollbars triggered by the sim.
- All interactions work inside an iframe sandbox with `allow="autoplay"`, no special permissions.
- Test inside a 360 × 640 iframe before V1 sign-off (per TenTen mandate).

### 9.6 Device rotation

On rotation, recompute canvas dimensions; preserve all simulator state (v₀, θ, h₀, mid-flight position).

---

## 10. Bangla language requirements

### 10.1 Font

- Primary font: **Hind Siliguri** (Google Fonts) — full Bangla + Latin support. Final choice deferred to `design.md`.
- Subset to Bangla glyphs only (drop unused scripts) to keep weight low.
- Preload with `font-display: swap`; system Bangla font is the fallback during load.

### 10.2 Terminology mapping (NCTB-aligned, draft)

| English | Bangla | Notes |
|---|---|---|
| Projectile motion | প্রাসের গতি / প্রক্ষেপ গতি | Verify against NCTB Class 9–10 textbook |
| Initial velocity (v₀) | প্রাথমিক বেগ | |
| Launch angle (θ) | উৎক্ষেপণ কোণ | |
| Initial height (h₀) | প্রাথমিক উচ্চতা | |
| Range (R) | অনুভূমিক পাল্লা / পাল্লা | |
| Maximum height (H) | সর্বোচ্চ উচ্চতা | |
| Time of flight (T) | উড্ডয়নকাল | |
| Acceleration due to gravity (g) | অভিকর্ষজ ত্বরণ | |
| Velocity | বেগ | |
| Speed | দ্রুতি | |
| Trajectory | গতিপথ | |
| Horizontal | অনুভূমিক | |
| Vertical | উলম্ব | |
| Component | উপাংশ | |
| Reset | রিসেট | |
| Launch | উৎক্ষেপণ (Senior) / ছুঁড়ে দাও (Junior) | |
| Pause | বিরতি | |
| Play | চালু | |

> **Action item:** Validate every term in this table against the NCTB Class 9–10 Physics textbook (Chapter 2 — গতি) and HSC Physics 1st Paper Chapter 3 before locking the string file. Get content team sign-off before string freeze.

### 10.3 Numerals

- **Junior default:** Bangla numerals (০–৯) for friendliness.
- **Senior default:** Western numerals (0–9) for textbook consistency.
- A toggle in the header lets either segment override the default.

### 10.4 String externalization

All UI strings live in `/content/junior.bn.json` and `/content/senior.bn.json` from day one, even though we ship Bangla-only. This makes future multi-language work mechanical, not architectural.

---

## 11. Tech architecture

### 11.1 Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | React 18 + Vite | Smaller bundle than Next.js for a static SPA, faster HMR than CRA |
| Animation | HTML5 Canvas via `requestAnimationFrame` | No animation library; full control over frame budget |
| Charts | Recharts (Senior only, lazy-loaded) | User-specified; tradeoff documented as a risk in §14.2 |
| Styles | Defer to `design.md` (CSS modules or Tailwind) | — |
| State | React `useState` + `useReducer` | No Redux/Zustand needed at V1 scale |
| Routing | React Router v6, hash mode | Iframe-embed safe |
| Deployment | Vercel (free tier) | Per user spec |
| Browser target | ES2020, modern evergreen | No IE; Android Chrome ≥ 90, iOS Safari ≥ 14 |

### 11.2 Module structure

```
/src
  /components
    /Simulator
      Canvas.jsx              — main rAF animation
      ControlPanel.jsx        — sliders + numeric inputs
      Readouts.jsx            — live R, H, T strip
      VectorOverlay.jsx       — v, vx, vy, g vectors (canvas-drawn)
      TrajectoryDots.jsx      — equal-time dots (canvas-drawn)
      Graphs.jsx              — Recharts wrapper (lazy)
      ComparisonMode.jsx      — second projectile (lazy)
      LaunchButton.jsx
    /Layout
      Header.jsx
      ModeSelect.jsx
      JuniorScreen.jsx
      SeniorScreen.jsx
      BottomSheet.jsx
    /Common
      Slider.jsx              — 48 px thumb, mobile-first
      NumberInput.jsx
      Tooltip.jsx             — tap-and-hold, no hover
      Toggle.jsx
      Button.jsx
  /lib
    physics.js                — pure functions: trajectory, R, H, T, v(t)
    bangla.js                 — number formatting (১২৩ ↔ 123)
    canvas.js                 — drawing helpers (vectors, dots, parabola)
  /content
    junior.bn.json
    senior.bn.json
    glossary.bn.json
  /styles
    tokens.css                — colors, spacing, typography (per design.md)
    global.css
  /hooks
    useSimulator.js           — central simulator state hook
    useAnimationFrame.js
    useViewport.js            — for responsive canvas
  App.jsx
  main.jsx
```

### 11.3 State shape (sketch)

```js
{
  mode: 'junior' | 'senior',
  params: { v0, theta, h0, g },
  comparison: null | { v0, theta, h0 },
  animation: {
    status: 'idle' | 'playing' | 'paused' | 'finished',
    t: 0,            // current sim time (s)
    speed: 1,        // playback speed multiplier
  },
  overlays: { vectors, dots, axes, formulas, graphs },  // booleans
  display: { numerals: 'bangla' | 'western' },
}
```

### 11.4 Rendering strategy

- **Canvas owns simulator visuals** (parabola, ball, vectors, dots, axes, grid). Re-renders only on RAF tick.
- **React owns the chrome** (controls, readouts, panels). Re-renders on state change.
- **Readouts are React-rendered but throttled** (~100 ms during animation) to avoid jank.
- **Recharts mounts only when graphs panel is open**, and updates only when params change — never on animation frames.

### 11.5 Camera / scaling

- World units: metres.
- `worldToScreen()` helper computes pixels-per-metre such that the trajectory fits the canvas with 10% padding.
- Recompute scale only when params change, not every frame.

### 11.6 Asset budget

| Asset | Size estimate |
|---|---|
| Hind Siliguri (regular + bold, Bangla subset) | ~80 KB |
| 10MS logo SVG | ~5 KB |
| Junior launcher illustration (SVG) | ~20 KB |
| All other UI | CSS + canvas-drawn |

---

## 12. Acceptance criteria (V1)

The simulator is approved (`is_active = TRUE` in TenTen terms) only when **all** of these pass on a real low-end Android phone over 3G.

### 12.1 Mobile checklist (per TenTen §4.2.1)

- [ ] Layout fits 360 px width without horizontal scroll
- [ ] All touch targets ≥ 44 × 44 px
- [ ] Works in portrait by default
- [ ] First interactive frame ≤ 5 s on 3G
- [ ] No nested scrollbars in the canvas area
- [ ] Text readable at default mobile zoom
- [ ] Works inside a 360 × 640 iframe
- [ ] Survives device rotation without state loss
- [ ] No hover-only interactions

### 12.2 Functional

- [ ] Junior mode renders with two sliders + launch button only
- [ ] Senior mode renders with three sliders + numeric inputs + readouts strip
- [ ] Live trajectory preview updates as sliders move (Senior)
- [ ] Launch button animates ball along trajectory in both modes
- [ ] R, H, T values match analytical formulas to 0.1 m / 0.1 s precision
- [ ] θ = 30° and θ = 60° produce visibly identical R (the symmetry insight)
- [ ] Comparison mode shows two parabolas in distinguishable colours (if shipped in V1)
- [ ] Vector overlay correctly shows v, vₓ, vᵧ, g
- [ ] Graphs panel renders y-t and vᵧ-t correctly

### 12.3 Linguistic

- [ ] All UI strings are in Bangla
- [ ] Bangla numerals render correctly on Android Chrome and iOS Safari
- [ ] No mojibake / box characters anywhere
- [ ] All terminology matches NCTB textbook (content team sign-off)

### 12.4 Performance

- [ ] Initial JS bundle ≤ 200 KB gzipped
- [ ] Animation maintains ≥ 30 FPS on a 2 GB RAM Android device
- [ ] Slider drag does not drop the simulation FPS

---

## 13. Roadmap

### V1 (this PRD) — Pure vacuum motion

Everything in §§5–12.

### V2 — Realism and embedding

- Air resistance (drag toggleable, linear and quadratic options)
- Embed integration with TenTen lesson pages (deep-link params: `?v0=20&theta=30&mode=senior`)
- Shareable scenario URLs
- English language layer
- Saved scenarios (anonymous local storage)
- Analytics instrumentation
- NCTB problem presets (5–10 board questions pre-loaded)

### V3 — Engagement and breadth

- Challenge mode ("hit the target")
- Wind, planet selector, Magnus effect
- Real-world presets (cricket ball, javelin, football)
- Predict-before-launch micro-quizzes
- Accessibility audit (keyboard nav, screen reader, contrast)
- Multi-projectile sandbox

---

## 14. Open questions and risks

### 14.1 Open questions

1. **NCTB terminology lock.** Several Bangla terms in §10.2 are best-guesses and need verification against the actual textbook before development starts.
2. **`design.md` not yet shared.** All visual decisions (colors, fonts, launcher illustration, button styles) await this file.
3. **Junior launcher art.** Cannon, slingshot, kid-with-ball — to be decided in `design.md`.
4. **Numeral toggle placement.** Header icon vs. settings drawer.
5. **Slider feel on mobile.** Native `<input type="range">` vs. custom touch handler — verify on real device before committing.

### 14.2 Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Bangla font loading slows TTI on 3G | Medium | High | Subset font, preload, `font-display: swap`, fallback to system Bangla font |
| Canvas FPS drops on low-end Android | Medium | High | Cap render layers; profile on real 2 GB device early |
| Recharts bundle bloats Senior mode | Medium | Medium | Lazy-load; consider lighter alt (e.g. canvas-drawn graphs) if it exceeds 80 KB gzipped |
| NCTB terminology disputed by content reviewers | Low | Medium | Get content team sign-off on `glossary.bn.json` before string freeze |
| Iframe sandboxing blocks features | Low | Medium | Test inside iframe at every milestone, not just at end |
| Custom-build dev time exceeds 7 days | Medium | Low | Acceptable trade-off was made knowingly. Reassess only if it exceeds 12 days |

---

## 15. Estimated timeline (V1)

| Phase | Days | Deliverable |
|---|---|---|
| Setup (Vite, routing, file structure, Vercel deploy pipeline) | 0.5 | Empty React app deploying to Vercel |
| Physics engine (`physics.js`) + unit tests | 0.5 | Pure functions, verified against worked examples |
| Canvas rendering (parabola, ball, axes, animation loop) | 1.0 | Animation works with hardcoded params |
| Sliders + numeric inputs + state wiring | 1.0 | Live trajectory updates from controls |
| Senior mode layout + readouts + vectors + dots | 1.0 | Full Senior UI |
| Junior mode layout + simplified controls + explainer | 0.5 | Full Junior UI |
| Graphs (Recharts) + comparison mode | 1.0 | Senior-only extras |
| Bangla strings, terminology pass, font loading | 0.5 | All UI in Bangla |
| Mobile QA on real device, iframe test, perf profiling | 1.0 | Acceptance checklist passes |
| **Total** | **~7 days** | V1 deployed |

---

## 16. Appendix: planning confidence assessment

This PRD locks the following decisions with high confidence (≥95%):

- ✅ Tech stack (React + Vite + Canvas + Recharts)
- ✅ Two-segment user model (Junior / Senior)
- ✅ V1 scope (vacuum motion only, no air resistance/gamification/auth)
- ✅ Physics specification (closed-form, exact)
- ✅ Mobile-first layout zones and performance budget
- ✅ Module structure and state shape
- ✅ Acceptance criteria

Remaining ~5% uncertainty sits in:

- 🔄 Visual design (deliberately deferred to `design.md`)
- 🔄 Final NCTB terminology (requires textbook validation pass)
- 🔄 Whether Comparison Mode (F-14) ships in V1 or slips to V2 (depends on dev velocity)

These three items are scoped to be resolved without re-architecting anything in this PRD.
