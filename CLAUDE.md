# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Start development server with Turbopack:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run ESLint:

```bash
npm run lint
```

## Project Architecture

This is a Next.js 15 project featuring various simulation and game implementations built for educational purposes. The project follows a modular architecture with clear separation of concerns.

### Core Structure

- **App Router**: Uses Next.js 15 app directory structure with page-based routing
- **Simulation Framework**: Custom hooks and utilities for canvas-based simulations
- **Component Library**: Radix UI components with Tailwind CSS styling

### Key Directories

- `app/`: Next.js app router pages - each simulation has its own route
- `lib/sims/`: Simulation logic implementations (boids, sand, rain, etc.)
- `hooks/`: Reusable React hooks for canvas management and animation
- `lib/`: Utility functions for vectors, canvas operations, and common helpers
- `components/`: Reusable UI components and simulation-specific components

### Canvas & Animation System

The project uses a sophisticated canvas management system:

- **`useAnimatedGridCanvas`**: Main hook for grid-based simulations with controllable FPS
- **`useResponsiveGridCanvas`**: Handles responsive canvas sizing with grid cell mapping
- **`useAnimationLoop`**: Core animation loop hook used across all simulations

### Simulation Types

1. **Grid-based**: Sand simulation, Game of Life, Rain simulation
2. **Vector-based**: Boid flocking, Walker patterns
3. **Hybrid**: Some simulations combine grid and vector approaches

### Vector Math Library

Comprehensive 2D vector utilities in `lib/utils-vector.ts`:

- Vector creation, manipulation, and math operations
- Used extensively in boid flocking and movement simulations
- All vector operations are pure functions

### Styling & UI

- **Tailwind CSS 4**: For styling with prose classes for content areas
- **shadcn/ui**: Component library built on Radix UI primitives (New York style)
- **Lucide React**: Icon library via shadcn/ui configuration
- **Custom Components**: Toggle groups, dialogs, and simulation controls in `components/ui/`

### TypeScript Configuration

Strict TypeScript setup with proper type definitions for all simulation entities and vector operations.

## Common Patterns

When adding new simulations:

1. Create simulation logic in `lib/sims/[name].ts`
2. Add page component in `app/[name]/page.tsx`
3. Use `useAnimatedGridCanvas` for grid-based or `useAnimatedCanvas` for free-form
4. Follow existing patterns for state management and rendering
5. Add navigation link to main page

The codebase emphasizes performance, type safety, and educational clarity in simulation implementations.

## Development Approach

This project is primarily for learning 2D coding and graphics programming. When working on this codebase:

- **Focus on teaching**: Provide step-by-step explanations of how implementations work
- **Explain concepts**: Break down mathematical concepts, algorithms, and 2D graphics principles
- **Guided implementation**: Offer suggestions and guidance rather than implementing everything directly
- **Educational value**: Prioritize understanding over speed of development
- **Step-by-step approach**: Implement features incrementally so each step can be understood

The goal is to learn through hands-on implementation with clear explanations of the underlying concepts.

## Code Comments

When adding comments to code, focus on educational value:

- **Explain what and why**: Describe what the code does and why it's implemented this way
- **Educational clarity**: Help others understand complex algorithms, mathematical concepts, or non-obvious logic
- **Current state only**: Comments should explain the current code, never reference past versions, changes, or implementation history
- **Conceptual understanding**: Break down complex operations into understandable steps

Good: `// Accumulate time to drive sine wave oscillation`
Bad: `// Updated to use deltaTime instead of frame-based timing`

## Code Consistency

When making changes to the codebase, always consider broader consistency:

- **Review related code**: Check if similar patterns exist elsewhere that should be updated
- **Maintain naming consistency**: If renaming types, functions, or concepts, update all references throughout the codebase
- **Update documentation**: Ensure comments, JSDoc, and README reflect changes
- **Check dependencies**: Consider if changes affect other simulations, components, or utilities that use the modified code
- **Follow established patterns**: New code should match existing architectural patterns and conventions

## Simplicity Over Engineering

Prefer simple, direct solutions over complex abstractions:

- **Leverage domain knowledge**: Use what you know about the problem constraints (e.g., angles are 0-360°) to write simpler code
- **Avoid premature abstraction**: Don't create generic solutions for specific problems unless multiple use cases exist
- **Question complexity**: If a solution feels overly complex, step back and look for a simpler approach
- **Readable over clever**: Choose clear, straightforward code over clever but hard-to-understand solutions

Example: Use `Math.abs(180 - angle)` instead of generic modulo arithmetic when you know angles are constrained to 0-360°.
