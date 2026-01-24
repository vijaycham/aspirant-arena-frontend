import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCompress, FaPlay, FaPause } from "react-icons/fa";

const FullScreenTimer = ({
  isOpen,
  timeLeft,
  isActive,
  toggleTimer,
  onClose
}) => {
  if (!isOpen) return null;

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00"; 
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-[#020617] flex flex-col items-center justify-center font-outfit"
      >
        {/* Ambient Glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/5 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Exit Button */}
        <button
          onClick={onClose}
          className="absolute top-10 right-10 text-white/20 hover:text-white transition-all hover:scale-110 z-50 p-4"
          title="Exit Zen Mode"
        >
          <FaCompress size={24} />
        </button>

        {/* Main Clock UI */}
        <div className="relative z-10 flex flex-col items-center gap-10 md:gap-16 scale-90 md:scale-100">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center"
          >
             <h1 className="text-[clamp(80px,15vw,250px)] font-black text-white leading-none tracking-tight tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              {formatTime(timeLeft)}
            </h1>
            <p className="text-[8px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mt-4">Deep Focus Protocol</p>
          </motion.div>

          <button
            onClick={toggleTimer}
            className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-90 group"
          >
            {isActive ? <FaPause className="text-xl md:text-2xl" /> : <FaPlay className="text-xl md:text-2xl ml-1" />}
          </button>
        </div>

        {/* Minimal Footer */}
        <div className="absolute bottom-10 text-[8px] font-black text-white/10 uppercase tracking-[0.8em]">
          Aspirant Arena • Zen Mode
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FullScreenTimer;
