import React from "react";
import { motion } from "framer-motion";
import { FaPlay, FaPause, FaUndo, FaStepForward, FaCoffee, FaBrain } from "react-icons/fa";
import { useTimer } from "../hooks/useTimer";

const Timer = () => {
  const {
    mode,
    setMode,
    timeLeft,
    isActive,
    toggleTimer,
    resetTimer,
    skipTimer,
    sessionsCompleted,
    cycleNumber,
    subject,
    setSubject,
    modes
  } = useTimer();

  // Format time MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 font-outfit relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className={`absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-30 mix-blend-multiply animate-blob transition-colors duration-1000 ${
          mode === 'FOCUS' ? 'bg-primary-300' : mode === 'SHORT_BREAK' ? 'bg-emerald-300' : 'bg-indigo-300'
        }`}></div>
        <div className={`absolute bottom-[20%] left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-30 mix-blend-multiply animate-blob animation-delay-2000 transition-colors duration-1000 ${
          mode === 'FOCUS' ? 'bg-rose-200' : 'bg-orange-200'
        }`}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="text-center md:text-left px-2">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter flex items-center justify-center md:justify-start gap-4 uppercase">
            Focus <span className="text-primary-600 italic">Arena</span> 🎯
          </h1>
          <p className="text-gray-500 font-bold text-[10px] md:text-xs mt-2 uppercase tracking-widest opacity-70">
            Deep work management for peak performance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Section: Main Timer Card - More Compact */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 xl:col-span-8"
          >
            <div className="glass-card p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-white/60 text-center relative overflow-hidden max-w-2xl mx-auto lg:mx-0">
              
              {/* Mode Selector */}
              <div className="inline-flex p-1 bg-gray-100/50 backdrop-blur-md rounded-xl mb-6 md:mb-8 border border-gray-200/50 overflow-x-auto max-w-full">
                {Object.entries(modes).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setMode(key)}
                    className={`px-3 md:px-5 py-2 rounded-lg text-[9px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                      mode === key 
                        ? "bg-white text-gray-900 shadow-sm scale-105" 
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {value.label}
                  </button>
                ))}
              </div>

              {/* Timer Display */}
              <div className="relative mb-6 md:mb-8">
                <div className="relative z-10">
                  <motion.h1 
                    key={timeLeft}
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-none"
                  >
                    {formatTime(timeLeft)}
                  </motion.h1>
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] ${
                      mode === 'FOCUS' ? 'text-primary-600' : 'text-emerald-600'
                    }`}>
                      {mode === 'FOCUS' ? 'Astra Focus State' : 'Strategic Recovery'}
                    </span>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map((num) => (
                        <div 
                          key={num}
                          className={`h-1 w-6 md:w-8 rounded-full transition-all duration-500 ${
                            num < cycleNumber ? 'bg-primary-600' : num === cycleNumber && isActive ? 'bg-primary-400 animate-pulse' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress Ring Background - Even more subtle */}
                <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] -rotate-90 pointer-events-none opacity-[0.03] hidden md:block">
                  <circle
                    cx="50%" cy="50%" r="45%"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    className="text-gray-900"
                  />
                </svg>
              </div>

              {/* Subject Input */}
              <div className="max-w-xs mx-auto mb-6 md:mb-8">
                <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Current Focus Mission</label>
                <input 
                  type="text"
                  placeholder="What are you mastering?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-gray-50/50 border-2 border-transparent focus:border-primary-500 focus:bg-white p-3 md:p-4 rounded-xl md:rounded-2xl outline-none text-center font-bold text-gray-700 transition-all placeholder:text-gray-300 text-sm"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 md:gap-6">
                <button 
                  onClick={resetTimer}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all active:scale-95"
                >
                  <FaUndo className="text-xs" />
                </button>
                
                <button 
                  onClick={toggleTimer}
                  className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-[1.5rem] md:rounded-[2rem] shadow-xl transition-all active:scale-90 ${
                    isActive 
                    ? "bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-rose-200" 
                    : "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200"
                  }`}
                >
                  {isActive ? <FaPause className="text-lg md:text-xl" /> : <FaPlay className="text-lg md:text-xl ml-1" />}
                </button>

              <button 
                onClick={skipTimer}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all active:scale-95"
              >
                <FaStepForward className="text-xs" />
              </button>
              </div>
            </div>
          </motion.div>

          {/* Right Section: Stats & Intel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Quick Stats */}
            <div className="glass-card p-8 rounded-[2.5rem] border border-white/60">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Daily Intel</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                      <FaBrain />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">Focus Cycles</p>
                      <p className="text-xl font-black text-gray-900">{sessionsCompleted}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <FaCoffee />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">Break State</p>
                      <p className="text-xl font-black text-gray-900">{Math.floor(sessionsCompleted / 4)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips/Quotes Card */}
            <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
              <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-4">Aspirant Wisdom</p>
              <p className="text-sm font-medium leading-relaxed italic opacity-90 group-hover:opacity-100 transition-opacity">
                "The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks, and starting on the first one."
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Timer;
