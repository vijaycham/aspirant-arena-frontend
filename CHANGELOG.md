# Changelog

All notable changes to the **Aspirant Arena Frontend** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
