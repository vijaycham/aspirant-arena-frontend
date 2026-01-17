# Changelog

All notable changes to the **Aspirant Arena Frontend** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-01-17
### Added
- **Password Recovery UI**
  - Forgot Password screen with secure email validation.
  - Reset Password flow with deep-link token support.

### Changed
- Refactored Profile “Danger Zone” into a collapsible **Advanced Settings** section.
- Improved test stability for auth-related flows.

### Testing
- Stabilized toast mocking using `vi.hoisted()`.
- Fixed async navigation timing issues using controlled fake timers.

## [1.3.1] - 2026-01-16
### Changed
- **Hybrid Header Architecture**
  - **Desktop**: Clean, right-aligned navigation (icon-free) visible at the `xl` breakpoint for improved layout stability.
  - **Mobile**: Retained rich, icon-based drawer with descriptive actions.
  - **UX Improvements**: Verification status moved into the profile dropdown with added outside-click and Escape key handling.

- **Minimalist Footer**
  - Unified with the Header using `slate-900/95` glassmorphism styling.
  - Integrated authentic social links and a dedicated **Help & Support** route.

- **Page Refinements**
  - **About Page**: Updated professional contact links (LinkedIn and Support email).

- **Bug Fixes**
  - Fixed duplicate `ThemeToggle` rendering on mobile viewports.

## [1.3.0-leaderboard] - 2026-01-15
### Added
- **Leaderboard System** 🏆
  - **Competitive Rankings**: Daily, Weekly, and Monthly rankings calculated from focus hours.
  - **Podium View**: Premium Top 3 visualization with Gold, Silver, and Bronze cards, including crown animations.
  - **Smart Identity**: Displays user profile photos when available and automatically falls back to deterministic Robot Avatars (DiceBear) if images are missing or fail to load.

- **UI Architecture**
  - **<GlassCard> System**: Introduced a unified glassmorphism component (`backdrop-blur-xl`, `bg-white/50`) to replace ad-hoc styles.
  - **Responsive Tables**: Ranking tables support horizontal scrolling on mobile (`overflow-x-auto`) without breaking layout.
  - **Adaptive Grid**: Podium avatars scale intelligently (`w-24` on desktop → `w-20` on mobile) with optimized grid spacing.

### Quality Assurance
- Added integration tests covering leaderboard loading states, empty states, and error handling.

## [1.2.1-fix] - 2026-01-14
### Fixed
- Fixed task input layout issues on tablets and mobile devices
- Prevented accidental Kanban drag actions on touch devices
- Corrected misleading “Completed & Archived” task behavior

### Added
- Explicit Archive action for completed tasks
- Clear separation between Completed and Archived task states


## [1.2.0-visual] - 2026-01-14
### Added
- **Visual Workflow**
  - **Kanban Board**: Drag-and-drop task management with clear status transitions.
  - **Calendar View**: Month and Week views to visualize tasks by due date.
  - **Smart Toolbar**: Unified switcher for List, Board, and Calendar views with time-based filters (Today, Upcoming).

- **Task Input 2.0**
  - **Split Date & Time Inputs**: Dedicated controls for due date and time with an improved layout.
  - **Dark Mode–Ready Inputs**: Native date pickers with correct color-scheme handling and icon visibility.

- **Quality & Verification**
  - Added unit tests for Kanban Board rendering and column behavior.
  - Added unit tests for Calendar event mapping and date handling.

## [1.1.2-polish] - 2026-01-14
### Fixed
- **Interaction Hardening**:
    - **Robust Dropdowns**: Replaced fragile CSS-backdrop menus with a reliable `useClickOutside` logic using React Refs. Fixed sporadic touch/click failures on Timer and Task Input.
    - **Session Persistence**: Implemented `localStorage` state recovery. Timer state (pending Reflection) now survives browser refreshes.
    - **Auto-Save**: Timer completion modal now defaults to a neutral rating if dismissed, preventing data loss.
- **Visual Polish**:
    - **Dark Mode Consistency**:
        - Fixed invisible "black-on-black" text in Focus Heatmap.
        - Replaced glowing "radioactive" button shadows with deep, transparent shadows (`indigo-900/30`).
        - Added dedicated Dark Mode styles to Task Input's "Type-Ahead" suggestions.
    - **Animation Tuning**: Slowed down the global `shimmer` effect from 2s to **8s** for a calmer, less frantic loading state.
    - **Artifact Removal**: Eliminated the "square shadow" glitch on Task Input dropdowns by removing the faulty backdrop layer.
    - **Data Clarity**: Added rounding logic to Analytics charts (Line/Pie/Bar) to display clean integers (e.g., "5") instead of floats strings (e.g., "5.666").

## [1.1.0-dark] - 2026-01-13
### Added
- **Midnight Glass UI (Dark Mode)**:
    - **Premium Theme**: Deep `slate-950` aesthetic for late-night focus sessions.
    - **Smart Toggle**: Persistent preference syncing with system defaults.
    - **Adaptive Components**: Over 15 core components (Charts, Modals, Timers) now auto-adapt to lighting conditions.
- **Performance Tuning**:
    - **Fast Transitions**: Reduced global animation timings from 300ms to **200ms** for a snappier feel.
    - **Glitch Prevention**: Synchronized background/text color transitions to eliminate "flashbang" effects during theme toggles.
- **UI Polish**:
    - **Harmonized Buttons**: Unified Primary/Secondary CTA styles on the Dashboard for visual consistency.
    - **Ghosting Fix**: Removed shadow animations on interactive elements to prevent layout thrashing.

## [1.0.2-coverage] - 2026-01-13
### Quality Assurance & Reliability
- **Comprehensive Test Suite**: Achieved **>67% Project Coverage** (up from ~40%).
- **Critical Path Protection**:
    - **Authentication**: 100% coverage on `authSlice`, 95% on `SignIn.jsx`.
    - **Task Management**: Expanded `TaskInput` tests to cover priority, dates, and smart suggestions.
    - **Redux State**: 100% coverage on `taskSlice` and robust `arenaSlice` logic tests.
- **Infrastructure**:
    - Configured `@vitest/coverage-v8` for HTML/Text reporting.
    - Added `coverage/` to `.gitignore` to maintain repo hygiene.

## [1.0.1-arena] - 2026-01-13
### Fixed
- **Domain Redirection**: Enforced canonical domain (`www.aspirantarena.in`) via `vercel.json` edge redirects to prevent legacy URL access and authentication failures.
- **Preview Isolation**: Configured redirect logic to preserve access to Vercel preview/branch URLs for testing.

## [1.0.0-arena] - 2026-01-10
### Added
- **Aspirant Arena v1.0 Branding**: Transitioned from generic "Productivity" to specialized "Arena" HLD.
- **Syllabus Tracker UI**: Integrated recursive tree view for UPSC and other competitive exams.
- **Smart Task Input**:
    - "Roadmap Picker": Folder-style UI to drill down into syllabus and link tasks.
    - **Type-Ahead**: Intelligent suggestions for syllabus topics from text input.
    - Auto-link logic: Selecting a suggestion automatically attaches `nodeId`.
- **Performance**:
    - **Client-Side Syllabus Loader**: Lazy-loads the master JSON bundle for zero-latency access (replacing DB calls).
- **Timer Enhancements**:
    - **Task-Mediated Flow**: Timer page now tracks time against the *selected task*.
    - Visual "Time Bubble": Real-time updates of time spent on syllabus progress bars.
- **Arena Management**:
    - "Delete Arena" button in Dashboard with confirmation modal.
    - "Auto-Select": Task Input skips arena selection for single-arena users.
- **Modular Dashboard**: Support for switching between multiple Exam Arenas.
- **Quality Assurance**:
    - **Unit Tests**: Added `TaskInput.test.jsx` verifying Smart Input and Lazy Loading.
    - **Regression Fixes**: Patched `useTimer` tests for Redux compatibility.

## [v0.7.0] - 2026-01-10
### Added
- **Zen Mode 2.0 (Cinematic)**: Native Browser Fullscreen API integration with atmospheric glows.
- **Focus Heatmap**: GitHub-style consistency grid for tracking 365 days of activity.
- **Ambient Atmosphere**: Built-in audio loops (Rain, River, Lo-fi) with volume persistence.
- **Smart Notifications**: Browser-level alerts for focus transitions.

## [v0.6.0] - 2026-01-04
### Added
- **Trust-Based UI Flow**: "Premium" blurred overlays and grace period indicators.
- **Persistent Cooldowns**: Resend verification logic that survives page refreshes.
- **Mobile Responsive Header**: Redesigned navigation for seamless tablet/phone support.

## [v0.5.0] - 2025-12-30
### Added
- **Strategic Test Tracker**: Specialized mockery paper logger (Conceptual Errors, Silly Mistakes).
- **Strategy Coach**: Automated advice based on test performance trends.
- **Global State**: Redux Toolkit + Persistence integrated.
- **Initial Design**: Glassmorphic "Aura" design system with Framer Motion.
