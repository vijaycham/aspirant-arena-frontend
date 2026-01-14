import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiCalendar } from 'react-icons/fi';

const ExamCountdown = () => {
  // State for exam mode (persisted in localStorage)
  const [examMode, setExamMode] = useState(() => localStorage.getItem("examMode") || "prelims");

  // Dates Configuration
  const exams = {
    prelims: { date: "2026-05-24T00:00:00", title: "UPSC CSE Prelims 2026" },
    mains: { date: "2026-09-18T00:00:00", title: "UPSC CSE Mains 2026" } // Estimated
  };

  const currentTarget = exams[examMode].date;
  const currentTitle = exams[examMode].title;

  useEffect(() => {
    localStorage.setItem("examMode", examMode);
  }, [examMode]);

  const calculateTimeLeft = useCallback(() => {
    const difference = +new Date(currentTarget) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }, [currentTarget]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    setTimeLeft(calculateTimeLeft()); // Immediate update on mode switch
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [examMode, currentTarget, calculateTimeLeft]);

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && timeLeft[interval] !== 0) {
      return;
    }

    timerComponents.push(
      <div key={interval} className="flex flex-col items-center">
        <span className="text-2xl sm:text-3xl font-black bg-gradient-to-br from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 bg-clip-text text-transparent font-mono tracking-tighter">
          {String(timeLeft[interval]).padStart(2, '0')}
        </span>
        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">
          {interval}
        </span>
      </div>
    );
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-black/30 relative overflow-hidden group transition-all duration-200"
    >
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/50 dark:bg-primary-900/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary-200/50"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-3xl -ml-16 -mb-16 transition-all group-hover:bg-indigo-200/50"></div>

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-primary-50 dark:bg-primary-900/30 p-2 rounded-xl text-primary-600 dark:text-primary-400">
                        <FiCalendar className="text-base" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide leading-tight transition-all duration-200">{currentTitle}</h3>
                        <p className="text-[10px] font-bold text-primary-500 transition-all duration-200">
                           Target: {new Date(currentTarget).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                
                {/* Exam Mode Toggle */}
                <button
                  onClick={() => setExamMode(prev => prev === 'prelims' ? 'mains' : 'prelims')}
                  className="px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-gray-300 dark:hover:border-slate-600 flex items-center gap-2"
                >
                   <span>{examMode === 'prelims' ? 'Switch to Mains' : 'Switch to Prelims'}</span>
                </button>
            </div>

            {timerComponents.length ? (
                <div className="grid grid-cols-4 gap-2 text-center divide-x divide-gray-100 dark:divide-white/10">
                    {timerComponents}
                </div>
            ) : (
                <div className="text-center py-4">
                    <span className="text-xl font-black text-emerald-500">Mission Accomplished? 🏆</span>
                </div>
            )}
            
             <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium bg-gray-50/80 dark:bg-slate-800/50 rounded-lg p-2 border border-gray-100 dark:border-white/5">
                <FiClock className="text-gray-400" />
                <span>Every second counts. Stay focused.</span>
            </div>
        </div>
    </motion.div>
  );
};

export default ExamCountdown;
