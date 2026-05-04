❯ change the following things in this web app -
                                                                                                                                                
  make two segments, remove the segmentation of the chapter that you have made here. there will only be 2 segments, one for junior and one for  
  senior.
                                                                                                                                                
  junior segment will have - forces and motion, basics
  senior segment will have - projectile motion
                                                                                                                                                
  then, remove all markings and usage of phet guidelines. we will not be using their forking anymore rather, use the files given in the
  @contextScopeItemMentionfolder, there are two files in the folder, @contextScopeItemMentionwill be used for the junior segment and
  @contextScopeItemMentionwill be used for the senior segment for making the projects.
  do not copy these files, rather understand these files and take inspiration from them to build this app.
                                                                                                                                                
  also, change the UI and designs of the simulations. the current design is not that good. make it more modern educational centric. refer to    
  the @contextScopeItemMentionfile for more guidelines.
                                                                                                                                                
  at first, develop a solid plan on how to make the development. gain 95% confidence in the plan and then start development. ask any questions  
  you have if you have any confusion

● Let me explore the codebase and the inspo/ folder to build a solid plan.

● Explore(Explore inspo folder and current app structure)
  ⎿  Done (28 tool uses · 72.4k tokens · 1m 5s)
  (ctrl+o to expand)

● Let me read the inspo files directly to understand them better before finalizing the plan.

  Read 2 files (ctrl+o to expand)

● Let me read the design file and key existing components to complete my understanding.

● Explore(Read design doc and key source files)
  ⎿  Done (8 tool uses · 49.2k tokens · 30s)
  (ctrl+o to expand)

● Now I have a clear picture. Let me ask a few clarifying questions before writing the plan.

● User answered Claude's questions:
  ⎿  · For the Junior segment (Forces and Motion: Basics), how complex should the simulation be? → Multi-tab like PhET
     · What language should the UI be in? → Bangla-only (Recommended)
     · For the modernized UI design, which style direction fits best? → Clean + data-dense (Recommended)

● Now I have everything I need. Let me write the plan.

● Updated plan
  ⎿  /plan to preview

● User approved Claude's plan
  ⎿  Plan saved to: C:\Users\Shamim Hasan\.claude\plans\change-the-following-things-abundant-tiger.md · /plan to edit
     Plan: Physics Simulation Hub — Two-Segment Rebuild

     Context

     The app currently routes to a PhET browser (gallery + iframe embeds). The actual custom React simulators (JuniorScreen, SeniorScreen) exist
      but are unreachable. This plan removes all PhET embedding, replaces the Junior segment with a new Forces and Motion simulation, redesigns 
     Senior (Projectile Motion) UI to be clean + data-dense, and wires up proper routing.

     User choices:
     - Junior = Forces and Motion (4-tab, multi-scenario, PhET-inspired)
     - Senior = Projectile Motion (existing physics, redesigned UI)
     - Language: Bangla-only
     - UI: Clean + data-dense (Khan Academy / Brilliant style)

     ---
     Architecture After This Change

     Routes (HashRouter):
       /           → Landing page (2 segment cards: Junior / Senior)
       /junior     → ForceScreen (new Forces & Motion simulation)
       /senior     → SeniorScreen (redesigned Projectile Motion)

     New file tree additions:
       src/lib/forcesPhysics.js          ← F=ma engine (new)
       src/hooks/useForceSimulator.js    ← reducer for forces state (new)
       src/lib/forceCanvas.js            ← canvas drawing for forces (new)
       src/content/forces.bn.json        ← Bangla strings for forces UI (new)
       src/components/Layout/ForceScreen.jsx          ← 4-tab forces sim (new)
       src/components/Forces/ForceCanvas.jsx          ← canvas wrapper (new)
       src/components/Forces/NetForceTab.jsx          ← Tab 1 (new)
       src/components/Forces/MotionTab.jsx            ← Tab 2 (new)
       src/components/Forces/FrictionTab.jsx          ← Tab 3 (new)
       src/components/Forces/TugOfWarTab.jsx          ← Tab 4 (new)

     Files to DELETE:
       src/components/Layout/SimSelector.jsx
       src/components/Layout/SimViewer.jsx
       src/data/simulations.js
       src/components/Layout/JuniorScreen.jsx  (replaced by ForceScreen)
       src/components/Layout/JuniorScreen.module.css (if exists)
       src/components/Layout/SimSelector.module.css  (if exists)
       src/components/Layout/SimViewer.module.css    (if exists)

     Files to MODIFY:
       src/App.jsx                  ← new routing
       src/components/Layout/ModeSelect.jsx  ← redesigned landing
       src/components/Layout/SeniorScreen.jsx ← UI redesign, keep all logic
       src/content/junior.bn.json   ← repurpose or delete (forces.bn.json replaces)
       CLAUDE.md                    ← update after implementation

     ---
     Phase 1 — Cleanup & Routing (Day 1)

     1.1 Update src/App.jsx

     // New routes
     / → <LandingPage />     (renamed ModeSelect)
     /junior → <ForceScreen />
     /senior → <SeniorScreen />
     // Remove: /sim/:simId

     1.2 Delete PhET files

     - SimSelector.jsx, SimViewer.jsx, simulations.js
     - Any .module.css files tied to them

     1.3 Redesign ModeSelect.jsx → LandingPage.jsx

     Two large clickable cards. Clean, no clutter.
     ┌─────────────────────────────────┐
     │  🔴 10MS বলবিজ্ঞান সিমুলেশন   │
     ├──────────────┬──────────────────┤
     │              │                  │
     │  [Junior]    │   [Senior]       │
     │  বল ও গতি   │  প্রক্ষেপণ গতি  │
     │  (icon)      │   (icon)         │
     │              │                  │
     └──────────────┴──────────────────┘
     - Uses --success green for Junior card accent, --info blue for Senior
     - Navigates via useNavigate('/junior') and useNavigate('/senior')
     - Back button available from each simulation screen

     ---
     Phase 2 — Forces and Motion Simulation (Junior) (Days 2–5)

     2.1 src/lib/forcesPhysics.js — New Physics Engine

     Pure functions, all exported:

     // Constants
     GRAVITY = 9.8
     MU_STATIC_DEFAULT = 0.5
     MU_KINETIC_DEFAULT = 0.4

     // Functions:
     netForce(forces)           // Σ forces (left negative, right positive)
     acceleration(Fnet, mass)   // F = ma → a
     stepMotion(state, dt)      // integrate: v += a*dt, x += v*dt
     staticFriction(Fapplied, mass, mu_s)  // min(|Fapplied|, mu_s*m*g) * sign
     kineticFriction(mass, mu_k, velocitySign)  // mu_k * m * g * -sign(v)
     isSlipping(Fapplied, mass, mu_s)  // |Fapplied| > mu_s * m * g
     netMotionForce(Fapplied, mass, mu_k, mu_s, velocity)  // accounts for friction

     2.2 src/hooks/useForceSimulator.js — Forces State

     state = {
       activeTab: 'netforce' | 'motion' | 'friction' | 'tug',
       // Net Force tab
       netForce: {
         leftPushers: [false, false, false, false],   // 4 toggles
         rightPushers: [false, false, false, false],  // 4 toggles
         cartX: 0,          // cart position (0 = center)
         cartV: 0,          // cart velocity
         isRunning: false,
         FORCE_PER_PERSON: 50,  // N
         CART_MASS: 10,
       },
       // Motion tab
       motion: {
         Fapplied: 0,       // slider -500 to 500 N
         mass: 20,          // preset mass (kg)
         friction: true,    // toggle
         mu_k: 0.3,
         mu_s: 0.4,
         boxX: 0,
         boxV: 0,
         isRunning: false,
         selectedObject: 'book',   // book / fridge / car / skate
       },
       // Friction tab (same physics as Motion, different UI focus)
       friction: {
         Fapplied: 0,
         mass: 20,
         mu_s: 0.4,
         mu_k: 0.3,
         boxX: 0,
         boxV: 0,
         isRunning: false,
       },
       // Tug of War tab
       tug: {
         leftTeam: [false, false, false, false],
         rightTeam: [false, false, false, false],
         ropeX: 0,       // -1 left win, 0 center, 1 right win
         ropeV: 0,
         isRunning: false,
         FORCE_PER_PERSON: 50,
         ROPE_MASS: 10,
         winner: null,   // 'left' | 'right' | null
       },
     }

     Actions: SET_TAB, TOGGLE_PUSHER, SET_PARAM, START, PAUSE, RESET_TAB, TICK

     2.3 src/lib/forceCanvas.js — Canvas Drawing Primitives

     drawGround(ctx, y)                         // surface line
     drawCart(ctx, x, y, color)                 // rectangle cart
     drawBox(ctx, x, y, mass, label)            // box with mass label
     drawRope(ctx, x, width)                    // rope with center knot
     drawForceArrow(ctx, x, y, Fx, label, color) // force arrow + label
     drawPerson(ctx, x, y, side, active)        // stick figure
     drawNetForceReadout(ctx, Fnet, a, v)       // text overlay
     drawFrictionGraph(ctx, Fapplied, Ffriction, Fmax_static) // F vs F graph

     2.4 src/content/forces.bn.json — Bangla UI Strings

     {
       "tabs": {
         "netforce": "নেট বল",
         "motion": "গতি",
         "friction": "ঘর্ষণ",
         "tug": "টানা-হেঁচড়া"
       },
       "labels": {
         "appliedForce": "প্রযুক্ত বল",
         "friction": "ঘর্ষণ",
         "mass": "ভর",
         "velocity": "বেগ",
         "acceleration": "ত্বরণ",
         "netForce": "নেট বল",
         ...
       },
       "objects": {
         "book": "বই",
         "fridge": "ফ্রিজ",
         "car": "গাড়ি",
         "skate": "স্কেটবোর্ড"
       },
       "actions": {
         "start": "শুরু করুন",
         "pause": "থামুন",
         "reset": "পুনরায় শুরু"
       }
     }

     2.5 Four Tab Components

     NetForceTab.jsx:
     - Canvas: air-track cart in center, 4 stick figures each side (toggleable)
     - Controls: 4 toggle buttons per side (each = 50N person)
     - Force arrows on cart: F_left (red), F_right (blue), F_net (green)
     - Readouts: F_net, a, v
     - Cart wraps when hitting edge → reset

     MotionTab.jsx:
     - Canvas: box on ground, force arrows
     - Controls: applied force slider (-500 to 500 N), object preset buttons, friction toggle
     - Force arrows: F_applied (blue), F_friction (orange), F_net (green)
     - Readouts: v, a, F_applied, F_friction

     FrictionTab.jsx:
     - Same canvas as MotionTab
     - Extra: live F vs F_friction graph (x-axis: F_applied, y-axis: F_friction)
       - Horizontal line showing static friction region, then drops to kinetic level
       - Moving dot shows current (F_applied, F_friction) position
     - Controls: same as MotionTab + surface material selector (wood, ice, concrete)

     TugOfWarTab.jsx:
     - Canvas: rope center-screen with 4 people each side (left=blue, right=red)
     - Toggle each person on/off (each = 50N)
     - Rope moves toward winning side
     - Win state: "নীল দল জিতেছে!" / "লাল দল জিতেছে!" overlay + celebration

     2.6 ForceScreen.jsx Layout

     ┌───────────────────────────────────────┐
     │ ← Junior  বল ও গতির মূল বিষয়         │  ← Header (52px)
     ├───────────────────────────────────────┤
     │ [নেট বল] [গতি] [ঘর্ষণ] [টানা-হেঁচড়া] │  ← Tab bar
     ├──────────────────┬────────────────────┤
     │                  │  [Controls panel]  │
     │   [ Canvas ]     │  Sliders / toggles │
     │   (animated)     │  Readout cards     │
     │                  │                    │
     ├──────────────────┴────────────────────┤
     │ [▶ শুরু করুন]         [↺ পুনরায়]     │  ← Action bar
     └───────────────────────────────────────┘
     Mobile: canvas stacks above controls (no sidebar).

     ---
     Phase 3 — Projectile Motion UI Redesign (Senior) (Days 6–7)

     3.1 Redesign SeniorScreen.jsx

     New layout (clean + data-dense):
     ┌───────────────────────────────────────────────────┐
     │ ← Senior  প্রক্ষেপণ গতি                           │  Header
     ├──────────────────────────┬────────────────────────┤
     │                          │  v₀  ━━━●━━━  20 m/s   │
     │    [ Canvas ]            │  θ   ━━━●━━━  45°      │
     │                          │  h₀  ━●━━━━   0 m      │
     │    trajectory drawing    │  g   ━━━●━━━  9.8      │
     │                          ├────────────────────────┤
     │                          │  R:  ৪০.৮ m            │
     │                          │  H:  ১০.২ m            │
     │                          │  T:  ২.৮৯ s            │
     │                          │  v_impact: ১৯.৮ m/s    │
     ├──────────────────────────┴────────────────────────┤
     │ [▶ লঞ্চ]  [⏸ থামুন]  [0.5× 1× 2×]  [↺ রিসেট]   │
     ├───────────────────────────────────────────────────┤
     │  [ভেক্টর] [সূত্র] [গ্রাফ] [তুলনা]                │  Bottom tabs
     └───────────────────────────────────────────────────┘

     Improvements over current SeniorScreen:
     - Controls panel is right-side panel (not stacked below canvas on desktop)
     - Readouts always visible (no hiding behind animation states)
     - Slider + number input aligned horizontally with label
     - Bottom tab bar replaces BottomSheet (always visible strip, opens panel above)
     - Canvas takes ~60% of horizontal space on desktop, 100% on mobile

     Keep intact:
     - All state management via useSimulator hook
     - Canvas + SimCanvas.jsx rendering
     - FormulaPanel, GraphsPanel, ComparisonPanel, Readouts
     - useAnimationFrame + useViewport hooks
     - Physics engine (physics.js) unchanged
     - Numeral toggle (bangla/western)

     CSS changes:
     - Replace any ad-hoc inline styles with CSS tokens
     - Add .sim-layout grid: grid-template-columns: 1fr 320px on desktop, 1fr on mobile
     - Readout cards: bold number, small label, --r-md border radius, --border outline
     - Slider track: --success colored filled portion, proper 44px touch targets

     ---
     Phase 4 — Design Token Application (All Screens)

     Apply consistently across all components:
     - Primary buttons: background: var(--success), white text, --r-sm radius
     - Cards: border: 1px solid var(--border), border-radius: var(--r-lg), no shadows
     - Section headings: font-size: var(--fs-h3), color: var(--ten-ink)
     - Input labels: --fs-caption, --gray-500
     - Active states: 120ms var(--ease-out)
     - Tab active: border-bottom: 2px solid var(--success), no background fill
     - Header: 52px, var(--bg), border-bottom: 1px solid var(--border), back arrow + title
     - Force arrows colors: Applied=--info, Friction=--warn, Net=--success

     ---
     Files Summary

     ┌────────┬─────────────────────────────────────────────────────────────────┐
     │ Action │                              File                               │
     ├────────┼─────────────────────────────────────────────────────────────────┤
     │ DELETE │ src/components/Layout/SimSelector.jsx                           │
     ├────────┼─────────────────────────────────────────────────────────────────┤
     │ DELETE │ src/components/Layout/SimViewer.jsx                             │
     ├────────┼─────────────────────────────────────────────────────────────────┤
     │ DELETE │ src/data/simulations.js                                         │
     ├────────┼─────────────────────────────────────────────────────────────────┤
     │ DELETE │ src/components/Layout/JuniorScreen.jsx                          │
     ├────────┼─────────────────────────────────────────────────────────────────┤
     │ MODIFY │ src/App.jsx                                                     │
     ├────────┼─────────────────────────────────────────────────────────────────┤
     │ MODIFY │ src/components/Layout/ModeSelect.jsx → landing                  │
     ├────────┼─────────────────────────────────────────────────────────────────┤
     │ MODIFY │ src/components/Layout/SeniorScreen.jsx → redesign               │
     ├────────┼─────────────────────────────────────────────────────────────────┤
     │ MODIFY │ src/content/junior.bn.json → can repurpose for forces or delete │
     ├────────┼─────────────────────────────────────────────────────────────────┤
     │ CREATE │ src/lib/forcesPhysics.js                                        │
     ├────────┼─────────────────────────────────────────────────────────────────┤
     │ CREATE │ src/hooks/useForceSimulator.js                                  │
     ├────────┼─────────────────────────────────────────────────────────────────┤
     │ CREATE │ src/lib/forceCanvas.js                                          │
     ├────────┼─────────────────────────────────────────────────────────────────┤
     │ CREATE │ src/content/forces.bn.json                                      │
     ├────────┼─────────────────────────────────────────────────────────────────┤
     │ CREATE │ src/components/Layout/ForceScreen.jsx                           │
     ├────────┼─────────────────────────────────────────────────────────────────┤
     │ CREATE │ src/components/Forces/ForceCanvas.jsx                           │
     ├────────┼─────────────────────────────────────────────────────────────────┤
     │ CREATE │ src/components/Forces/NetForceTab.jsx                           │
     ├────────┼─────────────────────────────────────────────────────────────────┤
     │ CREATE │ src/components/Forces/MotionTab.jsx                             │
     ├────────┼─────────────────────────────────────────────────────────────────┤
     │ CREATE │ src/components/Forces/FrictionTab.jsx                           │
     ├────────┼─────────────────────────────────────────────────────────────────┤
     │ CREATE │ src/components/Forces/TugOfWarTab.jsx                           │
     └────────┴─────────────────────────────────────────────────────────────────┘

     Existing files kept unchanged:
     - src/lib/physics.js
     - src/lib/canvas.js
     - src/lib/bangla.js
     - src/hooks/useSimulator.js
     - src/hooks/useAnimationFrame.js
     - src/hooks/useViewport.js
     - src/styles/tokens.css
     - src/components/Simulator/*
     - src/components/Common/*
     - src/content/senior.bn.json
     - src/content/glossary.bn.json

     ---
     Verification

     1. npm run dev → app loads at /, shows two segment cards
     2. Click Junior card → /junior → Forces and Motion loads, 4 tabs visible
     3. Tab 1 (Net Force): toggle pushers, cart moves, arrows update, readouts correct
     4. Tab 2 (Motion): slide applied force, box accelerates, friction toggles off/on correctly
     5. Tab 3 (Friction): F vs F graph animates, static→kinetic transition visible
     6. Tab 4 (Tug of War): toggle team members, rope moves to winning side, win state fires
     7. Click Senior card → /senior → Projectile Motion loads with new layout
     8. Adjust sliders, launch, overlay tabs work, comparison mode works
     9. npm test → all 17 physics tests pass (physics.js unchanged)
     10. Resize to 360px → layouts stack correctly, touch targets ≥ 44px
     11. No PhET attribution or PhET URLs anywhere in the app

● Let me start implementing. I'll read the files I need to modify first, then work through all phases.

● Explore(Read all source files for implementation)
  ⎿  Done (32 tool uses · 73.5k tokens · 2m 36s)
  (ctrl+o to expand)

  Read 4 files (ctrl+o to expand)
  ⎿  You've hit your limit · resets 8:40pm (Asia/Dhaka)
     /upgrade to increase your usage limit.
