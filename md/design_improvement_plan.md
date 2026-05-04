# Design Improvement Plan: Projectile Motion Simulation Hub

This plan outlines the visual and interactive improvements for the Physics Simulation Hub, aiming for a "wow" factor while maintaining the 10 Minute School (10MS) brand identity and NCTB curriculum alignment.

## 1. Aesthetic Direction: "Premium Educational Lab"
The goal is to move from a "flat" functional UI to a "premium lab" feel that inspires students, with a **strict mobile-first priority**.
- **Glassmorphism:** Use frosted glass effects (`backdrop-filter: blur()`) for control panels and overlays.
- **Physics Glow:** Add a subtle "bloom" or "glow" effect to trajectories, force arrows, and active physics elements.
- **Dynamic Backgrounds:** Introduce drifting geometry (△ ○ ▢) and subtle grids to make the interface feel "alive."
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

### A. Home Screen (ModeSelect)
- **Visuals:** Add a Hero section with a background illustration of a physics lab or abstract geometry.
- **Cards:** 
  - Redesign cards with a "Glass" look and **mobile-friendly sizing**.
  - On hover (and touch-active): Scale up by 2%, increase border thickness, and add a soft shadow colored by the segment.
  - Use high-quality 3D-styled icons (generated) that are clear even on smaller screens.

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
