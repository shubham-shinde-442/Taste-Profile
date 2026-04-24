# CalorAI Taste Profile

CalorAI Taste Profile is a 3-page React 18 + TypeScript app for onboarding new users through a swipe-based food preference flow. It implements the requested dark-mode experience, a custom light theme, Context-based state management, reusable hooks, smooth swipe interactions, and a responsive mobile-first UI.

## Live Status

- App routes: `Intro`, `Swipe`, `Results`
- Theme system: dark mode + custom light mode with persistence
- Input support: touch, mouse, action buttons, and keyboard arrows
- Verification completed: lint, tests, and production build
- Deployment status: production build is ready, but live hosting still needs to be done manually outside this environment
- Walkthrough video status: not recorded in this environment

## Screenshots

### Dark Theme

![Dark theme intro](./docs/screenshots/dark-theme.png)

### Light Theme

![Light theme intro](./docs/screenshots/light-theme.png)

## Demo Notes

- Local development: `npm run dev`
- Production preview: `npm run build` then `npm run preview`

## Component Architecture

The app is organized around a small route shell with focused, reusable UI pieces:

- `src/App.tsx`: top-level routes for `/intro`, `/swipe`, and `/results`
- `src/components/AppFrame.tsx`: shared mobile device shell, status bar, and theme toggle container
- `src/components/FoodCard.tsx`: swipeable card with motion states, preview badges, and image presentation
- `src/components/SwipeActions.tsx`: action cluster for dislike, like, super-like, and unsure states
- `src/components/ProgressBar.tsx`: progress indicator for swipe completion
- `src/components/InfoListCard.tsx`: reusable results list card
- `src/components/ThemeToggle.tsx`: theme switch UI backed by Context
- `src/pages/*.tsx`: route-level screens composed from shared components

## State Management Approach

The app uses Context API as the required minimum and keeps state concerns intentionally separated:

- `ThemeContext`
  - owns the current theme mode
  - persists the theme to `localStorage`
  - exposes `toggleTheme` and `setTheme`
- `TasteProfileContext`
  - owns swipe progress, current card index, and reaction history
  - persists swipe data to `localStorage`
  - derives liked, disliked, super-liked, and unsure buckets from source data
  - drives results-page summaries from the recorded reactions

Why Context here:

- It satisfies the task requirement directly.
- The app has small, app-wide state domains that do not justify Redux complexity.
- The separation between theme state and taste-profile state keeps rerenders predictable and the mental model simple.

## Custom Hooks

### `useLocalStorage`

- Generic persistence hook for serializing state to `localStorage`
- Used by both theme and taste-profile contexts
- Keeps persistence logic out of UI components

### `useSwipe`

- Encapsulates swipe threshold logic and gesture intent detection
- Supports pointer drag interactions and keyboard arrow actions
- Provides preview feedback before a swipe is committed

### `useTheme`

- Thin app-specific hook that exposes `ThemeContext`
- Keeps theme consumption ergonomic inside components

## Theme System

Both themes use the same design-token system defined in `src/styles.css`.

- No component hard-codes raw colors
- CSS custom properties drive backgrounds, text, borders, accents, and surfaces
- Theme mode is applied through `data-theme` on the root element
- Theme transitions are animated for a smoother switch

### Dark Mode

The dark theme follows the requested glassmorphism direction:

- layered gradients
- translucent surfaces
- soft border glow
- luminous accent buttons
- moody, high-contrast food-card presentation

### Light Mode Design Rationale

The light theme is intentionally not a simple inversion of dark mode. It is designed to feel like a calm nutrition and planning interface:

- warm cream-to-mint atmospheric background
- frosted pale-green cards to preserve the glass effect
- deeper evergreen typography for stronger contrast
- softer, sunlit accent treatment for CTA buttons
- consistent component geometry so both themes feel like the same product

## Feature Checklist Against The Brief

- React 18+ with hooks only
- Vite + TypeScript
- 3-page app
- Context API state management
- Theme preference persisted to `localStorage`
- Swipe data persisted to `localStorage`
- Smooth swipe interactions with Framer Motion
- Mouse, touch, button, and keyboard support
- Progress tracking
- Responsive mobile-first layout
- Dark theme implemented
- Custom light theme implemented
- Glassmorphism styling in both themes
- Reusable component architecture
- At least 2 custom hooks
- React Router
- Unit and integration tests
- Accessibility improvements

## Accessibility Notes

- Keyboard swipe support via arrow keys
- Meaningful `aria-label`s on action buttons and pagination dots
- Real image `alt` text on food cards
- Improved contrast in the custom light theme

## Libraries Used And Why

- `react`
  - core UI framework required for the task
- `react-router-dom`
  - keeps the 3-page flow explicit and easy to review
- `framer-motion`
  - handles drag gestures, transitions, and swipe feedback cleanly
- `clsx`
  - small helper for class composition
- `vitest`
  - lightweight test runner that fits naturally with Vite
- `@testing-library/react` and `@testing-library/user-event`
  - verify behavior from the user's perspective instead of implementation details

## Testing

Automated coverage currently includes:

- root route redirect behavior
- intro page render sanity check
- shared-link redirect from the root route
- theme persistence to `localStorage`
- left-swipe and dislike regression coverage
- keyboard navigation on the swipe screen
- shared payload rendering on the results page
- clipboard fallback coverage for shared links

Commands run successfully:

- `npm run lint`
- `npm run test`
- `npm run build`

## Responsive And Browser QA

Smoke checks were completed against the built app in Chromium-based browsers:

- Edge mobile-sized intro screen
- Edge mobile-sized swipe screen
- Chrome desktop shared-results screen

Remaining manual QA still recommended before submission:

- Safari on iPhone
- one Android device
- final deployed-host share-link retest

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

### 3. Run lint

```bash
npm run lint
```

### 4. Run tests

```bash
npm run test
```

### 5. Build production assets

```bash
npm run build
```

## Project Structure

```text
src/
  components/
  contexts/
  data/
  hooks/
  pages/
  test/
  types/
```

## Time Breakdown

Approximate implementation breakdown:

- 1.0h project audit and requirements gap analysis
- 2.0h interaction, results-flow, and theme-system refinements
- 1.0h accessibility and interaction polish
- 0.75h automated tests and lint/build cleanup
- 0.75h README, screenshots, and submission packaging

Total: about 5.5 hours for the current polished version

## AI Tool Usage Notes

AI was used as a coding partner for:

- implementation planning
- architecture review
- identifying rubric gaps
- refactoring suggestions
- test-case brainstorming
- README drafting and tightening

All final code paths, fixes, and submission notes were manually reviewed and verified through lint, tests, and build output.

## Challenges And Solutions

- Swipe-left originally behaved like an undo action instead of a dislike.
  - Fixed by correcting the Context update flow so left is stored as a real reaction.
- Existing source files had visible encoding corruption in multiple user-facing labels.
  - Replaced corrupted strings and normalized visible copy.
- Shared result links were brittle for real-device testing from nested routes.
  - Updated the share flow to generate root-based URLs so the payload survives static-hosting route constraints more reliably.

## Remaining Manual Submission Steps

These are the only items still needing manual completion outside this environment:

- deploy the production build to Vercel, Netlify, or GitHub Pages
- add the real live demo URL here once deployed
- record the 5 to 10 minute walkthrough video
- submit the final links through the provided form

## Suggested Live Demo Slot

- `Live demo URL: pending deployment`
