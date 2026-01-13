import React from "react";
import { FaPlay, FaPause, FaUndo, FaStepForward } from "react-icons/fa";

const TimerControls = ({
  isActive,
  onToggle,
  onReset,
  onSkip
}) => {
  return (
    <div className="flex items-center justify-center gap-8 mb-12">
      <button
        onClick={onReset}
        aria-label="Reset Timer"
        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-white transition-all active:scale-95 shadow-sm"
      >
        <FaUndo className="text-xl" />
      </button>

      <button
        onClick={onToggle}
        aria-label={isActive ? "Pause Timer" : "Start Timer"}
        className={`w-24 h-24 flex items-center justify-center rounded-[2.5rem] shadow-xl transition-all active:scale-90 ${
          isActive ? "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50" : "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-300/50 dark:shadow-primary-900/30"
        }`}
      >
        {isActive ? <FaPause className="text-3xl" /> : <FaPlay className="text-3xl ml-1" />}
      </button>

      <button
        onClick={onSkip}
        aria-label="Skip to Next"
        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-white transition-all active:scale-95 shadow-sm"
      >
        <FaStepForward className="text-xl" />
      </button>
    </div>
  );
};

export default TimerControls;
