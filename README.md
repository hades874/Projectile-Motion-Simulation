# Physics Simulation Hub

A Bangla-first, mobile-first React app for [10 Minute School's](https://10minuteschool.com) TenTen platform. Two fully custom HTML5 Canvas simulations aligned to the Bangladeshi SSC/HSC curriculum.

## Simulations

**Forces and Motion (Junior)** — SSC Chapter 2  
Four interactive tabs: Net Force, Motion, Friction, Tug of War. Toggle pushers, select objects/surfaces, and watch F=ma play out in real time.

**Projectile Motion (Senior)** — HSC Chapter 3  
Set v₀, θ, and h₀ with sliders; launch; observe range, max height, time of flight, and impact velocity. Supports trajectory overlay, velocity vectors, formula panel, range comparison (e.g. 30°/60° symmetry), and board-exam style results in Bangla numerals.

## Stack

- React 18 + Vite, React Router v6 (hash mode — iframe-embed safe)
- HTML5 Canvas for all physics rendering
- CSS Modules with 10MS design tokens (`src/styles/tokens.css`)
- Vitest for physics unit tests

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # production build
npm test         # 17 physics unit tests
npm run lint
```

