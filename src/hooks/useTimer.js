import { useState, useEffect, useCallback, useRef } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { DEFAULT_MODES, TIMER_STORAGE_KEYS, AMBIENT_SOUNDS } from "../utils/timer/timerConstants";
import { useDispatch } from "react-redux";
import { syncNodeTime } from "../redux/slice/arenaSlice";

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

  /* ------------------ STATE ------------------ */
  const [mode, setMode] = useState(() => localStorage.getItem(TIMER_STORAGE_KEYS.MODE) || "FOCUS");
  const [modeTimings, setModeTimings] = useState(() => loadJSON(TIMER_STORAGE_KEYS.MODE_TIMINGS, DEFAULT_MODES));

  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem(TIMER_STORAGE_KEYS.TIME_LEFT);
    if (saved) return parseInt(saved, 10);
    const timings = loadJSON(TIMER_STORAGE_KEYS.MODE_TIMINGS, DEFAULT_MODES);
    const currentMode = localStorage.getItem(TIMER_STORAGE_KEYS.MODE) || "FOCUS";
    return (timings[currentMode] || DEFAULT_MODES.FOCUS).time;
  });

  const [isActive, setIsActive] = useState(() => localStorage.getItem(TIMER_STORAGE_KEYS.IS_ACTIVE) === "true");
  const [cycleNumber, setCycleNumber] = useState(() => parseInt(localStorage.getItem(TIMER_STORAGE_KEYS.CYCLE), 10) || 1);
  const [sessionsCompleted, setSessionsCompleted] = useState(() => parseInt(localStorage.getItem(TIMER_STORAGE_KEYS.SESSIONS), 10) || 0);
  const [totalMinutesToday, setTotalMinutesToday] = useState(0);
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
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  /* ------------------ API SYNC ------------------ */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const tzOffset = new Date().getTimezoneOffset();
        const { data } = await api.get(`/focus/stats/today?offset=${tzOffset}`);
        setTotalMinutesToday(data.totalMinutes || 0);
        setEffectiveMinutesToday(data.effectiveMinutes || 0);
        setSessionsCompleted(data.sessionCount || 0);
        setStreak(data.streak || 0);
        setTodaySessions(data.todaySessions || []);
      } catch (err) {
        console.error("Stats fetch failed", err);
      }
    };
    fetchStats();
  }, []);

  /* ------------------ CATCH UP LOGIC ------------------ */
  // If the timer was active when the tab closed, calculate how much time passed
  useEffect(() => {
    const catchUp = () => {
      const lastUpdate = localStorage.getItem(TIMER_STORAGE_KEYS.LAST_UPDATE);
      const wasActive = localStorage.getItem(TIMER_STORAGE_KEYS.IS_ACTIVE) === "true";

      if (wasActive && lastUpdate) {
        const now = Date.now();
        const gapSeconds = Math.floor((now - parseInt(lastUpdate, 10)) / 1000);
        if (gapSeconds > 0) {
          setTimeLeft(prev => {
            const next = Math.max(0, prev - gapSeconds);
            // If the timer should have finished while we were away, handleTimerComplete
            // will be triggered by the timeLeft useEffect once this state updates.
            return next;
          });
        }
      }
    };

    catchUp(); // Initial mount catch-up

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        catchUp();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []); // Run once on mount and setup listeners

  /* ------------------ LOCAL STORAGE SYNC ------------------ */
  useEffect(() => {
    localStorage.setItem(TIMER_STORAGE_KEYS.MODE, mode);
    localStorage.setItem(TIMER_STORAGE_KEYS.TIME_LEFT, timeLeft.toString());
    localStorage.setItem(TIMER_STORAGE_KEYS.CYCLE, cycleNumber.toString());
    localStorage.setItem(TIMER_STORAGE_KEYS.SESSIONS, sessionsCompleted.toString());
    localStorage.setItem(TIMER_STORAGE_KEYS.SUBJECT, subject);
    localStorage.setItem(TIMER_STORAGE_KEYS.TASK_ID, selectedTaskId);
    localStorage.setItem('timer_arena_id', selectedArenaId);
    localStorage.setItem('timer_node_id', selectedNodeId);
    localStorage.setItem(TIMER_STORAGE_KEYS.MODE_TIMINGS, JSON.stringify(modeTimings));
    localStorage.setItem(TIMER_STORAGE_KEYS.IS_ACTIVE, isActive.toString());
    localStorage.setItem(TIMER_STORAGE_KEYS.LAST_UPDATE, Date.now().toString());
    localStorage.setItem(TIMER_STORAGE_KEYS.ENABLE_REFLECTION, reflectionEnabled.toString());
    localStorage.setItem(TIMER_STORAGE_KEYS.AMBIENT_SOUND_ENABLED, ambientEnabled.toString());
    localStorage.setItem(TIMER_STORAGE_KEYS.AMBIENT_SOUND_TYPE, ambientType);
    localStorage.setItem(TIMER_STORAGE_KEYS.AMBIENT_VOLUME, volume.toString());
    if (pendingSession) {
      localStorage.setItem(TIMER_STORAGE_KEYS.PENDING_SESSION, JSON.stringify(pendingSession));
    } else {
      localStorage.removeItem(TIMER_STORAGE_KEYS.PENDING_SESSION);
    }
  }, [mode, timeLeft, cycleNumber, sessionsCompleted, subject, selectedTaskId, modeTimings, isActive, reflectionEnabled, ambientEnabled, ambientType, volume, pendingSession]);

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
  }, [ambientEnabled, ambientType, isActive, volume]);

  /* ------------------ MEDIA SESSION API (Mobile Controls) ------------------ */
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

      navigator.mediaSession.setActionHandler("play", () => setIsActive(true));
      navigator.mediaSession.setActionHandler("pause", () => setIsActive(false));
    }
  }, [timeLeft, mode, subject]);

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
    if (!chimeRef.current) {
      chimeRef.current = new Audio("https://www.soundjay.com/buttons/beep-07.mp3");
    }
    chimeRef.current.currentTime = 0;
    chimeRef.current.play().catch(e => console.warn("Chime blocked:", e));
  };

  /* ------------------ ACTIONS ------------------ */
  const saveSession = useCallback(async (seconds, status = "completed", rating = 3, notes = "") => {
    if (seconds < 60) return;

    // If no rating is provided yet, we store it as a pending session for the UI to handle
    if (!rating && status === "completed") {
      setPendingSession({ seconds, status });
      return;
    }

    // Optimistic Update
    const addedMinutes = Math.floor(seconds / 60);
    setTotalMinutesToday(prev => prev + addedMinutes);
    setSessionsCompleted(prev => prev + 1);

    try {
      const endTime = new Date();
      const startTime = startTimeRef.current || new Date(endTime.getTime() - seconds * 1000);

      await api.post("/focus", {
        subject: subject || "General Study",
        task: selectedTaskId || undefined,
        arenaId: selectedArenaId || undefined,
        nodeId: selectedNodeId || undefined,
        startTime,
        endTime,
        duration: addedMinutes,
        type: "focus",
        cycleNumber,
        source: "pomodoro",
        status,
        focusRating: rating || 3,
        notes
      });

      // ⛩️ Sync syllabus progress if a node is linked
      if (selectedNodeId) {
        dispatch(syncNodeTime({ nodeId: selectedNodeId, duration: addedMinutes }));
      }

      startTimeRef.current = null;
      setPendingSession(null);
      toast.success("Focus logged 🎯");

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
    }
  }, [subject, selectedTaskId, cycleNumber]);

  const completeRating = async (rating, notes) => {
    if (!pendingSession) return;
    await saveSession(pendingSession.seconds, pendingSession.status, rating, notes);
  };

  const handleTimerComplete = useCallback((manual = false) => {
    setIsActive(false);
    const elapsed = modeTimings[mode].time - timeLeft;

    if (!manual) {
      playChime();
      sendNotification(
        mode === "FOCUS" ? "Session Complete! 🎯" : "Break Over! ⚡",
        mode === "FOCUS" ? "Great job! Time for a well-deserved break." : "Break is finished. Ready to dive back in?"
      );
    }

    if (mode === "FOCUS") {
      if (elapsed >= 60) {
        // Only trigger modal if reflection is enabled
        saveSession(elapsed, manual ? "interrupted" : "completed", reflectionEnabled ? null : 3);
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
    } else {
      setMode("FOCUS");
      setTimeLeft(modeTimings.FOCUS.time);
    }
  }, [mode, timeLeft, cycleNumber, modeTimings, saveSession, reflectionEnabled]);

  const toggleTimer = () => {
    if (!isActive) {
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
    }
    setIsActive(prev => !prev);
  };

  const resetTimer = () => {
    const elapsed = modeTimings[mode].time - timeLeft;
    if (mode === "FOCUS" && elapsed >= 60) {
      saveSession(elapsed, "interrupted");
    }
    setIsActive(false);
    setTimeLeft(modeTimings[mode].time);
    startTimeRef.current = null;
    toast.success("Timer reset");
  };

  const skipTimer = () => handleTimerComplete(true);

  const resetCycle = () => {
    const elapsed = modeTimings[mode].time - timeLeft;
    if (mode === "FOCUS" && elapsed >= 60) {
      saveSession(elapsed, "interrupted");
    }
    setIsActive(false);
    setMode("FOCUS");
    setCycleNumber(1);
    setTimeLeft(modeTimings.FOCUS.time);
    startTimeRef.current = null;

    // Clear task on manual cycle reset
    setSubject("");
    setSelectedTaskId("");
    setSelectedArenaId("");
    setSelectedNodeId("");

    toast.success("Cycle reset 🔁");
  };

  const resetDay = () => {
    const elapsed = modeTimings[mode].time - timeLeft;
    if (mode === "FOCUS" && elapsed >= 60) {
      saveSession(elapsed, "interrupted");
    }
    setIsActive(false);
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
    toast.success("Daily dash reset 📅");
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(modeTimings[newMode].time);
    setIsActive(false);
    startTimeRef.current = null;
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
    setIsActive(false);
    toast.success(`Strategy applied: ${name}`);
  };

  const setManualTime = (minutes) => {
    if (minutes <= 0) return;
    const seconds = minutes * 60;
    const newTimings = { ...modeTimings, [mode]: { ...modeTimings[mode], time: seconds } };
    setModeTimings(newTimings);
    setTimeLeft(seconds);
    setIsActive(false);
    toast.success(`${mode} duration set to ${minutes}m`);
  };


  /* ------------------ REFINED WEB WORKER INTERVAL ------------------ */
  useEffect(() => {
    // Initialize Worker
    workerRef.current = new Worker("/workers/timerWorker.js");

    workerRef.current.onmessage = (e) => {
      if (e.data === "tick") {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // We use 1 because the next tick will be 0, triggering handleTimerComplete
            // But handleTimerComplete is called separately below to avoid dependency loops
            return 0;
          }
          return prev - 1;
        });
      }
    };

    return () => {
      workerRef.current.terminate();
    };
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      workerRef.current.postMessage("start");
    } else {
      workerRef.current.postMessage("stop");
      if (timeLeft === 0 && isActive) {
        handleTimerComplete();
      }
    }
  }, [isActive, timeLeft, handleTimerComplete]);

  const progress = (modeTimings[mode].time - timeLeft) / modeTimings[mode].time * 100;

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
