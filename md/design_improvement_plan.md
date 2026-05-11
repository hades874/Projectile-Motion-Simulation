# Design Improvement Plan: Projectile Motion Simulation Hub

This plan outlines the visual and interactive improvements for the Physics Simulation Hub, aiming for a "wow" factor while maintaining the 10 Minute School (10MS) brand identity and NCTB curriculum alignment.

## 1. Aesthetic Direction: "Premium Educational Lab"

> **Status (2026-05-11):** The Home Screen (ModeSelect) redesign in Section 3A has been **implemented** via the SIM-P1 Home Redesign design bundle. The glassmorphism approach was replaced with a cleaner white-card + gradient-hero design that is more performant on low-end devices. See current state below.

The goal is to move from a "flat" functional UI to a "premium lab" feel that inspires students, with a **strict mobile-first priority**.
- ~~**Glassmorphism:** Use frosted glass effects for control panels and overlays.~~ **Superseded** — ModeSelect now uses clean white cards (`1px solid var(--border)`) with subtle hover lifts. Glassmorphism is used only for the sticky bottom callout and SeniorScreen's floating action bar.
- **Physics Glow:** Add a subtle "bloom" or "glow" effect to trajectories, force arrows, and active physics elements.
- **Dynamic Backgrounds:** Introduce drifting geometry (△ ○ ▢) and subtle grids to make the interface feel "alive." **Partially done** — hero section has static SVG corner geometry.
- **Mobile-First Responsiveness:** Every new design element will be validated first at **360px - 414px width** (typical Bangladeshi mobile viewport) before scaling to desktop.

## 2. Mobile-First Excellence
To cater to the primary user base (students on Android/iOS):
- **Precision Touch Targets:** All buttons, sliders, and toggles will strictly adhere to a **minimum 44x44px** hit area.
- **Thumb-Zone Optimization:** Primary actions (Launch, Reset) will be placed in the lower third of the screen for easy one-handed operation.
- **Performant Effects:** Glassmorphism and glow effects will be optimized (e.g., using hardware-accelerated CSS and optimized canvas rendering) to ensure ≥ 30 FPS on low-end devices.
- **Vertical Hierarchy:** Controls will use a scrollable "Glass Tray" layout on mobile to maximize canvas visibility.

## 2. Global Token Enhancements
Update `src/styles/tokens.css` with new premium tokens:
- `--glass-bg`: `rgba(255, 255, 255, 0.7)` (Light) / `rgba(15, 23, 42, 0.6)` (Dark)
- `--glass-border`: `rgba(255, 255, 255, 0.3)`
- `--glow-success`: `0 0 15px rgba(28, 171, 85, 0.5)`
- `--glow-info`: `0 0 15px rgba(39, 79, 227, 0.5)`
- `--r-premium`: `28px` (larger, smoother radii)

## 3. Component-Specific Redesigns

### A. Home Screen (ModeSelect) — ✅ IMPLEMENTED (2026-05-11)

Current implementation replaces the glassmorphism card design with:
- **Hero band** — `linear-gradient(#FFF5F6 → #fff)` with decorative SVG corner geometry, brand row, title/subtitle, and an animated `TrajectoryHero` HTML5 canvas (red ball tracing 45° parabola arc with `requestAnimationFrame`; honors `prefers-reduced-motion`).
- **Product cards** (`juniorCard` / `seniorCard`) — clean white `1px solid var(--border)` cards, `border-radius: 24px`. Each has a top color bar (green/blue), inline SVG icon (`ForcesIcon` / `ProjectileIcon`), tag+age, title, hover lift + border color change, and a 3-col stats strip.
- **Features rail** — 3-column grid of feature tiles (রিয়েল-টাইম, বোর্ড স্ট্যান্ডার্ড, বাংলায়).
- **Sticky bottom callout** — `position: sticky; bottom: 0` with blur backdrop and green "শুরু করো →" CTA.

Original plan items (glass look, 3D icons) were superseded by the design bundle spec.

### B. Simulation Interface (Junior & Senior)
- **Header:** Use a blurred sticky header. Turn the Numeral Toggle into a custom "Toggle Switch" component.
- **Controls Panel:** 
  - Group parameters into "Glass" cards.
  - **Tactile Sliders:** Custom-styled range inputs that look like high-end equipment.
- **Readout Cards:** Use the 10MS brand palette more boldly (Red/Green/Blue) for labels to make data points "pop."
- **Bottom Sheet:** Improve the tab switching with "Slide & Fade" animations.

### C. Canvas Enhancements
- **The "Monitor" Frame:** Surround the canvas with a subtle dark border and "digital monitor" corners.
- **Glow Effects:** 
  - Update `drawTrajectory` and `drawBall` to use `ctx.shadowBlur`.
  - Update `drawForceArrow` with vibrant colors and sharp arrowheads.
- **Detailed Assets:** 
  - Improve the "Person" (stick figure) in Forces simulation with more "10MS" style characters.
  - Use a "Cricket Ball" asset for the projectile.

## 4. Bangladeshi Contextual Polishing
- **Typography:** Ensure `Hind Siliguri` (weights 400, 600, 700) is consistently applied.
- **Tone:** Consistently use "তুমি" (Tumi) for all instructions.
- **Copy:** Add helpful tips like "জানতে চাও কেন ৬০° আর ৩০° কোণে পাল্লা সমান হয়?" (Want to know why range is equal at 60° and 30°?).

## 5. Proposed Workflow
1.  **Phase 1: Foundation (CSS Tokens & Common Components)**
    - Update `tokens.css`.
    - Create `GlassCard`, `PremiumSlider`, and `Switch` components.
2.  **Phase 2: Home Screen Overhaul**
    - Redesign `ModeSelect.jsx`.
    - Add dynamic background.
3.  **Phase 3: Simulation UI Polish**
    - Apply new styles to `SeniorScreen.jsx` and `ForceScreen.jsx`.
    - Update `BottomSheet.jsx`.
4.  **Phase 4: Canvas Visual Upgrade**
    - Modify `canvas.js` and `forceCanvas.js` for glow effects and better assets.
5.  **Phase 5: Final Polish**
    - Add micro-animations and finalize Bangla copy.

---
> [!IMPORTANT]
> To achieve 95% confidence, I will first validate the new slider and glass effects in a separate scratch file to ensure they work smoothly across mobile viewports.
