## Taste Profile

Interactive food preference app built with React + Vite + TypeScript.

Users swipe through foods (left/right/up/down) to build a taste profile, then get a data-driven results view with highlights, goals, and shareable profile links.

## Stack

- React 18
- TypeScript
- Vite
- Framer Motion
- Vitest + Testing Library

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run development server

```bash
npm run dev
```

### 3) Build for production

```bash
npm run build
```

### 4) Run tests

```bash
npm run test
```

## Scripts

- `npm run dev`: Start local dev server
- `npm run build`: Type-check and build production bundle
- `npm run preview`: Preview production build
- `npm run test`: Run test suite

## Project Structure

- `src/pages`: Route-level screens (`IntroPage`, `SwipePage`, `ResultsPage`)
- `src/components`: Reusable UI blocks (`FoodCard`, `SwipeActions`, `InfoListCard`, etc.)
- `src/contexts`: Theme and taste-profile state management
- `src/hooks`: Gesture and utility hooks
- `src/data`: Food and cuisine source data
- `src/types`: Shared domain types

## Notes

- Swipe directions are mapped as:
	- left: no
	- right: yes
	- up: superlike
	- down: unsure
- Results and highlights are derived from dataset-driven profile signals.
