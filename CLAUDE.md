@AGENTS.md

# Gry Brzezinka — Game Platform

## Project

Kids game platform deployed on Vercel at https://mig-kids-games.vercel.app (docelowo gry.brzezinka.eu).
Stack: Next.js 16, React 19, Three.js, React Three Fiber, Zustand, Tailwind CSS, TypeScript.

## Workflow

- **Branch**: commit and push directly to `main` — Vercel auto-deploys from main.
- **Test locally before pushing**: always run `npm run build` and verify changes work before committing.
- **Dev server**: `npm run dev` — use it to check runtime errors, especially for Three.js/WebGL code.
- **Deploy**: every push to `main` triggers Vercel deploy automatically. No need for PRs unless explicitly asked.

## Commands

- `npm run dev` — local dev server
- `npm run build` — production build (must pass before pushing)
- `npm run lint` — ESLint

## Architecture

```
src/
├── app/                          # Next.js App Router (pages)
│   ├── page.tsx                  # Landing page (game selection)
│   └── games/<game-name>/       # Each game gets its own route
├── games/<game-name>/           # Game source code
│   ├── core/                    # Pure TypeScript logic (no React/DOM deps)
│   │   ├── types.ts
│   │   ├── data/                # Constants, definitions
│   │   └── systems/             # Game logic as pure functions
│   ├── store/                   # Zustand state management
│   ├── render/                  # Three.js / R3F 3D scene
│   ├── ui/                      # React UI overlay (HUD, menus)
│   ├── input/                   # Keyboard, touch, game loop
│   └── persistence/             # Save/load
└── components/                  # Shared platform components
```

## Key rules

- Game logic in `core/` must be pure TypeScript — no DOM, React, or Three.js imports. This keeps it testable.
- Three.js components must use `'use client'` directive.
- Dynamic import Three.js scenes with `ssr: false` to avoid SSR crashes.
- Always wrap game pages with `GameErrorBoundary`.

## Current games

- **Karol's Farm 3D** (`/games/karols-farm`) — farm simulator with 3D rendering
