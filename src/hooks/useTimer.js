// ⚠️ TIMER CORE — DO NOT MODIFY WITHOUT FULL REVIEW
import { useState, useEffect, useCallback, useRef } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { DEFAULT_MODES, TIMER_STORAGE_KEYS, AMBIENT_SOUNDS, MIN_VALID_DURATION } from "../utils/timer/timerConstants";
import { safeUUID } from "../utils/safeUUID";
import { useDispatch } from "react-redux";
import { syncNodeTime } from "../redux/slice/arenaSlice";
import posthog from 'posthog-js'; // 🦔

export const useTimer = () => {
  const dispatch = useDispatch();
  /* ------------------ HELPERS ------------------ */
  const loadJSON = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  };

  const rehydrateTime = useCallback(() => {
    const target = localStorage.getItem(TIMER_STORAGE_KEYS.TARGET_TIME);
    if (target) {
      if (target === "STOPWATCH_RUNNING") {
        const start = parseInt(localStorage.getItem('timer-startTime'), 10);
        if (start && !isNaN(start)) {
          return Math.floor((Date.now() - start) / 1000);
        }
        return 0;
      }
      const remaining = Math.ceil((parseInt(target, 10) - Date.now()) / 1000);
      return Math.max(0, remaining);
    }
    const paused = localStorage.getItem(TIMER_STORAGE_KEYS.PAUSED_REMAINING);
    if (paused && !isNaN(parseInt(paused, 10))) return parseInt(paused, 10);

    const timings = loadJSON(TIMER_STORAGE_KEYS.MODE_TIMINGS, DEFAULT_MODES);
    const currentMode = localStorage.getItem(TIMER_STORAGE_KEYS.MODE) || "FOCUS";
    return (timings[currentMode] || DEFAULT_MODES.FOCUS).time;
  }, []);

  /* ------------------ STATE ------------------ */
  const [mode, setMode] = useState(() => localStorage.getItem(TIMER_STORAGE_KEYS.MODE) || "FOCUS");
  // 🛡️ MERGE: Ensure we include ANY new keys from DEFAULT_MODES even if using cached data
  const [modeTimings, setModeTimings] = useState(() => {
    const saved = loadJSON(TIMER_STORAGE_KEYS.MODE_TIMINGS, DEFAULT_MODES);
    return { ...DEFAULT_MODES, ...saved };
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    const targetTime = localStorage.getItem(TIMER_STORAGE_KEYS.TARGET_TIME);
    if (targetTime) {
      if (targetTime === "STOPWATCH_RUNNING") {
        const start = parseInt(localStorage.getItem('timer-startTime'), 10);
        if (start && !isNaN(start)) {
          return Math.floor((Date.now() - start) / 1000);
        }
        return 0;
      }
      const remaining = Math.ceil((parseInt(targetTime, 10) - Date.now()) / 1000);
      return Math.max(0, remaining);
    }
    const pausedRemaining = localStorage.getItem(TIMER_STORAGE_KEYS.PAUSED_REMAINING);
    if (pausedRemaining && !isNaN(parseInt(pausedRemaining, 10))) return parseInt(pausedRemaining, 10);

    const timings = loadJSON(TIMER_STORAGE_KEYS.MODE_TIMINGS, DEFAULT_MODES);
    const currentMode = localStorage.getItem(TIMER_STORAGE_KEYS.MODE) || "FOCUS";
    return (timings[currentMode] || DEFAULT_MODES.FOCUS).time;
  });

  // Derived state for reactivity (forces re-renders on storage changes)
  const [, setActiveTick] = useState(0);
  const isActive = !!localStorage.getItem(TIMER_STORAGE_KEYS.TARGET_TIME);
  const isLockedRef = useRef(false); // For toggle throttling
  const [cycleNumber, setCycleNumber] = useState(() => parseInt(localStorage.getItem(TIMER_STORAGE_KEYS.CYCLE), 10) || 1);
  const [sessionsCompleted, setSessionsCompleted] = useState(() => parseInt(localStorage.getItem(TIMER_STORAGE_KEYS.SESSIONS), 10) || 0);
  const [totalMinutesToday, setTotalMinutesToday] = useState(0);
  const [goalMinutesToday, setGoalMinutesToday] = useState(0);
  const [effectiveMinutesToday, setEffectiveMinutesToday] = useState(0);
  const [todaySessions, setTodaySessions] = useState([]);
  const [streak, setStreak] = useState(0);
  const [subject, setSubject] = useState(() => localStorage.getItem(TIMER_STORAGE_KEYS.SUBJECT) || "");
  const [selectedTaskId, setSelectedTaskId] = useState(() => localStorage.getItem(TIMER_STORAGE_KEYS.TASK_ID) || "");
  const [selectedArenaId, setSelectedArenaId] = useState(() => localStorage.getItem('timer_arena_id') || "");
  const [selectedNodeId, setSelectedNodeId] = useState(() => localStorage.getItem('timer_node_id') || "");
  const [reflectionEnabled, setReflectionEnabled] = useState(() => localStorage.getItem(TIMER_STORAGE_KEYS.ENABLE_REFLECTION) !== "false");

  const [pendingSession, setPendingSession] = useState(() => loadJSON(TIMER_STORAGE_KEYS.PENDING_SESSION, null));

  // Ambient Sound State
  const [ambientEnabled, setAmbientEnabled] = useState(() => localStorage.getItem(TIMER_STORAGE_KEYS.AMBIENT_SOUND_ENABLED) === "true");
  const [ambientType, setAmbientType] = useState(() => localStorage.getItem(TIMER_STORAGE_KEYS.AMBIENT_SOUND_TYPE) || "rain");
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem(TIMER_STORAGE_KEYS.AMBIENT_VOLUME)) || 0.5);

  const workerRef = useRef(null);
  const startTimeRef = useRef(null);
  const ambientRef = useRef(null);
  const chimeRef = useRef(null);
  const completedRef = useRef(false); // 🛡️ Prevents double completion
  const sessionIdRef = useRef(null); // 🆔 Persists session ID across pauses/retries
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );


  /* ------------------ API SYNC ------------------ */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const tzOffset = new Date().getTimezoneOffset();
        const globalRes = await api.get(`/focus/stats/today?offset=${tzOffset}`);

        setTotalMinutesToday(globalRes.data.totalMinutes || 0);
        setEffectiveMinutesToday(globalRes.data.effectiveMinutes || 0);
        setSessionsCompleted(globalRes.data.sessionCount || 0);
        setStreak(globalRes.data.streak || 0);
        setTodaySessions(globalRes.data.todaySessions || []);

        if (selectedArenaId) {
          const goalRes = await api.get(`/focus/stats/today?offset=${tzOffset}&arenaId=${selectedArenaId}`);
          setGoalMinutesToday(goalRes.data.totalMinutes || 0);
        } else {
          setGoalMinutesToday(0);
        }
      } catch (err) {
        console.error("Stats fetch failed", err);
      }
    };
    fetchStats();

    // 🔄 Offline Sync: Process queued sessions
    const processSyncQueue = async () => {
      const queue = loadJSON(TIMER_STORAGE_KEYS.SYNC_QUEUE, []);
      if (queue.length === 0) return;

      const newQueue = [];
      for (const session of queue) {
        try {
          await api.post("/focus", session);
          toast.success("Offline session synced! ☁️");
        } catch {
          newQueue.push(session); // Keep in queue if still failing
        }
      }

      if (newQueue.length !== queue.length) {
        // Update Stats if we synced something
        fetchStats();
      }

      localStorage.setItem(TIMER_STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(newQueue));
    };

    processSyncQueue();
    window.addEventListener('online', processSyncQueue);

    return () => window.removeEventListener('online', processSyncQueue);
  }, [selectedArenaId]);

  /* ------------------ CROSS-TAB SYNC ------------------ */
  useEffect(() => {
    const handleStorage = (e) => {
      const syncKeys = [
        TIMER_STORAGE_KEYS.TARGET_TIME,
        TIMER_STORAGE_KEYS.PAUSED_REMAINING,
        TIMER_STORAGE_KEYS.MODE,
        TIMER_STORAGE_KEYS.CYCLE,
        TIMER_STORAGE_KEYS.SESSIONS,
        TIMER_STORAGE_KEYS.SUBJECT,
        TIMER_STORAGE_KEYS.TASK_ID,
        'timer_arena_id',
        'timer_node_id',
        TIMER_STORAGE_KEYS.AMBIENT_SOUND_ENABLED,
        TIMER_STORAGE_KEYS.AMBIENT_SOUND_TYPE,
        TIMER_STORAGE_KEYS.AMBIENT_VOLUME,
        TIMER_STORAGE_KEYS.ENABLE_REFLECTION,
        TIMER_STORAGE_KEYS.MODE_TIMINGS,
        TIMER_STORAGE_KEYS.PENDING_SESSION,
      ];

      if (syncKeys.includes(e.key)) {
        if (e.key === TIMER_STORAGE_KEYS.TARGET_TIME) {
          setActiveTick(t => t + 1);
        }
        setTimeLeft(rehydrateTime);

        if (e.newValue !== null) {
          try {
            switch (e.key) {
              case TIMER_STORAGE_KEYS.MODE: setMode(e.newValue); break;
              case TIMER_STORAGE_KEYS.CYCLE: setCycleNumber(parseInt(e.newValue, 10)); break;
              case TIMER_STORAGE_KEYS.SESSIONS: setSessionsCompleted(parseInt(e.newValue, 10)); break;
              case TIMER_STORAGE_KEYS.SUBJECT: setSubject(e.newValue); break;
              case TIMER_STORAGE_KEYS.TASK_ID: setSelectedTaskId(e.newValue); break;
              case 'timer_arena_id': setSelectedArenaId(e.newValue); break;
              case 'timer_node_id': setSelectedNodeId(e.newValue); break;
              case TIMER_STORAGE_KEYS.AMBIENT_SOUND_ENABLED: setAmbientEnabled(e.newValue === "true"); break;
              case TIMER_STORAGE_KEYS.AMBIENT_SOUND_TYPE: setAmbientType(e.newValue); break;
              case TIMER_STORAGE_KEYS.MODE_TIMINGS:
                setModeTimings(JSON.parse(e.newValue));
                break;
              case TIMER_STORAGE_KEYS.AMBIENT_VOLUME: setVolume(parseFloat(e.newValue)); break;
              case TIMER_STORAGE_KEYS.ENABLE_REFLECTION: setReflectionEnabled(e.newValue !== "false"); break;
              case TIMER_STORAGE_KEYS.PENDING_SESSION:
                setPendingSession(JSON.parse(e.newValue));
                break;
              default: break;
            }
          } catch (err) {
            console.error("Storage sync failed for key:", e.key, err);
          }
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [rehydrateTime]);

  // 🛡️ Data Safety: Handle Tab Close/Refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      // We don't block unload, but we ensure localStorage is up-to-date
      // Note: We cannot reliable run async saveSession here.
      // But our LocalStorage based rehydration handles the state restoration perfectly
      // as long as we don't clear the keys.
      // So we mainly rely on 'timer-targetTime' or 'timer-startTime' which are set on START.
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  /* ------------------ LOCAL STORAGE SYNC ------------------ */
  /* ------------------ LOCAL STORAGE SYNC (OPTIMIZED) ------------------ */
  // 1. Config Sync (Low Frequency) - Only writes when settings change
  useEffect(() => {
    localStorage.setItem(TIMER_STORAGE_KEYS.MODE, mode);
    localStorage.setItem(TIMER_STORAGE_KEYS.CYCLE, cycleNumber.toString());
    localStorage.setItem(TIMER_STORAGE_KEYS.SESSIONS, sessionsCompleted.toString());
    localStorage.setItem(TIMER_STORAGE_KEYS.SUBJECT, subject);
    localStorage.setItem(TIMER_STORAGE_KEYS.TASK_ID, selectedTaskId);
    localStorage.setItem('timer_arena_id', selectedArenaId);
    localStorage.setItem('timer_node_id', selectedNodeId);
    localStorage.setItem(TIMER_STORAGE_KEYS.MODE_TIMINGS, JSON.stringify(modeTimings));
    localStorage.setItem(TIMER_STORAGE_KEYS.ENABLE_REFLECTION, reflectionEnabled.toString());
    localStorage.setItem(TIMER_STORAGE_KEYS.AMBIENT_SOUND_ENABLED, ambientEnabled.toString());
    localStorage.setItem(TIMER_STORAGE_KEYS.AMBIENT_SOUND_TYPE, ambientType);
    localStorage.setItem(TIMER_STORAGE_KEYS.AMBIENT_VOLUME, volume.toString());

    // We do NOT write TIME_LEFT here to avoid 1Hz IO spikes.
    // TIME_LEFT is handled by Pause Logic + beforeunload
  }, [mode, cycleNumber, sessionsCompleted, subject, selectedTaskId, modeTimings, reflectionEnabled, ambientEnabled, ambientType, volume, selectedArenaId, selectedNodeId]);

  // 2. Sync Pending Sessions
  useEffect(() => {
    if (pendingSession) {
      localStorage.setItem(TIMER_STORAGE_KEYS.PENDING_SESSION, JSON.stringify(pendingSession));
    } else {
      localStorage.removeItem(TIMER_STORAGE_KEYS.PENDING_SESSION);
    }
  }, [pendingSession]);


  /* ------------------ AMBIENT AUDIO LOGIC ------------------ */
  useEffect(() => {
    if (!ambientRef.current) {
      ambientRef.current = new Audio();
      ambientRef.current.loop = true;
    }

    const currentSound = AMBIENT_SOUNDS.find(s => s.id === ambientType);

    if (ambientEnabled && isActive && currentSound?.url) {
      if (ambientRef.current.src !== currentSound.url) {
        ambientRef.current.src = currentSound.url;
      }
      ambientRef.current.volume = volume;
      ambientRef.current.play().catch(e => console.warn("Audio play blocked:", e));
    } else {
      ambientRef.current.pause();
    }

    // Cleanup to prevent memory leaks 🧹
    // Cleanup to prevent memory leaks 🧹
    return () => {
      // We only pause, we don't nullify to avoid recreation churn
      if (ambientRef.current) {
        ambientRef.current.pause();
      }
    };
  }, [ambientEnabled, ambientType, isActive, volume]);



  /* ------------------ BROWSER TAB TITLE ------------------ */
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isActive) {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = (timeLeft % 60).toString().padStart(2, '0');
        const modeLabel = mode === "FOCUS" ? "Focusing" : "Break Time";
        document.title = `(${minutes}:${seconds}) ${modeLabel} | Aspirant Arena`;
      } else {
        document.title = "Aspirant Arena | Deep Work Hub";
      }
    }
  }, [timeLeft, isActive, mode]);

  /* ------------------ NOTIFICATIONS ------------------ */
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission()
        .then(setNotificationPermission)
        .catch(err => console.error("Auto notification check failed:", err));
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof Notification === "undefined") {
      toast.error("Notifications are not supported in this browser.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        toast.success("Notifications enabled! 🔔");
      } else if (permission === "denied") {
        toast.error("Notifications are blocked by your browser settings.");
      }
    } catch (err) {
      console.error("Notification permission request failed:", err);
    }
  };

  const sendNotification = (title, body) => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      const basicOptions = {
        body,
        icon: "https://cdn-icons-png.flaticon.com/512/3652/3652191.png"
      };

      const mobileOptions = {
        ...basicOptions,
        vibrate: [200, 100, 200],
        tag: "timer-notification",
        renotify: true,
        requireInteraction: true,
        actions: [{ action: "open", title: "OK" }]
      };

      // 1. Try Standard Desktop Notification first (Best for Localhost/Dev/Desktop)
      try {
        // Desktop often doesn't support actions/vibrate in new Notification(), so use basic options
        const notification = new Notification(title, basicOptions);
        notification.onclick = () => window.focus();
      } catch (err) {
        // 2. Mobile/Android Fallback (Service Worker)
        console.warn("Standard notification failed, trying Service Worker:", err);
        if (navigator.serviceWorker && navigator.serviceWorker.ready) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, mobileOptions);
          }).catch(swErr => {
            console.error("ServiceWorker notification also failed:", swErr);
          });
        }
      }
    }
  };

  const playChime = () => {
    // 📳 Vibration (Mobile)
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([500, 200, 500]); // Long-Short-Long pattern
    }

    if (!chimeRef.current) {
      chimeRef.current = new Audio("https://www.soundjay.com/buttons/beep-07.mp3");
    }
    chimeRef.current.currentTime = 0;
    chimeRef.current.play().catch(e => console.warn("Chime blocked:", e));
  };

  /* ------------------ ACTIONS ------------------ */
  const saveSession = useCallback(async (seconds, status = "completed", rating = 3, notes = "") => {
    if (seconds < MIN_VALID_DURATION) {
      if (status === "completed" || status === "interrupted") {
        // Optional: Toast for user awareness (muted to avoid spam)
        console.log(`Session too short to record (< ${MIN_VALID_DURATION / 60}m)`);
      }
      return;
    }

    // If no rating is provided yet, we store it as a pending session for the UI to handle
    if (!rating && status === "completed") {
      // 📸 SNAPSHOT STATE: Capture all context so it's not lost when timer resets
      setPendingSession({
        seconds,
        status,
        snapshot: {
          mode,
          cycleNumber,
          subject,
          selectedTaskId,
          selectedArenaId,
          selectedNodeId
        }
      });
      return;
    }

    // Use snapshot if available, otherwise fall back to current state
    const snapshot = pendingSession?.snapshot || {};
    const finalMode = snapshot.mode || mode;
    const finalCycle = snapshot.cycleNumber || cycleNumber;
    const finalSubject = snapshot.subject || subject;
    const finalTask = snapshot.selectedTaskId || selectedTaskId;
    const finalArena = snapshot.selectedArenaId || selectedArenaId;
    const finalNode = snapshot.selectedNodeId || selectedNodeId;

    // Optimistic Update
    const addedMinutes = Math.round(seconds / 60);
    setTotalMinutesToday(prev => prev + addedMinutes);
    setSessionsCompleted(prev => prev + 1);

    // Use existing ID or generate one if missing (fallback)
    const sessionId = sessionIdRef.current || safeUUID();

    try {
      const endTime = new Date();
      const startTime = startTimeRef.current || new Date(endTime.getTime() - seconds * 1000);

      await api.post("/focus", {
        subject: finalSubject || "General Study",
        task: finalTask || undefined,
        arenaId: finalArena || undefined,
        nodeId: finalNode || undefined,
        startTime,
        endTime,
        duration: addedMinutes,
        type: { FOCUS: "focus", SHORT_BREAK: "short-break", LONG_BREAK: "long-break", STOPWATCH: "focus" }[finalMode] || "focus",
        cycleNumber: finalCycle,
        source: "pomodoro",
        status,
        focusRating: rating || 3,
        notes,
        sessionId
      });

      // ⛩️ Sync syllabus progress if a node is linked
      if (finalNode) {
        dispatch(syncNodeTime({ nodeId: finalNode, duration: addedMinutes }));
      }

      startTimeRef.current = null;
      sessionIdRef.current = null; // Reset ID for next session
      setPendingSession(null);
      toast.success("Focus logged 🎯");

      // 🦔 PostHog Event
      posthog.capture('focus_session_logged', {
        duration_minutes: addedMinutes,
        mode: mode,
        subject: subject || "General",
        status: status,
        rating: rating
      });

      // Re-fetch stats to update efficiency and rhythm
      try {
        const tzOffset = new Date().getTimezoneOffset();
        const { data: statsData } = await api.get(`/focus/stats/today?offset=${tzOffset}`);
        setTotalMinutesToday(statsData.totalMinutes || 0);
        setEffectiveMinutesToday(statsData.effectiveMinutes || 0);
        setSessionsCompleted(statsData.sessionCount || 0);
        setStreak(statsData.streak || 0);
        setTodaySessions(statsData.todaySessions || []);
      } catch (err) {
        console.error("Post-save stats sync failed", err);
      }
    } catch (err) {
      console.error("Save failed", err);
      // 🛡️ Offline Fallback: Queue session
      const queue = loadJSON(TIMER_STORAGE_KEYS.SYNC_QUEUE, []);

      const sessionPayload = {
        subject: subject || "General Study",
        task: selectedTaskId || undefined,
        arenaId: selectedArenaId || undefined,
        nodeId: selectedNodeId || undefined,
        startTime: startTimeRef.current || new Date(Date.now() - seconds * 1000),
        endTime: new Date(),
        duration: addedMinutes,
        type: { FOCUS: "focus", SHORT_BREAK: "short-break", LONG_BREAK: "long-break" }[mode] || "focus",
        cycleNumber,
        source: "pomodoro",
        status,
        focusRating: rating || 3,
        notes,
        sessionId
      };

      queue.push(sessionPayload);
      localStorage.setItem(TIMER_STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
      toast("Saved offline. Will sync when online 🌐", { icon: "💾" });
    }
  }, [subject, selectedTaskId, cycleNumber, dispatch, selectedArenaId, selectedNodeId, mode]);

  const completeRating = async (rating, notes) => {
    if (!pendingSession) return;
    await saveSession(pendingSession.seconds, pendingSession.status, rating, notes);
  };

  const handleTimerComplete = useCallback((manual = false) => {
    // 🛡️ Guard against double firing from worker/timeout race conditions
    if (completedRef.current) return;
    completedRef.current = true;

    localStorage.removeItem(TIMER_STORAGE_KEYS.TARGET_TIME);
    localStorage.removeItem('timer-startTime'); // Clear stopwatch start
    localStorage.removeItem(TIMER_STORAGE_KEYS.PAUSED_REMAINING);
    setActiveTick(t => t + 1);
    setTimeLeft(rehydrateTime);
    // ✅ ALWAYS subtract current timeLeft from total time for accuracy
    // UNLESS it's Stopwatch, where timeLeft IS the elapsed time.
    const elapsed = mode === "STOPWATCH" ? timeLeft : (modeTimings[mode].time - timeLeft);

    if (!manual) {
      playChime();
      sendNotification(
        mode === "FOCUS" ? "Session Complete! 🎯" : "Break Over! ⚡",
        mode === "FOCUS" ? "Great job! Time for a well-deserved break." : "Break is finished. Ready to dive back in?"
      );
    }

    if (mode === "FOCUS") {
      if (elapsed >= MIN_VALID_DURATION) {
        // Only trigger modal if reflection is enabled
        saveSession(elapsed, manual ? "interrupted" : "completed", reflectionEnabled ? null : 3);
      } else if (!manual) {
        toast("Good warmup! Work > 5m to log it.", { icon: "🌱" });
      }

      if (cycleNumber < 4) {
        setCycleNumber(prev => prev + 1);
        setMode("SHORT_BREAK");
        setTimeLeft(modeTimings.SHORT_BREAK.time);
      } else {
        setCycleNumber(1);
        setMode("LONG_BREAK");
        setTimeLeft(modeTimings.LONG_BREAK.time);

        // Clear task when cycle completes (User Request)
        setSubject("");
        setSelectedTaskId("");
        setSelectedArenaId("");
        setSelectedNodeId("");
      }
    } else if (mode === "STOPWATCH") {
      // ⏱️ Start Fresh Stopwatch
      if (elapsed >= MIN_VALID_DURATION) {
        saveSession(elapsed, "completed", reflectionEnabled ? null : 3);
      } else {
        toast("Session < 5m not logged ⏳", { icon: "👻" });
      }
      setMode("STOPWATCH");
      setTimeLeft(0);
    } else {
      // Break Complete -> Back to Focus
      setMode("FOCUS");
      setTimeLeft(modeTimings.FOCUS.time);
    }
  }, [mode, timeLeft, cycleNumber, modeTimings, saveSession, reflectionEnabled, rehydrateTime]);

  // 🛡️ Ref for handleTimerComplete to avoid stale closures in worker/events
  const onCompleteRef = useRef(handleTimerComplete);
  useEffect(() => {
    onCompleteRef.current = handleTimerComplete;
  }, [handleTimerComplete]);

  // 🛡️ Reset completion guard whenever mode changes (allows Skipping multiple times)
  useEffect(() => {
    completedRef.current = false;
  }, [mode]);

  const toggleTimer = useCallback((overrideSeconds) => {
    if (isLockedRef.current) return;
    isLockedRef.current = true;
    setTimeout(() => { isLockedRef.current = false; }, 150);

    if (!isActive) {
      // STARTING TIMER
      completedRef.current = false; // Reset completion guard

      // 🧠 Smart Start: Use override if provided (e.g. immediate start after edit)
      const duration = (typeof overrideSeconds === 'number' && overrideSeconds > 0) ? overrideSeconds : timeLeft;

      if (mode === "STOPWATCH") {
        // ⏱️ STOPWATCH START:
        // If resuming, we calculate new StartTime based on previously elapsed time
        // If fresh start, StartTime = Now
        const savedPaused = localStorage.getItem(TIMER_STORAGE_KEYS.PAUSED_REMAINING);
        const pausedElapsed = savedPaused ? parseInt(savedPaused, 10) : 0;

        // 🛡️ Guard: If parsing failed (NaN), fallback to 0
        const validElapsed = isNaN(pausedElapsed) ? 0 : pausedElapsed;

        const newStart = Date.now() - (validElapsed * 1000);

        localStorage.setItem('timer-startTime', newStart.toString());
        // Dummy target to satisfy "isActive" checks elsewhere (will be ignored by worker logic for stopwatch)
        localStorage.setItem(TIMER_STORAGE_KEYS.TARGET_TIME, "STOPWATCH_RUNNING");
        localStorage.removeItem(TIMER_STORAGE_KEYS.PAUSED_REMAINING);
      } else {
        // ⏳ STANDARD START:
        const newTarget = Date.now() + duration * 1000;
        localStorage.setItem(TIMER_STORAGE_KEYS.TARGET_TIME, newTarget.toString());
        localStorage.removeItem(TIMER_STORAGE_KEYS.PAUSED_REMAINING);
      }

      if (!startTimeRef.current) {
        startTimeRef.current = new Date();
      }
      // Prime audio on user gesture for mobile autoplay bypass
      if (!chimeRef.current) {
        chimeRef.current = new Audio("https://www.soundjay.com/buttons/beep-07.mp3");
        chimeRef.current.load();
      }
      if (!ambientRef.current) {
        ambientRef.current = new Audio();
        ambientRef.current.loop = true;
        ambientRef.current.load();
      }

      // 🆔 Generate Session ID on start if not exists
      if (!sessionIdRef.current) {
        sessionIdRef.current = safeUUID();
      }
    } else {
      // PAUSING TIMER
      localStorage.removeItem(TIMER_STORAGE_KEYS.TARGET_TIME);
      localStorage.setItem(TIMER_STORAGE_KEYS.PAUSED_REMAINING, timeLeft.toString());
    }
    setActiveTick(t => t + 1);
    setTimeLeft(rehydrateTime);
  }, [isActive, timeLeft, rehydrateTime, mode]);

  const resetTimer = () => {
    const elapsed = modeTimings[mode].time - timeLeft;
    if (mode === "FOCUS" && elapsed >= MIN_VALID_DURATION) {
      saveSession(elapsed, "interrupted");
    }
    localStorage.removeItem(TIMER_STORAGE_KEYS.TARGET_TIME);
    localStorage.removeItem(TIMER_STORAGE_KEYS.PAUSED_REMAINING);
    setActiveTick(t => t + 1);
    setTimeLeft(modeTimings[mode].time);
    startTimeRef.current = null;
    sessionIdRef.current = null; // Clear ID on reset
    toast.success("Timer reset");
  };

  const skipTimer = () => handleTimerComplete(true);

  const resetCycle = useCallback(() => {
    const elapsed = modeTimings[mode].time - timeLeft;
    if (mode === "FOCUS" && elapsed >= MIN_VALID_DURATION) {
      saveSession(elapsed, "interrupted");
    }
    localStorage.removeItem(TIMER_STORAGE_KEYS.TARGET_TIME);
    localStorage.removeItem(TIMER_STORAGE_KEYS.PAUSED_REMAINING);
    setActiveTick(t => t + 1);
    setMode("FOCUS");
    setCycleNumber(1);
    setTimeLeft(modeTimings.FOCUS.time);
    startTimeRef.current = null;
    sessionIdRef.current = null; // Clear ID on cycle reset

    // Clear task on manual cycle reset
    setSubject("");
    setSelectedTaskId("");
    setSelectedArenaId("");
    setSelectedNodeId("");

    toast.success("Cycle reset 🔁");
  }, [mode, modeTimings, timeLeft, saveSession]);

  const resetDay = () => {
    const elapsed = modeTimings[mode].time - timeLeft;
    if (mode === "FOCUS" && elapsed >= MIN_VALID_DURATION) {
      saveSession(elapsed, "interrupted");
    }
    localStorage.removeItem(TIMER_STORAGE_KEYS.TARGET_TIME);
    localStorage.removeItem(TIMER_STORAGE_KEYS.PAUSED_REMAINING);
    setActiveTick(t => t + 1);
    setTotalMinutesToday(0);
    setEffectiveMinutesToday(0);
    setSessionsCompleted(0);
    setTodaySessions([]);
    setSubject("");
    setSelectedTaskId("");
    setSelectedArenaId("");
    setSelectedNodeId("");
    setTimeLeft(modeTimings[mode].time);
    startTimeRef.current = null;
    sessionIdRef.current = null; // Clear ID on day reset
    toast.success("Daily dash reset 📅");
  };

  const switchMode = (newMode) => {
    // 🛡️ Auto-Save: If switching from a valid session, save it first
    const elapsed = mode === "STOPWATCH" ? timeLeft : (modeTimings[mode].time - timeLeft);
    if ((mode === "FOCUS" || mode === "STOPWATCH") && elapsed >= MIN_VALID_DURATION) {
      saveSession(elapsed, "interrupted");
    }

    setMode(newMode);
    setTimeLeft(modeTimings[newMode].time);
    localStorage.removeItem(TIMER_STORAGE_KEYS.TARGET_TIME);
    localStorage.removeItem(TIMER_STORAGE_KEYS.PAUSED_REMAINING);
    localStorage.removeItem('timer-startTime'); // Clear stopwatch start too
    setActiveTick(t => t + 1);
    startTimeRef.current = null;
    sessionIdRef.current = null; // Clear ID on mode switch
  };

  const applyPreset = (name, focus, short, long) => {
    const newTimings = {
      FOCUS: { ...modeTimings.FOCUS, time: focus * 60 },
      SHORT_BREAK: { ...modeTimings.SHORT_BREAK, time: short * 60 },
      LONG_BREAK: { ...modeTimings.LONG_BREAK, time: long * 60 },
    };
    setModeTimings(newTimings);
    setMode("FOCUS");
    setTimeLeft(focus * 60);
    localStorage.removeItem(TIMER_STORAGE_KEYS.TARGET_TIME);
    localStorage.removeItem(TIMER_STORAGE_KEYS.PAUSED_REMAINING);
    setActiveTick(t => t + 1);
    startTimeRef.current = null;
    sessionIdRef.current = null;
    toast.success(`Strategy applied: ${name}`);
  };

  const setManualTime = (minutes) => {
    if (minutes <= 0) return;
    const seconds = minutes * 60;
    const newTimings = { ...modeTimings, [mode]: { ...modeTimings[mode], time: seconds } };
    setModeTimings(newTimings);
    setTimeLeft(seconds);
    localStorage.removeItem(TIMER_STORAGE_KEYS.TARGET_TIME);
    localStorage.removeItem(TIMER_STORAGE_KEYS.PAUSED_REMAINING);
    setActiveTick(t => t + 1);
    startTimeRef.current = null;
    sessionIdRef.current = null;
    toast.success(`${mode} duration set to ${minutes}m`);
  };


  /* ------------------ REFINED WEB WORKER INTERVAL ------------------ */
  useEffect(() => {
    // Initialize Worker
    workerRef.current = new Worker(new URL("../workers/timerWorker.js", import.meta.url));

    workerRef.current.onmessage = (e) => {
      if (e.data === "tick") {
        // ABSOLUTE TIME CHECK 🛡️
        const rawTarget = localStorage.getItem(TIMER_STORAGE_KEYS.TARGET_TIME);

        if (rawTarget) {
          const now = Date.now();
          // For Standard: Parse target. For Stopwatch: Ignore target value.
          const targetTime = parseInt(rawTarget, 10);

          // 🧠 STOPWATCH: Count-up Logic
          const isStopwatch = localStorage.getItem(TIMER_STORAGE_KEYS.MODE) === "STOPWATCH";
          if (isStopwatch) {
            const startTime = parseInt(localStorage.getItem('timer-startTime'), 10);
            if (startTime) {
              const elapsed = Math.floor((now - startTime) / 1000);
              // 🛡️ Safety Cap: Auto-stop after 4 hours
              if (elapsed >= 14400) { // 14400 = 4 hours
                setTimeLeft(14400);
                onCompleteRef.current(); // Saves and resets
                workerRef.current.postMessage("stop");
              } else {
                setTimeLeft(elapsed);
              }
            }
          } else {
            // 🧠 STANDARD: Count-down Logic
            const remaining = Math.ceil((targetTime - now) / 1000);

            if (remaining <= 0) {
              // Timer Finished
              setTimeLeft(0);
              onCompleteRef.current();
            } else {
              // Normal Tick
              setTimeLeft(remaining);
            }
          } // End of standard check
        } else {
          // If active but no target, stop worker
          workerRef.current.postMessage("stop");
        }
      }
    };

    return () => {
      workerRef.current.terminate();
    };
  }, []);

  // Sync Start/Stop with Target Time
  useEffect(() => {
    if (isActive) {
      // If we don't have a target time yet (just started/resumed), set it
      const currentTarget = localStorage.getItem(TIMER_STORAGE_KEYS.TARGET_TIME);

      if (!currentTarget && timeLeft > 0) {
        // 🧠 Resume Logic: Check if we have a saved "paused remaining" time
        let timeToApply = timeLeft;
        const savedPaused = localStorage.getItem(TIMER_STORAGE_KEYS.PAUSED_REMAINING);

        if (savedPaused) {
          timeToApply = parseInt(savedPaused, 10);
          setTimeLeft(timeToApply);
          localStorage.removeItem(TIMER_STORAGE_KEYS.PAUSED_REMAINING);
        }

        if (mode === "STOPWATCH") {
          // Resume Stopwatch: StartTime = Now - PreviouslyElapsed
          const newStart = Date.now() - (timeToApply * 1000);
          localStorage.setItem('timer-startTime', newStart.toString());
          // We set dummy target to keep worker happy/ticking
          localStorage.setItem(TIMER_STORAGE_KEYS.TARGET_TIME, "STOPWATCH_RUNNING");
        } else {
          // Resume Standard Timer
          const newTarget = Date.now() + timeToApply * 1000;
          localStorage.setItem(TIMER_STORAGE_KEYS.TARGET_TIME, newTarget.toString());
        }
      }
      if (timeLeft > 0 || mode === "STOPWATCH") {
        workerRef.current.postMessage("start");
      }
    } else {
      // Paused
      workerRef.current.postMessage("stop");
    }
    // eslint-disable-next-line
  }, [isActive]); // 🛡️ Reduced triggers

  // 🛡️ Safe progress calculation (prevent NaN/Infinity)
  const totalTime = modeTimings[mode]?.time || 1;
  // If Stopwatch, we can just return 100 or calculate modulo for a spinner effect
  const progress = mode === "STOPWATCH"
    ? 100
    : Math.min(100, Math.max(0, ((totalTime - timeLeft) / totalTime) * 100));

  /* ------------------ MEDIA SESSION API (Mobile Controls) ------------------ */
  // 1. Dynamic Metadata Updates (Tick-based)
  useEffect(() => {
    if ("mediaSession" in navigator) {
      const modeLabel = mode.replace("_", " ").toLowerCase();
      const minutes = Math.floor(timeLeft / 60);
      const seconds = (timeLeft % 60).toString().padStart(2, '0');

      if (typeof MediaMetadata !== "undefined") {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `${modeLabel === 'focus' ? '🎯' : '☕'} ${minutes}:${seconds}`,
          artist: "Aspirant Arena",
          album: subject || "Deep Work Session",
          artwork: [
            { src: "https://cdn-icons-png.flaticon.com/512/3652/3652191.png", sizes: "512x512", type: "image/png" }
          ]
        });
      }
    }
  }, [timeLeft, mode, subject]);

  // 2. Static Action Handlers (Registered Once)
  const toggleTimerRef = useRef(toggleTimer);
  useEffect(() => {
    toggleTimerRef.current = toggleTimer;
  }, [toggleTimer]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const handler = () => toggleTimerRef.current();

    navigator.mediaSession.setActionHandler("play", handler);
    navigator.mediaSession.setActionHandler("pause", handler);

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
    };
  }, []);

  // 🛡️ Auto-Complete on Load: If we wake up and time is already 0 (finished offline), complete it immediately.
  // Placed here to ensure handleTimerComplete is defined.
  useEffect(() => {
    if (isActive && timeLeft <= 0 && mode !== "STOPWATCH") {
      const timer = setTimeout(() => {
        handleTimerComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, timeLeft, mode, handleTimerComplete]);

  return {
    mode,
    setMode: switchMode,
    timeLeft,
    isActive,
    toggleTimer,
    resetTimer,
    resetCycle,
    resetDay,
    skipTimer,
    applyPreset,
    setManualTime,
    progress,
    sessionsCompleted,
    totalMinutesToday,
    effectiveMinutesToday,
    goalMinutesToday,
    efficiencyScore: totalMinutesToday > 0 ? Math.round((effectiveMinutesToday / totalMinutesToday) * 100) : 0,
    todaySessions,
    streak,
    cycleNumber,
    subject,
    setSubject,
    selectedTaskId,
    setSelectedTaskId,
    selectedArenaId,
    setSelectedArenaId,
    selectedNodeId,
    setSelectedNodeId,
    modes: modeTimings,
    pendingSession,
    completeRating,
    setPendingSession,
    reflectionEnabled,
    setReflectionEnabled,
    // Ambient sound
    ambientEnabled,
    setAmbientEnabled,
    ambientType,
    setAmbientType,
    volume,
    setVolume,
    notificationPermission,
    requestNotificationPermission
  };
};
