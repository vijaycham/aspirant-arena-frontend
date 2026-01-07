import { useState, useEffect, useCallback, useRef } from 'react';

const MODES = {
  FOCUS: { label: 'Focus', time: 25 * 60, color: 'primary' },
  SHORT_BREAK: { label: 'Short Break', time: 5 * 60, color: 'emerald' },
  LONG_BREAK: { label: 'Long Break', time: 15 * 60, color: 'indigo' }
};

export const useTimer = () => {
  const [mode, setMode] = useState('FOCUS');
  const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.time);
  const [isActive, setIsActive] = useState(false);
  const [cycleNumber, setCycleNumber] = useState(1);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [subject, setSubject] = useState("");
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

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

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      setIsActive(false);
      
      if (mode === 'FOCUS') {
        const nextSessionCount = sessionsCompleted + 1;
        setSessionsCompleted(nextSessionCount);
        
        // Logic for next mode
        if (cycleNumber < 4) {
          setMode('SHORT_BREAK');
          setTimeLeft(MODES.SHORT_BREAK.time);
          setCycleNumber(prev => prev + 1);
        } else {
          setMode('LONG_BREAK');
          setTimeLeft(MODES.LONG_BREAK.time);
          setCycleNumber(1); // Reset cycles after the long break is scheduled
        }
      } else {
        // After any break, go back to Focus
        setMode('FOCUS');
        setTimeLeft(MODES.FOCUS.time);
      }
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, mode, cycleNumber, sessionsCompleted]);

  const progress = ((MODES[mode].time - timeLeft) / MODES[mode].time) * 100;

  return {
    mode,
    setMode: switchMode,
    timeLeft,
    isActive,
    toggleTimer,
    resetTimer,
    progress,
    sessionsCompleted,
    cycleNumber,
    subject,
    setSubject,
    modes: MODES
  };
};
