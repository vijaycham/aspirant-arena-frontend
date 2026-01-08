import { useState, useEffect, useCallback, useRef } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { DEFAULT_MODES, TIMER_STORAGE_KEYS } from "../utils/timer/timerConstants";

export const useTimer = () => {
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
  const [reflectionEnabled, setReflectionEnabled] = useState(() => localStorage.getItem(TIMER_STORAGE_KEYS.ENABLE_REFLECTION) !== "false");
  
  const [pendingSession, setPendingSession] = useState(null);
  
  const workerRef = useRef(null);
  const startTimeRef = useRef(null);

  /* ------------------ API SYNC ------------------ */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/focus/stats/today");
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
    const lastUpdate = localStorage.getItem(TIMER_STORAGE_KEYS.LAST_UPDATE);
    const wasActive = localStorage.getItem(TIMER_STORAGE_KEYS.IS_ACTIVE) === "true";
    
    if (wasActive && lastUpdate) {
      const now = Date.now();
      const gapSeconds = Math.floor((now - parseInt(lastUpdate, 10)) / 1000);
      if (gapSeconds > 0) {
        setTimeLeft(prev => Math.max(0, prev - gapSeconds));
      }
    }
  }, []); // Run once on mount

  /* ------------------ LOCAL STORAGE SYNC ------------------ */
  useEffect(() => {
    localStorage.setItem(TIMER_STORAGE_KEYS.MODE, mode);
    localStorage.setItem(TIMER_STORAGE_KEYS.TIME_LEFT, timeLeft.toString());
    localStorage.setItem(TIMER_STORAGE_KEYS.CYCLE, cycleNumber.toString());
    localStorage.setItem(TIMER_STORAGE_KEYS.SESSIONS, sessionsCompleted.toString());
    localStorage.setItem(TIMER_STORAGE_KEYS.SUBJECT, subject);
    localStorage.setItem(TIMER_STORAGE_KEYS.TASK_ID, selectedTaskId);
    localStorage.setItem(TIMER_STORAGE_KEYS.MODE_TIMINGS, JSON.stringify(modeTimings));
    localStorage.setItem(TIMER_STORAGE_KEYS.IS_ACTIVE, isActive.toString());
    localStorage.setItem(TIMER_STORAGE_KEYS.LAST_UPDATE, Date.now().toString());
    localStorage.setItem(TIMER_STORAGE_KEYS.ENABLE_REFLECTION, reflectionEnabled.toString());
  }, [mode, timeLeft, cycleNumber, sessionsCompleted, subject, selectedTaskId, modeTimings, isActive, reflectionEnabled]);

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

      startTimeRef.current = null;
      setPendingSession(null);
      toast.success("Focus logged 🎯");

      // Re-fetch stats to update efficiency and rhythm
      try {
        const { data: statsData } = await api.get("/focus/stats/today");
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
      }
    } else {
      setMode("FOCUS");
      setTimeLeft(modeTimings.FOCUS.time);
    }
  }, [mode, timeLeft, cycleNumber, modeTimings, saveSession, reflectionEnabled]);

  const toggleTimer = () => {
    if (!isActive && !startTimeRef.current) {
      startTimeRef.current = new Date();
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
    modes: modeTimings,
    pendingSession,
    completeRating,
    setPendingSession,
    reflectionEnabled,
    setReflectionEnabled
  };
};
