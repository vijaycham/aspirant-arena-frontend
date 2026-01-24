import React from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaExpand } from "react-icons/fa";

const TimerDisplay = ({
  mode,
  modes,
  switchMode,
  timeLeft,
  isEditing,
  setIsEditing,
  manualMin,
  setManualMin,
  handleManualSubmit,
  formatTime,
  cycleNumber,
  isActive,
  onFullScreen
}) => {
  // Helper for Context Label (e.g., "FOCUS · Session 1 of 4")
  const getContextLabel = () => {
    if (mode === 'STOPWATCH') return 'Open Session · Infinity';
    if (mode === 'FOCUS') return `Focus Mode · Session ${cycleNumber} of 4`;
    if (mode === 'SHORT_BREAK') return 'Break · Recharge';
    if (mode === 'LONG_BREAK') return 'Long Break · Reset';
    return '';
  };

  return (
    <>
      {/* 🛡️ Mode Toggle Switch */}
      <div className="inline-flex bg-gray-100 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-1.5 mb-10 self-center border border-transparent dark:border-white/5 relative">
         {/* Slider Background */}
         <motion.div 
            className="absolute top-1.5 bottom-1.5 rounded-xl bg-white dark:bg-slate-700 shadow-sm border border-black/5 dark:border-white/5 z-0"
            initial={false}
            animate={{ 
               left: mode === 'STOPWATCH' ? '50%' : '6px',
               right: mode === 'STOPWATCH' ? '6px' : '50%'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
         />

         {/* Countdown Option */}
         <button
            onClick={() => {
               if (isActive) {
                  toast("Pause timer before switching modes ⏸️", { icon: "🚧" });
                  return;
               }
               if (mode === 'STOPWATCH') switchMode('FOCUS');
            }}
            className={`relative z-10 px-4 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors w-24 md:w-32 ${
               mode !== 'STOPWATCH' ? 'text-primary-600 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500'
            }`}
         >
            Countdown
         </button>

         {/* Stopwatch Option */}
         <button
            onClick={() => {
               if (isActive) {
                  toast("Pause timer before switching modes ⏸️", { icon: "🚧" });
                  return;
               }
               switchMode('STOPWATCH');
            }}
            className={`relative z-10 px-4 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors w-24 md:w-32 ${
               mode === 'STOPWATCH' ? 'text-primary-600 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500'
            }`}
         >
            Stopwatch
         </button>
      </div>

      {/* 🍅 Pomodoro Tabs (Only visible in Countdown Mode) */}
      {/* 🛡️ Fixed height container prevents layout shift when tabs disappear */}
      <div className="h-8 mb-8 flex justify-center w-full">
        <AnimatePresence>
           {mode !== 'STOPWATCH' ? (
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="flex gap-2"
              >
                 {Object.entries(modes || {}).filter(([k]) => k !== 'STOPWATCH').map(([key, value]) => (
                    <button
                       key={key}
                       onClick={() => {
                           if (isActive) {
                              toast("Pause first to change mode ⏸️");
                              return;
                           }
                           switchMode(key);
                           setIsEditing(false);
                        }}
                       className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${
                          mode === key 
                             ? "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400" 
                             : "bg-transparent border-transparent text-gray-300 dark:text-gray-600 hover:text-gray-500"
                       }`}
                    >
                       {value.label}
                    </button>
                 ))}
              </motion.div>
           ) : (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex items-center gap-2 text-[9px] font-bold text-gray-300 uppercase tracking-widest"
             >
                <span>Health Cap: 4 Hours Max</span>
             </motion.div>
           )}
        </AnimatePresence>
      </div>

      <div className="relative mb-10">
        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div
              key="timer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`group relative inline-block ${mode === 'STOPWATCH' ? 'cursor-default' : 'cursor-pointer'}`}
              onClick={() => {
                if (mode === 'STOPWATCH') return;
                
                if (isActive) {
                  toast("Pause timer to edit duration", { icon: "⏸️" });
                } else {
                  setIsEditing(true);
                }
              }}
            >
              <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white tracking-tighter leading-none transition-all">
                {formatTime(timeLeft)}
              </h1>
              
              {mode !== 'STOPWATCH' && (
                <div className="absolute -top-4 -right-8 opacity-0 group-hover:opacity-100 transition-opacity text-primary-500">
                  <FaEdit size={18} />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.form
              key="edit"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onSubmit={handleManualSubmit}
              className="flex flex-col items-center gap-2"
            >
              <input 
                autoFocus
                type="number"
                min="1"
                max="300"
                placeholder="Mins"
                value={manualMin}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 300)) {
                    setManualMin(val);
                  }
                }}
                className="text-6xl font-black w-40 text-center bg-transparent border-b-4 border-primary-500 outline-none text-gray-900 dark:text-white"
              />
              <div className="flex gap-4 mt-4">
                <button type="submit" className="text-xs font-black uppercase text-primary-600">Save</button>
                <button type="button" onClick={() => setIsEditing(false)} className="text-xs font-black uppercase text-gray-400">Cancel</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        
        {/* Context Label - Stable Layout */}
        <div className="h-6 mt-2 flex items-center justify-center">
           <motion.p 
             key={mode + cycleNumber} 
             initial={{ opacity: 0, y: 5 }} 
             animate={{ opacity: 1, y: 0 }}
             className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 text-center"
           >
             {getContextLabel()}
           </motion.p>
        </div>
        
        <div className="mt-8 flex flex-col items-center gap-6">
          {mode !== 'STOPWATCH' && (
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((num) => {
                const isCompleted = num < cycleNumber;
                const isCurrent = num === cycleNumber;
                
                return (
                  <div key={num} className="relative group/cycle">
                    <div
                      className={`h-2 w-12 rounded-full transition-all duration-500 ${
                        isCompleted 
                          ? "bg-primary-600 shadow-sm" 
                          : isCurrent && isActive 
                            ? "bg-primary-400 animate-pulse" 
                            : isCurrent 
                              ? "bg-primary-300" 
                              : "bg-gray-200 dark:bg-white/10"
                      }`}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg opacity-0 group-hover/cycle:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      <p className="text-[9px] font-black uppercase text-white tracking-wider">
                        {isCompleted ? "Completed" : isCurrent ? "Current Session" : "Upcoming"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={onFullScreen}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-900 transition-all active:scale-95"
          >
            <FaExpand size={10} />
            Zen Mode
          </button>
        </div>
      </div>
    </>
  );
};

export default TimerDisplay;
