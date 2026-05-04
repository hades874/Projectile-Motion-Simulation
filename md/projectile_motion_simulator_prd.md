# Physics Simulation Hub — Product Requirements Document

| Field | Value |
|---|---|
| **Project codename** | SIM-P1 |
| **Owner** | cm.ops, Content Operations, 10 Minute School |
| **Document status** | v2.0 — Implemented |
| **Last updated** | 04 May 2026 |
| **Target platform** | TenTen (10 Minute School), mobile-first web |
| **Source references** | Internal `Simulation_Development_Instructions.md` (TenTen sims mandate, §4.2.1 mobile checklist, SIM-P1 spec) |

---

## 1. Executive summary

A Bangla-first, mobile-first interactive physics simulation hub built as a custom React + HTML5 Canvas web app. The hub ships two fully custom simulations targeting two student segments:

- **Junior (Forces and Motion)** — 4-tab interactive simulation covering net force, motion with friction, friction analysis, and tug-of-war. Target: Class 6–10 students learning Newton's laws.
- **Senior (Projectile Motion)** — full-featured projectile motion simulator with trajectory animation, vector overlays, formula panel, graphs, and comparison mode. Target: Class 9–10 / HSC students doing board-exam-aligned study.

Both simulations are built entirely from scratch — no external simulation frameworks were used. V1 ships both simulators fully functional. Air resistance, gamification, and user accounts are deferred.

**Primary success metric for V1:** A Class 9 student on a low-end Android phone over 3G can independently discover why 30° and 60° launches give the same range (Projectile), and understand why a heavier object doesn't stop faster on ice vs concrete (Forces).

---

## 2. Background and context

### 2.1 The internal mandate

10MS's TenTen platform identified physics simulations as the highest-priority interactive content need. The original internal proposal recommended forking PhET Interactive Simulations for both segments. After review, we deviated from the PhET-fork plan and built fully custom simulations for both segments.

### 2.2 Why custom instead of PhET fork

1. **Mobile fit.** PhET sims are desktop-first; meeting TenTen's 44 px touch targets and 360 px portrait layout would require fighting the PhET framework.
2. **Localization depth.** PhET text is woven through Scenery scene-graph nodes; Bangla rendering and numeral conversion (১২৩ vs 123) are non-trivial inside a fork.
3. **NCTB alignment.** PhET follows US/AP curriculum framing. Aligning to NCTB chapters from inside a fork means perpetual upstream conflict.
4. **Bundle size.** A PhET sim is several MB; both custom sims together ship under 70 KB gzipped.
5. **Full control.** Custom code means comparison mode, NCTB problem presets, and Forces tabs fit naturally.

**Trade-off accepted:** ~7–10 dev-days for both sims vs. 2–3 for PhET forks. This is a one-time investment that pays off across the full simulation roadmap.

### 2.3 Curriculum context

| Segment | Curriculum reference | Simulation |
|---|---|---|
| Junior (Class 6–10) | NCTB বিজ্ঞান / পদার্থ বিজ্ঞান — force, motion, Newton's laws | Forces and Motion (4 tabs) |
| Senior (Class 9–10 / HSC) | NCTB পদার্থ বিজ্ঞান Chapter 2 (SSC) + HSC Physics Chapter 3 | Projectile Motion |

---

## 3. Goals and non-goals

### 3.1 Goals (V1)

1. Let a Bangladeshi student explore Newton's laws interactively (Forces sim).
2. Let a Bangladeshi physics student set v₀, θ, h₀ and instantly see trajectory + R, H, T (Projectile sim).
3. Make the H–R trade-off across angles intuitive without text instruction.
4. Run smoothly on a low-end Android phone (≤ 2 GB RAM) over 3G.
5. Read entirely in Bangla with Western/Bangla numeral toggle.
6. Ship as a standalone Vercel app, ready to embed via iframe later.

### 3.2 Non-goals (V1)

1. Air resistance, drag, wind, Magnus effect.
2. Planet/gravity selector.
3. Gamification (targets, scoring, levels).
4. User accounts, saved progress, history.
5. Analytics / event tracking.
6. Accessibility audit (keyboard nav, screen reader, contrast).
7. English-first UI (V1 is Bangla-only; English layer in V2).
8. Live embedding inside TenTen lesson pages (designed embed-ready, but actual embedding is V2).

---

## 4. Users and segmentation

### 4.1 Two-segment model

The app opens with two large tappable cards on the home screen:

- **জুনিয়র** — Forces and Motion simulation
- **সিনিয়র** — Projectile Motion simulation

### 4.2 Junior segment — Forces and Motion

**Purpose:** Interactive exploration of Newton's laws: force, mass, acceleration, friction.

**Four tabs:**

| Tab | Bangla | Description |
|---|---|---|
| Net Force | নেট বল | Toggle up to 4 pushers per side on an air-track cart. F_net arrows update live. |
| Motion | গতি | Sliding applied force on object presets (skate/box/fridge/car). Friction toggle. |
| Friction | ঘর্ষণ | Same as Motion + live F vs F_friction graph showing static→kinetic transition. |
| Tug of War | টানা-হেঁচড়া | Two 4-person teams. Rope moves to winning side. Win overlay. |

**Physics engine:** Numerical integration (Euler). F=ma, static + kinetic friction. Object/surface presets with realistic μ values.

### 4.3 Senior segment — Projectile Motion

**Purpose:** Board-exam-aligned exploration and verification. NCTB Chapter 2 (SSC) + HSC Chapter 3.

**Controls:** Sliders for v₀, θ, h₀. Live trajectory preview updates as sliders move.

**Features:** Launch animation, pause/resume, speed control (0.5× / 1× / 2×), vector overlay (v, vₓ, vᵧ), trajectory dots, formula panel, y-t + vᵧ-t graphs, comparison mode (second ghost projectile).

---

## 5. V1 feature scope

### 5.1 Forces and Motion (Junior)

| # | Feature | Tabs |
|---|---|---|
| F-1 | Toggle pushers on/off (each = 50 N) | Net Force, Tug of War |
| F-2 | Applied force slider (−500 to 500 N) | Motion, Friction |
| F-3 | Object presets (skate 5 kg, box 25 kg, fridge 100 kg, car 1000 kg) | Motion |
| F-4 | Surface presets (ice, wood, concrete) | Friction |
| F-5 | Friction on/off toggle | Motion |
| F-6 | Live force arrows (F_applied blue, F_friction orange, F_net green) | Motion, Friction |
| F-7 | Live F vs F_friction graph (static region → kinetic drop) | Friction |
| F-8 | Win state overlay for tug-of-war | Tug of War |
| F-9 | Start / Pause / Reset per tab | All |
| F-10 | Live readout cards: F_net, a, v, x | All |

### 5.2 Projectile Motion (Senior)

| # | Feature | Description |
|---|---|---|
| F-11 | Set v₀, θ, h₀ via sliders | Live trajectory preview updates |
| F-12 | Launch animation | Ball animates along computed trajectory |
| F-13 | Pause / resume | Mid-flight |
| F-14 | Speed control | 0.5× / 1× / 2× |
| F-15 | Vector overlay | v, vₓ, vᵧ, g arrows on the ball during flight |
| F-16 | Trajectory dots | Equal-time dots — visual proof of Δt-uniform spacing |
| F-17 | Formula panel | Live R, H, T formulas with substituted values |
| F-18 | Graphs panel | y-t and vᵧ-t charts (Recharts) |
| F-19 | Comparison mode | Second (ghost) projectile — orange dashed vs green main |
| F-20 | Numeral toggle | Bangla (০–৯) ↔ Western (0–9) in header |
| F-21 | Tooltip on every control | Tap reveals Bangla glossary definition |
| F-22 | Impact velocity readout | Shows v_impact when animation finishes |
| F-23 | Reset to defaults | v₀ = 20, θ = 45°, h₀ = 0 |

---

## 6. Physics specification

### 6.1 Projectile motion — analytical (closed-form)

Position at time t (initial height h₀):

- x(t) = v₀ · cos(θ) · t
- y(t) = h₀ + v₀ · sin(θ) · t − ½ · g · t²

Derived quantities:

- **Time of flight** (h₀ = 0): T = 2 v₀ sin(θ) / g
- **Time of flight** (h₀ > 0): T = [v₀ sin(θ) + √((v₀ sin(θ))² + 2g·h₀)] / g
- **Maximum height:** H = h₀ + (v₀ sin(θ))² / (2g)
- **Range:** R = x(T)
- **Speed at impact:** |v(T)| = √(vₓ² + vᵧ(T)²)

No numerical integration needed — closed-form exact for vacuum. 201 sample points used for canvas rendering.

### 6.2 Projectile parameters

| Parameter | Range | Default | Step | Units |
|---|---|---|---|---|
| Initial velocity v₀ | 1–100 | 20 | 1 | m/s |
| Launch angle θ | 1–89 | 45 | 1 | degrees |
| Initial height h₀ | 0–50 | 0 | 1 | m |
| Gravity g | fixed | 9.8 | — | m/s² |

### 6.3 Projectile degenerate states

| State | Detection | Behaviour |
|---|---|---|
| `flat` | θ = 0° and h₀ = 0 | Show warning; disable launch button |
| `vertical` | θ = 90° | Show warning; disable launch button |
| `no-velocity` | v₀ = 0 | Show warning; disable launch button |

### 6.4 Forces and Motion — numerical integration (Euler)

On each animation tick (dt capped at 50 ms to prevent tunnelling):

```
a = F_net / mass
v_new = v + a * dt
x_new = x + v * dt
```

**Friction model:**
- If stationary and |F_applied| ≤ μ_s · m · g → F_friction = −F_applied (static, no motion)
- If moving → F_friction = −sign(v) · μ_k · m · g (kinetic)
- Velocity is zeroed when |v| < 0.08 m/s and F_net_at_rest < 0.1 N (prevents floating-point drift)

**Object presets (forcesPhysics.js):**

| Object | Mass | μ_s | μ_k |
|---|---|---|---|
| Skate (স্কেটবোর্ড) | 5 kg | 0.20 | 0.15 |
| Box (বাক্স) | 25 kg | 0.45 | 0.35 |
| Fridge (ফ্রিজ) | 100 kg | 0.55 | 0.42 |
| Car (গাড়ি) | 1000 kg | 0.65 | 0.52 |

**Surface presets:**

| Surface | μ_s | μ_k |
|---|---|---|
| Ice (বরফ) | 0.10 | 0.05 |
| Wood (কাঠ) | 0.45 | 0.35 |
| Concrete (কংক্রিট) | 0.65 | 0.55 |

### 6.5 Units

All SI: metres, seconds, m/s, N, degrees. No imperial units anywhere.

---

## 7. UX flows

### 7.1 First-launch flow

1. App loads → home screen with two segment cards (Junior / Senior).
2. Tap a card → navigate to that simulation.
3. Back button in the simulation header returns to home.

### 7.2 Forces and Motion (Junior) flow

1. Land on Net Force tab by default.
2. Tap person buttons to toggle pushers. Force arrows and readouts update immediately.
3. Tap Start → cart moves. Tap Pause / Reset.
4. Switch tabs via tab bar at top.
5. Each tab has its own Start/Pause/Reset state — switching tabs preserves each tab's position.

### 7.3 Projectile Motion (Senior) flow

1. Land on simulator — sliders visible, static trajectory preview shown.
2. Adjust v₀, θ, h₀ sliders → trajectory updates live, R/H/T readout cards update.
3. Tap "উৎক্ষেপণ" to animate the ball.
4. Tap pause / resume / speed cycle / reset.
5. Bottom sheet tabs (always visible strip): vectors / formulas / graphs / comparison.

---

## 8. Information architecture

```
/  (hash routing)
├── /           → ModeSelect (two segment cards)
├── /junior     → ForceScreen (4-tab Forces simulation)
└── /senior     → SeniorPage → SeniorScreen (Projectile simulation)
```

React Router v6 in **hash mode** for iframe-embed safety.

---

## 9. Mobile-first design specifications

### 9.1 Viewport targets

Design floor: **360 px width**. Verify at 360, 390, 414, 768, 1024, 1440. Portrait is the primary layout.

### 9.2 Forces sim mobile layout (360–414 px)

```
┌─────────────────────────┐
│ Header (52 px)          │
├─────────────────────────┤
│ Tab bar (4 tabs)        │
├─────────────────────────┤
│ Canvas (animated)       │  full width
│                         │  ~44 dvh
├─────────────────────────┤
│ Controls panel          │  scrollable
│ (sliders / toggles /    │
│  readout cards)         │
└─────────────────────────┘
```

### 9.3 Projectile sim mobile layout (360–414 px)

```
┌─────────────────────────┐
│ Header (52 px)          │
├─────────────────────────┤
│ Canvas                  │  44 dvh
├─────────────────────────┤
│ Controls panel          │  scrollable
│ (sliders + result cards)│
├─────────────────────────┤
│ Action bar (buttons)    │
├─────────────────────────┤
│ Bottom sheet tabs       │
└─────────────────────────┘
```

### 9.4 Desktop layout (≥ 640 px)

Both simulations use a split layout: canvas (flex: 1) on the left, 260 px controls panel on the right.

### 9.5 Touch targets

- All interactive elements: minimum **44 × 44 px**.
- Person toggle buttons: 44 × 44 px minimum.
- No hover-only interactions.

### 9.6 Performance budget

| Metric | Target | Achieved (V1) |
|---|---|---|
| First contentful paint (3G) | ≤ 2.0 s | — |
| Time to interactive (3G) | ≤ 5.0 s | — |
| Initial JS bundle (gzipped) | ≤ 200 KB | ~68 KB |
| Animation FPS (low-end Android) | ≥ 30 | — |

### 9.7 Iframe / WebView readiness

- No external scrollbars.
- All interactions work inside an `<iframe>` sandbox with `allow="autoplay"`.
- Test inside 360 × 640 iframe before V1 sign-off.

---

## 10. Bangla language requirements

### 10.1 Font

- **Hind Siliguri** (Google Fonts) for Bangla. Inter for any Latin text.
- `font-display: swap`; system Bangla font fallback during load.
- Bangla class `.bn`: `letter-spacing: 0.01em; line-height: 1.5`.

### 10.2 Terminology mapping (NCTB-aligned)

| English | Bangla |
|---|---|
| Projectile motion | প্রক্ষেপণ গতি |
| Initial velocity (v₀) | প্রাথমিক বেগ |
| Launch angle (θ) | উৎক্ষেপণ কোণ |
| Initial height (h₀) | প্রাথমিক উচ্চতা |
| Range (R) | অনুভূমিক পাল্লা |
| Maximum height (H) | সর্বোচ্চ উচ্চতা |
| Time of flight (T) | উড্ডয়নকাল |
| Net force | নেট বল |
| Applied force | প্রযুক্ত বল |
| Friction | ঘর্ষণ |
| Mass | ভর |
| Velocity | বেগ |
| Acceleration | ত্বরণ |
| Reset | রিসেট |
| Launch | উৎক্ষেপণ |
| Pause | থামুন |
| Resume | চালু করুন |

### 10.3 Numerals

- Both sims show a numeral toggle in the header: Bangla (০–৯) ↔ Western (0–9).
- Default: Bangla numerals. All readouts respect `display.numerals` via `formatNum()`.

### 10.4 String files

| File | Used by |
|---|---|
| `src/content/forces.bn.json` | ForceScreen, NetForceTab, MotionTab, FrictionTab, TugOfWarTab |
| `src/content/senior.bn.json` | SeniorScreen, FormulaPanel, GraphsPanel |
| `src/content/glossary.bn.json` | Tooltips in SeniorScreen (ParamRow) |

---

## 11. Tech architecture

### 11.1 Stack

| Concern | Choice |
|---|---|
| Framework | React 18 + Vite |
| Animation | HTML5 Canvas via `requestAnimationFrame` |
| Charts | Recharts (Senior graphs panel, lazy-loaded) |
| Styles | CSS Modules + `src/styles/tokens.css` (10MS design tokens) |
| State | React `useReducer` (two separate hooks) |
| Routing | React Router v6, hash mode |
| Deployment | Vercel |

### 11.2 Module structure

```
/src
  /components
    /Forces
      ForceCanvas.jsx         — canvas wrapper (useViewport + useAnimationFrame)
      NetForceTab.jsx         — Tab 1: pushers + cart
      MotionTab.jsx           — Tab 2: applied force + objects
      FrictionTab.jsx         — Tab 3: friction graph
      TugOfWarTab.jsx         — Tab 4: tug of war + win state
      Forces.module.css       — shared CSS for all 4 tabs
    /Simulator
      SimCanvas.jsx           — projectile canvas + animation loop
      FormulaPanel.jsx        — live formula substitution
      GraphsPanel.jsx         — Recharts y-t + vy-t
      ComparisonPanel.jsx     — comparison mode controls
    /Layout
      ModeSelect.jsx          — landing page (two segment cards)
      ForceScreen.jsx         — Forces sim shell (header + tab bar)
      ForceScreen.module.css
      SeniorPage.jsx          — wrapper: useSimulator('senior') → SeniorScreen
      SeniorScreen.jsx        — Projectile sim (split canvas/panel)
      SeniorScreen.module.css
      BottomSheet.jsx         — collapsible tab panel
    /Common
      Button.jsx
      Toggle.jsx
      Tooltip.jsx
      Slider.jsx
      NumberInput.jsx
  /lib
    physics.js                — projectile physics (9 pure functions)
    forcesPhysics.js          — F=ma engine (friction, step, clamp, presets)
    canvas.js                 — projectile canvas drawing (11 functions)
    forceCanvas.js            — forces canvas drawing (4 tab draw functions)
    bangla.js                 — numeral conversion (toBn, toEn, formatNum)
    physics.test.js           — 17 vitest tests (projectile physics)
  /content
    forces.bn.json            — Forces simulation Bangla strings
    senior.bn.json            — Projectile simulation Bangla strings
    glossary.bn.json          — Physics term definitions
  /styles
    tokens.css                — 10MS design tokens
    global.css
  /hooks
    useSimulator.js           — projectile motion state (useReducer)
    useForceSimulator.js      — forces simulation state (useReducer, 4 tabs)
    useAnimationFrame.js      — RAF loop with delta timing
    useViewport.js            — ResizeObserver for canvas dimensions
  App.jsx
  main.jsx
```

### 11.3 Forces simulation state shape

```js
// useForceSimulator.js
{
  activeTab: 'netforce' | 'motion' | 'friction' | 'tug',
  netforce: {
    leftPushers: [bool, bool, bool, bool],
    rightPushers: [bool, bool, bool, bool],
    cartX: 0,   // m, range [-8, 8]
    cartV: 0,   // m/s
    isRunning: false,
  },
  motion: {
    Fapplied: 0,                 // N, range [-500, 500]
    selectedObject: 'box',       // 'skate' | 'box' | 'fridge' | 'car'
    frictionOn: true,
    boxX: 0,
    boxV: 0,
    isRunning: false,
  },
  friction: {
    Fapplied: 0,                 // N, range [0, 500]
    surface: 'wood',             // 'ice' | 'wood' | 'concrete'
    mass: 25,
    boxX: 0,
    boxV: 0,
    isRunning: false,
  },
  tug: {
    leftTeam:  [bool, bool, bool, bool],
    rightTeam: [bool, bool, bool, bool],
    ropeX: 0,    // m, range [-6, 6]. ±6 = win
    ropeV: 0,
    isRunning: false,
    winner: null | 'left' | 'right',
  },
}
```

Actions: `SET_TAB`, `TOGGLE_PUSHER`, `SET_PARAM`, `START`, `PAUSE`, `RESET`, `TICK`.

### 11.4 Projectile simulation state shape

```js
// useSimulator.js
{
  mode: 'senior',
  params: { v0, theta, h0, g },
  animation: { status: 'idle'|'playing'|'paused'|'finished', t, speed },
  overlays: { vectors, dots, axes },
  display: { numerals: 'bangla' | 'western' },
  results: { T, H, R, impact },
  comparison: null | { params, results },
  points: [{x, y}, ...],         // 201 trajectory points
  degenerate: null | 'flat' | 'vertical' | 'no-velocity',
}
```

### 11.5 Rendering architecture

- **Canvas owns all simulation visuals.** Re-renders only on RAF tick (Forces) or `animation.t` change (Projectile).
- **React owns chrome** (controls, readouts, panels). Re-renders on state changes.
- `useAnimationFrame` and `useViewport` hooks are **shared** between both simulations.
- `ForceCanvas` wraps these hooks and calls a `drawFn(ctx, w, h, state)` per frame.
- `SimCanvas` manages its own RAF loop internally via `useAnimationFrame`.

### 11.6 Asset budget (V1 actual)

| Asset | Size |
|---|---|
| JS bundle (gzipped) | ~68 KB |
| Hind Siliguri (Bangla subset) | ~80 KB |
| All other assets | < 5 KB |

---

## 12. Acceptance criteria (V1)

### 12.1 Mobile checklist (per TenTen §4.2.1)

- [ ] Layout fits 360 px width without horizontal scroll (both sims)
- [ ] All touch targets ≥ 44 × 44 px
- [ ] Works in portrait by default
- [ ] First interactive frame ≤ 5 s on 3G
- [ ] No nested scrollbars in canvas areas
- [ ] Text readable at default mobile zoom
- [ ] Works inside a 360 × 640 iframe
- [ ] Survives device rotation without state loss
- [ ] No hover-only interactions

### 12.2 Forces simulation

- [ ] Net Force tab: pushers toggle, cart moves with correct F_net, readouts update
- [ ] Motion tab: applied force slider moves object, friction toggle works
- [ ] Friction tab: F vs F_friction graph shows static region + kinetic drop
- [ ] Tug of War: rope moves to winning side, win overlay fires at ±6 m
- [ ] Object presets apply correct mass and μ values
- [ ] Surface presets (Friction tab) apply correct μ values
- [ ] Velocity zeroes correctly on deceleration (no infinite drift)

### 12.3 Projectile simulation

- [ ] Live trajectory preview updates as sliders move
- [ ] Launch animates ball along trajectory
- [ ] R, H, T values match analytical formulas to 0.1 m / 0.1 s precision
- [ ] θ = 30° and θ = 60° produce visibly identical R (range symmetry)
- [ ] Comparison mode shows two parabolas in distinguishable colours
- [ ] Vector overlay correctly shows v, vₓ, vᵧ, g
- [ ] Graphs panel renders y-t and vᵧ-t correctly
- [ ] All 17 vitest physics tests pass (`npm test`)

### 12.4 Linguistic

- [ ] All UI strings are in Bangla
- [ ] Bangla numerals render correctly on Android Chrome and iOS Safari
- [ ] Numeral toggle works in both simulations
- [ ] No mojibake or box characters anywhere

### 12.5 Performance

- [ ] Initial JS bundle ≤ 200 KB gzipped (currently ~68 KB ✓)
- [ ] Animation maintains ≥ 30 FPS on a 2 GB RAM Android device

---

## 13. Roadmap

### V1 (this PRD) — Shipped

- Forces and Motion: 4 tabs, full physics, Bangla UI
- Projectile Motion: full-featured sim, vector overlays, formulas, graphs, comparison
- Bangla-only, numeral toggle, 10MS design tokens
- Vercel deployment, hash routing

### V2 — Realism and embedding

- Air resistance (drag toggleable) in Projectile sim
- Gravity selector (Earth, Moon, Mars)
- Embed integration with TenTen lesson pages (deep-link params: `?v0=20&theta=30`)
- Shareable scenario URLs
- English language layer
- Analytics instrumentation
- NCTB problem presets (5–10 board questions pre-loaded)

### V3 — Engagement and breadth

- Challenge mode ("hit the target" for Projectile)
- Real-world object presets (cricket ball, javelin)
- Predict-before-launch micro-quizzes
- Accessibility audit (keyboard nav, screen reader, contrast)
- Additional simulation segments (e.g. Waves, Optics)

---

## 14. Open questions and risks

### 14.1 Open questions

1. **NCTB terminology.** Several Bangla terms in §10.2 need validation against the actual textbook before string freeze.
2. **Forces tab for SSC Chapter 4.** Friction tab covers static/kinetic μ well; circular motion and momentum are not yet represented.
3. **Numeral toggle default.** Currently both sims default to Bangla numerals. Confirm with content team whether Senior should default to Western.

### 14.2 Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Bangla font loading slows TTI on 3G | Medium | High | Subset font, preload, `font-display: swap` |
| Canvas FPS drops on low-end Android (Forces TICK rate) | Medium | High | Cap dt at 50 ms; profile on real device |
| Euler integration error at high forces | Low | Medium | dt cap + velocity zeroing prevents divergence |
| NCTB terminology disputed by content reviewers | Low | Medium | Get content sign-off on string files before freeze |
| Iframe sandboxing blocks features | Low | Low | Test at every milestone |
