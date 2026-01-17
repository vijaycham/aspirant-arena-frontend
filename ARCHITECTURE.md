# System Architecture 🏗️

This document describes the design system, state management, and directory structure of the **Aspirant Arena Frontend**.

## 🌲 Folder Structure
```text
src/
├── assets/         # Images, Icons, & Static Media
├── components/     # Reusable UI Atoms (Header, Buttons, Modals)
├── hooks/          # Custom logical hooks (useTimer, useTasks)
├── pages/          # Main route components (Home, Tasks, Tracker)
├── redux/          # Global state (user, task) + Persistence
├── utils/          # API config, Auth helpers, & Constants
└── test/           # Global testing configurations
```

## 🔄 Core Logic Flows

### 1.- **The Arena System**: Modular exam tracks with recursive hierarchical tracking using a flattened node architecture.
- **Precision Focus Backend**: Dedicated endpoints for persistence catch-up, session reflection, and high-frequency real-time statistics.
- **Trust-Based Onboarding**: 24-hour grace period for exploration before mandatory email verification.
- **Deep Analytics**: Specialized MongoDB aggregation pipelines for GitHub-style heatmaps and multi-level syllabus rollups.
- **Enterprise Security**: Rate limiting, JWT state management in HttpOnly cookies, and Helmet-secured headers.

### 1. State Management (Redux Toolkit)
The app uses a combination of local state (for UI transitions) and Redux (for persistent data).
- **User Slice**: Manages auth status and verification details.
- **Task Slice**: Manages the local cache of tasks to ensure snappy UI updates.

### 2. The Aura Design System
Built with **Tailwind CSS** and **Framer Motion**, the design philosophy focuses on "Deep Focus":
- **Space-Theme Aesthetic**: Slate-900/950 backgrounds with vibrant primary-600 (Indigo) accents.
- **Micro-Animations**: Subtle hover transitions and progress ring animations.
- **Zen Mode**: A specific overlay system that locks the DOM and enables fullscreen focus.

## 🛠 Features & Modularity

### 1. Strategic Analytics Hub
Instead of generic charts, the app employs specialized "Aspirant-First" metrics:
- **Error Profiling**: Categorization of mistakes (Conceptual, Silly, Time Pressure) within the Test Tracker.
- **Lost Marks Analyzer**: Real-time tallying logic ensuring all missed marks in a mock paper are accounted for.
- **Mastery Analytics**: Uses `react-calendar-heatmap` for consistency tracking and `recharts` for focus rhythm visualization.

### 2. Leaderboard & Gamification (v1.3.0)
The gamification engine uses a hybrid aggregation strategy:
- **Podium Engine**: Visualizes Top 3 ranks with Gold/Silver/Bronze card systems.
- **Smart Identity**: Determining user avatar falls back: `PhotoURL` -> `DiceBear Robot Avatar` -> `Initials`.
- **GlassCard System**: Unified component architecture for consistent `backdrop-blur-xl` panels across the Leaderboard.

### 3. Authentication & Security (v1.4.0)
- **Recovery Architecture**: Cryptographically secure "Forgot Password" flow using deep-linked tokens.
- **Danger Zone**: Account deletion logic with cascaded cleanup triggers.
- **Verification Bridge**: Google OAuth flows are now verified server-side via `firebase-admin` to prevent token spoofing.

### 4. The Focus Arena (Audio & Timing Hub)
The `useTimer` hook is the heartbeat of the application, managing high-fidelity timing and atmosphere:
- **Persistence 2.0 (Smart Resume)**: Implements a "Gap Calculation" logic. If a user returns after the tab was closed, the app calculates the elapsed time since `timer-lastUpdate` and resumes the countdown precisely.
- **Web Worker Timing**: Timing logic is offloaded to `/workers/timerWorker.js` to bypass browser-level CPU throttling of background tabs.
- **Zen Mode 2.0**: A cinematic focus experience using the Browser Fullscreen API, document scroll locking, and pulsing atmospheric glows.
- **Mobile Lock-Screen Mastery**: Leveraging the Media Session API to sync timer countdowns with native OS media controls and lock-screen play/pause buttons.
- **Ambient Atmosphere**: High-quality audio loops (Rain, Lo-fi, River) with volume persistence and "Audio Priming" to ensure reliability on mobile autoplay restrictions.

## 🧪 Testing Strategy
- **Unit Testing**: Using Vitest and React Testing Library for critical logical hooks (`useTimer.js`, `useTasks.js`).
- **Integration Testing**: Verifying the synergy between Redux persistence and API synchronization.
- **Component Atomization**: Large features are decomposed into small, purely functional atoms in the `src/components/` directory for better maintainability.
