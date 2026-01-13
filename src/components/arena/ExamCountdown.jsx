import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiCalendar } from 'react-icons/fi';

const ExamCountdown = ({ targetDate = "2026-05-24T00:00:00", title = "UPSC CSE Prelims 2026" }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
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
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && timeLeft[interval] !== 0) {
      return;
    }

    timerComponents.push(
      <div key={interval} className="flex flex-col items-center">
        <span className="text-2xl sm:text-3xl font-black bg-gradient-to-br from-primary-600 to-indigo-600 bg-clip-text text-transparent font-mono tracking-tighter">
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
      className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-black/30 relative overflow-hidden group"
    >
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/50 dark:bg-primary-900/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary-200/50"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-3xl -ml-16 -mb-16 transition-all group-hover:bg-indigo-200/50"></div>

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="bg-primary-50 dark:bg-primary-900/30 p-2 rounded-xl text-primary-600 dark:text-primary-400">
                        <FiCalendar className="text-base" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide leading-tight">{title}</h3>
                        <p className="text-[10px] font-bold text-primary-500">Target: May 24, 2026</p>
                    </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
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
