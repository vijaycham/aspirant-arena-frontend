import React from "react";
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
  return (
    <>
      <div className="inline-flex p-1 bg-gray-100/50 backdrop-blur-md rounded-xl mb-12 self-center">
        {Object.entries(modes || {}).map(([key, value]) => (
          <button
            key={key}
            onClick={() => {
              switchMode(key);
              setIsEditing(false);
            }}
            className={`px-6 md:px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              mode === key ? "bg-white text-gray-900 shadow-sm scale-105" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {value.label}
          </button>
        ))}
      </div>

      <div className="relative mb-10">
        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div
              key="timer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="group cursor-pointer relative inline-block"
              onClick={() => setIsEditing(true)}
            >
              <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-none">
                {formatTime(timeLeft)}
              </h1>
              <div className="absolute -top-4 -right-8 opacity-0 group-hover:opacity-100 transition-opacity text-primary-500">
                <FaEdit size={18} />
              </div>
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
                className="text-6xl font-black w-40 text-center bg-transparent border-b-4 border-primary-500 outline-none"
              />
              <div className="flex gap-4 mt-4">
                <button type="submit" className="text-xs font-black uppercase text-primary-600">Save</button>
                <button type="button" onClick={() => setIsEditing(false)} className="text-xs font-black uppercase text-gray-400">Cancel</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        
        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`h-2 w-10 rounded-full transition-all duration-500 ${
                  num < cycleNumber ? "bg-primary-600 shadow-sm" : num === cycleNumber && isActive ? "bg-primary-400 animate-pulse" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <button
            onClick={onFullScreen}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary-600 hover:bg-white transition-all active:scale-95"
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
