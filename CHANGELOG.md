# Changelog

All notable changes to the **Aspirant Arena Frontend** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
