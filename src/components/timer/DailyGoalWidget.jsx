import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { FaTrophy, FaEdit, FaCheck } from "react-icons/fa";
import { toast } from "react-hot-toast";

const DailyGoalWidget = ({ totalMinutesToday }) => {
  const [dailyGoal, setDailyGoal] = useState(360); // Default 6 hours
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState("");

  useEffect(() => {
    const savedGoal = localStorage.getItem("timer-dailyGoal");
    if (savedGoal) {
      setDailyGoal(parseInt(savedGoal, 10));
    }
  }, []);

  // 🎉 Confetti Logic (Once per day)
  useEffect(() => {
    if (totalMinutesToday >= dailyGoal && dailyGoal > 0) {
      const today = new Date().toDateString();
      const lastReward = localStorage.getItem("timer-lastRewardDate");

      if (lastReward !== today) {
        // Fire Confetti Celebration (5 Seconds)
        const end = Date.now() + 5 * 1000;
        const colors = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'];

        (function frame() {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors,
            zIndex: 9999
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors,
            zIndex: 9999
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
        
        localStorage.setItem("timer-lastRewardDate", today);
        toast.success("Daily Goal Crushed! 🔥", { duration: 5000, icon: "🏆" });
      }
    }
  }, [totalMinutesToday, dailyGoal]);

  const handleSave = () => {
    const val = parseInt(tempGoal, 10);
    if (!isNaN(val) && val > 0 && val <= 1440) { // Max 24 hours
      setDailyGoal(val);
      localStorage.setItem("timer-dailyGoal", val.toString());
      setIsEditing(false);
      toast.success("Daily Goal Updated! 🎯");
    } else {
      toast.error("Please enter a valid duration (1-1440 mins)");
    }
  };

  const progress = Math.min(100, (totalMinutesToday / dailyGoal) * 100);
  const isGoalMet = totalMinutesToday >= dailyGoal;

  // SVG Circle Config
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="group relative cursor-pointer"
            onClick={() => {
                setTempGoal(dailyGoal.toString());
                setIsEditing(true);
            }}
          >
            <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm border border-white/60 dark:border-white/5 px-4 py-2 rounded-2xl shadow-sm hover:shadow-md transition-all">
               {/* Progress Ring */}
               <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="transform -rotate-90 w-10 h-10">
                    <circle
                      className="text-gray-200 dark:text-slate-700"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="transparent"
                      r={radius}
                      cx="20"
                      cy="20"
                    />
                    <circle
                      className={isGoalMet ? "text-emerald-500" : "text-primary-500"}
                      strokeWidth="4"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r={radius}
                      cx="20"
                      cy="20"
                    />
                  </svg>
                  <div className="absolute text-[8px] font-black">
                    {isGoalMet ? "🎉" : `${Math.round(progress)}%`}
                  </div>
               </div>

               <div className="text-left">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    Daily Goal <FaEdit size={8} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-sm font-black text-gray-800 dark:text-white font-mono">
                    {totalMinutesToday} <span className="text-gray-400 text-[10px]">/ {dailyGoal}m</span>
                  </p>
               </div>
            </div>
            
            {isGoalMet && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 border border-yellow-200 p-1.5 rounded-full shadow-lg"
              >
                <FaTrophy size={10} />
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl shadow-lg border border-primary-100 dark:border-primary-900"
          >
            <input
              autoFocus
              type="number"
              className="w-16 bg-transparent border-b-2 border-primary-500 text-center font-bold text-gray-900 dark:text-white outline-none"
              value={tempGoal}
              onChange={(e) => setTempGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <span className="text-xs text-gray-500 font-bold">min</span>
            <button onClick={handleSave} className="p-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-lg hover:bg-primary-200"><FaCheck size={10} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DailyGoalWidget;
