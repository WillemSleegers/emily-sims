# README

Simulations based on _The Nature of Code_, rebuilt in Next.js instead of p5.js. Each sim is a route under `app/`, with the actual logic in `lib/sims/`.

## Core setup

The book uses a global `setup()`/`draw()` sketch. This project uses React hooks instead:

- **`useAnimationLoop`** (`hooks/animationLoop.ts`) — the `requestAnimationFrame` loop. Computes `deltaTime` each frame and clamps it to 100ms so a backgrounded tab doesn't cause a physics explosion when you switch back.
- **`useResponsiveCanvas`** (`hooks/useResponsiveCanvas.ts`) — owns canvas sizing via `ResizeObserver` and sets up the canvas for high-DPI screens. Canvas size always comes from here, never from CSS.
- **`useAnimatedCanvas`** (`hooks/useAnimatedCanvas.ts`) — combines the two above. Each frame it calls `onUpdate(deltaTime, size)` then `onDraw(ctx, size)`. This is the `draw()` equivalent for vector-based sims (boids, walkers, attraction).
- **`useAnimatedGridCanvas`** / **`useResponsiveGridCanvas`** — the grid variant, used by Game of Life, sand, and rain. Canvas dimensions snap to multiples of `cellSize`, and update/draw are throttled to a target FPS by accumulating time, instead of running on every animation frame.

Each sim page (`app/[name]/page.tsx`) owns its own state in a `useRef`, wires it into one of the hooks above, and renders any controls (speed toggles, color pickers, etc.) around the canvas.

## Vector math

`lib/utils-vector.ts` covers what `PVector` does in the book, but as plain functions instead of methods: `addVectors(a, b)` instead of `a.add(b)`. Entities (`Walker`, `Boid`, `Circle`) are plain typed objects, not classes, and update/draw logic lives in standalone functions that take the object and mutate it.

Forces follow the same pattern as the book's `Mover`/`Vehicle`: `applyForce` adds into `acceleration`, and the update step folds that into velocity, then zeroes acceleration out for the next frame. See `lib/sims/boid.ts` and `lib/sims/circle.ts`.

## Deviations from the book

- **Framerate-independent motion.** The book assumes a steady ~60fps and moves things by a fixed amount per frame. Here, speed is in pixels per second, and movement is scaled by `deltaTime` so a sim looks the same regardless of frame rate.
- **Each sim is a routed page with real UI controls**, not a standalone sketch. There's a shared component layer (`SimLayout`, `Canvas`, toggle groups) the book has no equivalent for.
