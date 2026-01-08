# ⏳ Focus Arena: Development Plan

Detailed architecture and roadmap for the premium Pomodoro & Deep Work system.

## 🏗️ Architecture Overview

### Backend (Node.js/Express/MongoDB)
- **Model**: `FocusSession`
  - `userId`: ObjectId (Ref User)
  - `subject`: String
  - `task`: ObjectId (Ref Task, Optional)
  - `startTime`: Date
  - `endTime`: Date
  - `duration`: Number (in minutes)
  - `type`: Enum ['focus', 'short-break', 'long-break']
  - `cycleNumber`: Number (1-4)
  - `source`: Enum ['manual', 'pomodoro']
  - `status`: Enum ['completed', 'interrupted']
  - `focusRating`: Number (1-5)

### Frontend (React/Vite/Tailwind)
- **State Management**: Custom hook `useTimer` with LocalStorage persistence.
- **Exam-Specific Context**: Built-in support for **UPSC** presets.
- **Components**:
  - `TimerDisplay`: High-impact typography with click-to-edit manual input.
  - `SessionControls`: Start/Pause/Skip/Reset + Reset Day/Cycle headers.
  - `FocusInput`: Subject/Task selector (Link existing Todos to sessions).
  - `StrategyPresets`: UPSC Mains/Prelims strategy selectors.

---

## 🚀 Roadmap (Commit-by-Commit)

### Phase 1 & 2: Core Foundation & Integration (COMPLETED ✅)
- [x] **Commit 1-5**: Backend Setup, Basic Timer UI, Persistence, and Auto-save logic.
- [x] **Commit 6-9.5**: UPSC Presets, Manual Control, Optimistic Stats, and Todo Integration.
- [x] **Commit 9.6-9.7**: Data Quality (1m threshold), Refactoring, and Test Suite.
- [x] **Commit 9.8**: Header Integration with flashy "NEW" badge.

### Phase 3: Advanced Deep Work Features (IN PROGRESS 🏗️)
- [x] **Commit 10: Persistence 2.0 (Smart Resume)**: Pick up exactly where left off if tab is closed using `LAST_UPDATE` timestamps.
- [x] **Commit 11: Web Worker Support**: Battery-accurate background timing for mobile/minimized tabs.
- [ ] **Commit 12: Focus Intensity Score**: Post-session 1-5 star rating & feedback notes stored in DB.
- [ ] **Commit 13: Ambient Focus Sounds**: Built-in Royalty-Free White Noise (Rain, Library, Lo-fi).
- [ ] **Commit 14: Fullscreen Zen Mode**: Minimalist, distraction-free UI toggle.

### Phase 4: Mastery Analytics
- [ ] **Commit 15: Study Heatmap**: GitHub-style grid for daily productivity tracking.
- [ ] **Commit 16: Subject Wise Distribution**: Advanced analytics (Pie Chart: "60% Geography, 20% Optional").
- [ ] **Commit 17: Syllabus Tracker Sync**: Automatically mark topics as "In Progress" in the Syllabus Tracker.
- [ ] **Commit 18: Study Logs History**: Dedicated page to browse past deep work sessions.

---

## 🗒️ Changelog

### [2026-01-08] - Phase 3 Kickoff: Survival Mode
- **Starting Persistence 2.0**: Implementing timestamp-based "catch-up" logic to prevent time loss on tab close.

### [2026-01-08] - Phase 2 Final Polish & Header Launch
- **Header Integration**: Added "Focus Arena" to the main site header with a pulsating "NEW" badge.
- **UI Bugfix**: Removed intrusive black focus rings and tap highlights from Recharts/PieCharts in `AnalyticsSection`.
- **Merged to Main**: All Phase 2 work successfully merged and standardized.

### [2026-01-08] - Refactoring & Testing Suite
- **Backend Testing**: Created `focus.test.js` covering session creation and daily stats aggregation.
- **Frontend Testing**: Created `useTimer.test.jsx` covering state transitions, persistence, and save logic.
- **Code Refactor**: 
    - Extracted timer constants to `timerConstants.js`.
    - Refactored `focusController` to use `catchAsync` for cleaner error handling.

### [2026-01-08] - Todo Integration & Final Polish
- **Todo Task Selection**: Added a "Choose Task" feature to the Focus Mission input. Users can now link their active Todos directly to a Pomodoro session.
- **Backend Fixes**: Resolved a critical middleware typo in `focusRoutes.js` that caused server crashes.
