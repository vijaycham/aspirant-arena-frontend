import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const MODES = {
  FOCUS: { label: 'Focus', time: 25 * 60, color: 'primary' },
  SHORT_BREAK: { label: 'Short Break', time: 5 * 60, color: 'emerald' },
  LONG_BREAK: { label: 'Long Break', time: 15 * 60, color: 'indigo' }
};

export const useTimer = () => {
  // Load initial state from LocalStorage or use defaults
  const [mode, setMode] = useState(() => localStorage.getItem('timer-mode') || 'FOCUS');
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem('timer-timeLeft');
    return saved ? parseInt(saved) : MODES[localStorage.getItem('timer-mode') || 'FOCUS'].time;
  });
  const [isActive, setIsActive] = useState(false);
  const [cycleNumber, setCycleNumber] = useState(() => parseInt(localStorage.getItem('timer-cycle')) || 1);
  const [sessionsCompleted, setSessionsCompleted] = useState(() => parseInt(localStorage.getItem('timer-sessions')) || 0);
  const [subject, setSubject] = useState(() => localStorage.getItem('timer-subject') || "");
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('timer-mode', mode);
    localStorage.setItem('timer-timeLeft', timeLeft.toString());
    localStorage.setItem('timer-cycle', cycleNumber.toString());
    localStorage.setItem('timer-sessions', sessionsCompleted.toString());
    localStorage.setItem('timer-subject', subject);
  }, [mode, timeLeft, cycleNumber, sessionsCompleted, subject]);

  const switchMode = useCallback((newMode) => {
    setMode(newMode);
    setTimeLeft(MODES[newMode].time);
    setIsActive(false);
  }, []);

  const toggleTimer = () => {
    if (!isActive) {
      startTimeRef.current = new Date();
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].time);
  };

  const saveSession = useCallback(async (durationInSeconds, status = 'completed') => {
    // Only save if at least 10 seconds were completed to avoid cluttering DB
    if (durationInSeconds < 10) return;

    try {
      const endTime = new Date();
      const startTime = startTimeRef.current || new Date(endTime.getTime() - durationInSeconds * 1000);
      
      await api.post("/focus", {
        subject: subject || "General Study",
        startTime,
        endTime,
        duration: Math.ceil(durationInSeconds / 60), // Use ceil to give credit for partial minutes
        type: 'focus',
        cycleNumber,
        source: 'pomodoro',
        status
      });
      toast.success(status === 'completed' ? "Focus Session Logged! 🎯" : "Interrupted Session Saved.");
    } catch (error) {
      console.error("Failed to save session:", error);
      toast.error("Failed to sync session.");
    }
  }, [subject, cycleNumber]);

  const handleTimerComplete = useCallback((isManualSkip = false) => {
    const elapsedSeconds = MODES[mode].time - timeLeft;
    setIsActive(false);
    
    if (mode === 'FOCUS') {
      // If manually skipped very early (less than 1 min), don't count it as a cycle/session
      const isProductiveSession = elapsedSeconds >= 60 || !isManualSkip;

      if (isProductiveSession) {
        saveSession(elapsedSeconds, isManualSkip ? 'interrupted' : 'completed');
        const nextSessionCount = sessionsCompleted + 1;
        setSessionsCompleted(nextSessionCount);
        
        if (cycleNumber < 4) {
          setMode('SHORT_BREAK');
          setTimeLeft(MODES.SHORT_BREAK.time);
          setCycleNumber(prev => prev + 1);
        } else {
          setMode('LONG_BREAK');
          setTimeLeft(MODES.LONG_BREAK.time);
          setCycleNumber(1); 
        }
      } else {
        // Just reset or go to short break without credit
        toast.error("Session too short to log.");
        setMode('SHORT_BREAK');
        setTimeLeft(MODES.SHORT_BREAK.time);
      }
    } else {
      // For breaks, skipping just goes back to focus
      setMode('FOCUS');
      setTimeLeft(MODES.FOCUS.time);
    }
  }, [mode, cycleNumber, sessionsCompleted, timeLeft, saveSession]);

  const skipTimer = () => {
    handleTimerComplete(true);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(timerRef.current);
      handleTimerComplete();
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, handleTimerComplete]);

  const progress = ((MODES[mode].time - timeLeft) / MODES[mode].time) * 100;

  return {
    mode,
    setMode: switchMode,
    timeLeft,
    isActive,
    toggleTimer,
    resetTimer,
    skipTimer,
    progress,
    sessionsCompleted,
    cycleNumber,
    subject,
    setSubject,
    modes: MODES
  };
};
