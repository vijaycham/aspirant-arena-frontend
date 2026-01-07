import { useState, useEffect, useCallback, useRef } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";

const DEFAULT_MODES = {
  FOCUS: { label: "Focus", time: 25 * 60 },
  SHORT_BREAK: { label: "Short Break", time: 5 * 60 },
  LONG_BREAK: { label: "Long Break", time: 15 * 60 },
};

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
  const [mode, setMode] = useState(() => localStorage.getItem("timer-mode") || "FOCUS");
  const [modeTimings, setModeTimings] = useState(() => loadJSON("timer-modeTimings", DEFAULT_MODES));
  
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem("timer-timeLeft");
    if (saved) return parseInt(saved, 10);
    const timings = loadJSON("timer-modeTimings", DEFAULT_MODES);
    const currentMode = localStorage.getItem("timer-mode") || "FOCUS";
    return (timings[currentMode] || DEFAULT_MODES.FOCUS).time;
  });

  const [isActive, setIsActive] = useState(false);
  const [cycleNumber, setCycleNumber] = useState(() => parseInt(localStorage.getItem("timer-cycle"), 10) || 1);
  const [sessionsCompleted, setSessionsCompleted] = useState(() => parseInt(localStorage.getItem("timer-sessions"), 10) || 0);
  const [totalMinutesToday, setTotalMinutesToday] = useState(0);
  const [subject, setSubject] = useState(() => localStorage.getItem("timer-subject") || "");
  const [selectedTaskId, setSelectedTaskId] = useState(() => localStorage.getItem("timer-taskId") || "");
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  /* ------------------ API SYNC ------------------ */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/focus/stats/today");
        setTotalMinutesToday(data.totalMinutes || 0);
        setSessionsCompleted(data.sessionCount || 0);
      } catch (err) {
        console.error("Stats fetch failed", err);
      }
    };
    fetchStats();
  }, []);

  /* ------------------ LOCAL STORAGE SYNC ------------------ */
  useEffect(() => {
    localStorage.setItem("timer-mode", mode);
    localStorage.setItem("timer-timeLeft", timeLeft.toString());
    localStorage.setItem("timer-cycle", cycleNumber.toString());
    localStorage.setItem("timer-sessions", sessionsCompleted.toString());
    localStorage.setItem("timer-subject", subject);
    localStorage.setItem("timer-taskId", selectedTaskId);
    localStorage.setItem("timer-modeTimings", JSON.stringify(modeTimings));
  }, [mode, timeLeft, cycleNumber, sessionsCompleted, subject, selectedTaskId, modeTimings]);

  /* ------------------ ACTIONS ------------------ */
  const saveSession = useCallback(async (seconds, status = "completed") => {
    if (seconds < 60) return;
    
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
        status
      });

      startTimeRef.current = null;
      toast.success("Focus logged 🎯");
    } catch (err) {
      console.error("Save failed", err);
    }
  }, [subject, selectedTaskId, cycleNumber]);

  const handleTimerComplete = useCallback((manual = false) => {
    setIsActive(false);
    const elapsed = modeTimings[mode].time - timeLeft;

    if (mode === "FOCUS") {
      if (elapsed >= 60) saveSession(elapsed, manual ? "interrupted" : "completed");

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
  }, [mode, timeLeft, cycleNumber, modeTimings, saveSession]);

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
    setSessionsCompleted(0);
    setSubject("");
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


  /* ------------------ REFINED INTERVAL ------------------ */
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimerComplete();
    }
    return () => clearInterval(timerRef.current);
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
    cycleNumber,
    subject,
    setSubject,
    selectedTaskId,
    setSelectedTaskId,
    modes: modeTimings
  };
};
