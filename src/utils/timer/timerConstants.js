export const DEFAULT_MODES = {
  FOCUS: { label: "Focus", time: 25 * 60 },
  SHORT_BREAK: { label: "Short Break", time: 5 * 60 },
  LONG_BREAK: { label: "Long Break", time: 15 * 60 },
};

export const MIN_VALID_DURATION = 300; // 5 Minutes

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
  LAST_UPDATE: "timer-lastUpdate",
  TARGET_TIME: "timer-targetTime",
  PAUSED_REMAINING: "timer-pausedRemaining",
  ENABLE_REFLECTION: "timer-enableReflection",
  AMBIENT_SOUND_ENABLED: "timer-ambientEnabled",
  AMBIENT_SOUND_TYPE: "timer-ambientType",
  AMBIENT_VOLUME: "timer-ambientVolume",
  PENDING_SESSION: "timer-pendingSession",
  SYNC_QUEUE: "timer-syncQueue",
};

export const AMBIENT_SOUNDS = [
  { id: "none", label: "None", url: null },
  {
    id: "rain",
    label: "Rain",
    url: "https://www.orangefreesounds.com/wp-content/uploads/2018/04/Gentle-rain-loop.mp3"
  },
  {
    id: "river",
    label: "River",
    url: "https://www.soundjay.com/nature/river-1.mp3"
  },
  {
    id: "lofi",
    label: "Lo-fi",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  }
];
