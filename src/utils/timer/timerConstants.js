export const DEFAULT_MODES = {
  FOCUS: { label: "Focus", time: 25 * 60 },
  SHORT_BREAK: { label: "Short Break", time: 5 * 60 },
  LONG_BREAK: { label: "Long Break", time: 15 * 60 },
};

export const UPSC_PRESETS = [
  { name: "Mains Sprint", focus: 90, short: 15, long: 30, icon: "✍️" },
  { name: "Prelims Mock", focus: 120, short: 20, long: 40, icon: "📝" },
  { name: "Answer Writing", focus: 30, short: 5, long: 15, icon: "⏱️" },
  { name: "Standard Pomo", focus: 25, short: 5, long: 15, icon: "🍅" },
];

export const TIMER_STORAGE_KEYS = {
  MODE: "timer-mode",
  TIME_LEFT: "timer-timeLeft",
  CYCLE: "timer-cycle",
  SESSIONS: "timer-sessions",
  SUBJECT: "timer-subject",
  TASK_ID: "timer-taskId",
  MODE_TIMINGS: "timer-modeTimings",
  IS_ACTIVE: "timer-isActive",
  LAST_UPDATE: "timer-lastUpdate",
};
