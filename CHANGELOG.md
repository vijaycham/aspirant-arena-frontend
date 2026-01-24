# Changelog

All notable changes to the **Aspirant Arena Frontend** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.2] – 2026-01-24
### Fixed
- Auto-complete focus sessions that finished while the app was closed or device was asleep
- Prevented timer from getting stuck at `00:00` after background or offline completion
- Ensured completed sessions are always logged and recoverable on app reopen

## [1.6.1] – 2026-01-24
### Fixed
- Prevented focus session data loss when switching timer modes during an active run.
- Active sessions are now either blocked from unsafe mode switches or automatically saved as interrupted.

## [1.6.0] – 2026-01-24
### Added
- **Stopwatch Mode (Count-Up)**
  - Infinite study sessions with a 4-hour safety cap.
  - Short sessions (<5 minutes) are ignored with contextual user feedback.
  - Fully integrated with efficiency, streaks, and analytics.

- **Daily Goal Widget**
  - Visual progress ring for daily focus targets.
  - One-time confetti celebration when the goal is achieved.
  - Offline-safe goal completion handling.

### Changed
- Improved mobile layout and widget positioning.
- Stabilized timer rendering to eliminate flicker and NaN edge cases.
- Optimized layout containers to prevent UI jumps during mode switches.

### Fixed
- Timer resume glitches when switching between Countdown and Stopwatch.
- Mobile overflow issues with timer mode toggles.

### Dependencies
- Added `canvas-confetti` for lightweight celebratory effects.

## [1.5.5] – 2026-01-24
### Fixed
- Rounded focus session duration to avoid losing near-complete minutes.

## [1.5.4] – 2026-01-24
### Fixed
- Restored automatic transition from Break back to Focus mode.
- Fixed leaderboard daily reset to respect the user’s local timezone.

## [1.5.3] – 2026-01-24
### Added
- Product analytics integration using PostHog.
- Page view tracking via Google Analytics 4.
- UX insights via Microsoft Clarity (heatmaps & session replays).
- Secure user identification for analytics events.

### Changed
- Focus session analytics are now fired only after successful persistence.
- Improved reliability of analytics events in multi-tab and offline recovery scenarios.

### Notes
Analytics are optional and enabled only when environment variables are provided.

## [1.5.2] – 2026-01-23
### Fixed
- Removed deprecated `@testing-library/react-hooks` which was incompatible with React 19.
- Restored CI and Vercel builds.

## [1.5.1] - 2026-01-23
### Added
- **Production-Grade Timer Core**
  - Absolute time–based timer using a fixed `TARGET_TIME` anchor.
  - Stable session identifiers (`sessionId`) generated once per session to prevent duplicate logs.
  - Offline-first session queue with automatic sync on reconnect.
  - Cross-tab timer synchronization using `localStorage` and storage events.
  - Media Session API support for lock-screen and Bluetooth controls.
  - Guaranteed reflection recovery if the tab is closed mid-reflection.

### Changed
- **Timer Accuracy & Persistence**
  - Pause / Resume logic now preserves only active focus time.
  - Reduced high-frequency `localStorage` writes to improve performance and battery life.
  - Unified timer state initialization to prevent flicker and race conditions on reload.
- **UX & Feedback**
  - Optimized ambient audio lifecycle (no unnecessary recreation).
  - Improved offline save feedback for better user clarity.

### Fixed
- Timer drift caused by browser throttling and backgrounding.
- `0:00` flicker and refresh-loop bugs on reload.
- Stale closure issues between Web Worker and completion logic.
- Duplicate session logging caused by reloads or multi-tab usage.
- Edge cases leading to NaN / invalid progress calculations.

### Notes
This changes safely reintroduces timer reliability improvements that were reverted in **v1.5.0**, after isolating and fixing architectural and lifecycle issues.  

## [1.5.0] - 2026-01-18
### Added
- **Mobile Timer Resilience** 📱
  - **Absolute Time Architecture**: Replaced interval-based ticking with timestamp-driven calculation (`targetTime - Date.now()`).
  - **Result**: Timer is immune to background throttling on mobile browsers (Safari/Chrome), remaining accurate even when the device is locked.
  - **Offline Queue**: Focus sessions completed while offline are persisted locally and automatically synced when connectivity is restored.

- **Smart Notifications**
  - **Haptic Feedback**: Added `navigator.vibrate([500, 200, 500])` for tactile mobile alerts.
  - **System Integration**: Audio, vibration, and browser notifications now fire together to ensure breaks are never missed.

### Changed
- **Battery Optimization**: Reduced `localStorage` writes from once per second to on-demand (Pause / Stop / unload), significantly improving mobile battery life.
- **Minimum Valid Duration**: Increased focus session threshold from 60 seconds to **5 minutes** to prevent accidental micro-logs.
- **UX Polish**: Added a *“Session Restored 🔄”* toast when recovering an active timer after reload.

### Fixed
- **Worker Path Resolution**: Migrated `timerWorker.js` to `src/workers/` and resolved via `new URL()` to fix production build issues.
- **Double-Log Race Condition**: Added a `completedRef` guard to prevent duplicate session logging.
- **Leaked Pause State**: Fixed an issue where paused focus time could incorrectly carry over when switching modes.

### Added
- **Mobile Timer Resilience** 📱
  - **Absolute Time Architecture**: Replaced relative interval decrement with Timestamp-based calculation (`TargetTime - Now`).
  - **Result**: Timer is now immune to background throttling on mobile devices (Safari/Chrome), maintaining 100% accuracy even when the phone is locked.
  - **Offline Queue**: Focus sessions completed while offline are queued locally and automatically synced when the connection returns.

- **Smart Notifications**
  - **Haptic Feedback**: Added `navigator.vibrate([500, 200, 500])` for tactile alerts on mobile.
  - **System Integrations**: Simultaneous Audio, Vibration, and Browser Notification firing ensures breaks are never missed.

### Changed
- **Battery Optimization**: Reduced `localStorage` write frequency from 60Hz (every second) to On-Demand (Pause/top), significantly extending battery life.
- **Minimum Valid Duration**: Increased focus threshold from 60s to **5 minutes** to prevent accidental "micro-logs" from polluting stats.
- **UX Polish**: Added "Session Restored 🔄" toast when recovering a timer session after a browser reload.

### Fixed
- **Worker Path**: Migrated `timerWorker.js` to `src/workers/` with `new URL()` resolution to fix production 404 errors.
- **Double-Log Bug**: Implemented a `completedRef` latch to prevent race conditions where a single session could be logged twice.
- **Leaked Pause State**: Fixed a bug where switching modes (Focus -> Break) would incorrectly carry over the paused remaining time.

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
