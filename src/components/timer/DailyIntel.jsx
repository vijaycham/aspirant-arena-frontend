import React from "react";
import { FaBrain, FaBolt, FaChartLine, FaCoffee } from "react-icons/fa";

const DailyIntel = ({
  totalMinutesToday,
  goalMinutesToday,
  effectiveMinutesToday,
  efficiencyScore,
  sessionsCompleted,
  formatTotalTime,
  selectedArenaId
}) => {
  return (
    <div className="glass-card dark:bg-slate-900/60 dark:border-white/10 dark:shadow-black/50 p-8 rounded-[2rem] border border-white/60 shadow-lg relative overflow-hidden">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Daily Intel</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Total Sit (Global) */}
        <div className="flex flex-col items-start gap-2 p-3 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-white/5 group/global relative cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-gray-400">
            <FaBrain size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Global Total</p>
            <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight">{formatTotalTime(totalMinutesToday)}</p>
          </div>
          <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl opacity-0 group-hover/global:opacity-100 pointer-events-none transition-all z-50 shadow-xl">
            <p className="text-[9px] text-gray-300 font-medium leading-relaxed">
              Your absolute total study time across all subjects and exams today.
            </p>
          </div>
        </div>

        {/* Goal Focus (Conditional) */}
        {selectedArenaId && (
          <div className="flex flex-col items-start gap-2 p-3 bg-primary-50/30 dark:bg-primary-900/20 rounded-2xl border border-primary-100/20 dark:border-primary-500/10 group/goal relative cursor-pointer animate-in zoom-in duration-300">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
              <FaBrain size={14} />
            </div>
            <div>
              <p className="text-[8px] font-black text-primary-500 uppercase tracking-tighter">Goal Focus</p>
              <p className="text-lg font-black text-primary-700 dark:text-primary-300 tracking-tight">{formatTotalTime(goalMinutesToday)}</p>
            </div>
            <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl opacity-0 group-hover/goal:opacity-100 pointer-events-none transition-all z-50 shadow-xl">
              <p className="text-[9px] text-gray-300 font-medium leading-relaxed text-right">
                Time spent specifically on your active mission roadmap today.
              </p>
            </div>
          </div>
        )}

        {/* Deep Focus */}
        <div className="flex flex-col items-start gap-2 p-3 bg-amber-50/30 dark:bg-amber-900/20 rounded-2xl border border-amber-100/20 dark:border-amber-500/10 group/intel relative cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <FaBolt size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Deep Focus</p>
            <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight">{formatTotalTime(effectiveMinutesToday)}</p>
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl opacity-0 group-hover/intel:opacity-100 pointer-events-none transition-all z-50 shadow-xl">
            <p className="text-[9px] text-gray-300 font-medium leading-relaxed text-right">
              Time weighted by your self-rated focus intensity (e.g. 1 hour at 5-star focus = 1 hour Deep Focus).
            </p>
          </div>
        </div>

        {/* Quality */}
        <div className="flex flex-col items-start gap-2 p-3 bg-orange-50/30 dark:bg-orange-900/20 rounded-2xl border border-orange-100/20 dark:border-orange-500/10 group/intel relative cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
            <FaChartLine size={14} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Quality</p>
              <div className={`w-1.5 h-1.5 rounded-full ${efficiencyScore >= 80 ? "bg-emerald-500" :
                  efficiencyScore >= 60 ? "bg-amber-500" : "bg-rose-500"
                }`} />
            </div>
            <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight">{efficiencyScore}%</p>
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl opacity-0 group-hover/intel:opacity-100 pointer-events-none transition-all z-50 shadow-xl">
            <p className="text-[9px] text-gray-300 font-medium leading-relaxed">
              Your average study efficiency based on self-reflection ratings today.
            </p>
          </div>
        </div>

        {/* Sessions */}
        <div className="flex flex-col items-start gap-1.5 p-3 bg-emerald-50/30 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100/20 dark:border-emerald-500/10 group/intel relative cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <FaCoffee size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Sessions</p>
            <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight">{sessionsCompleted}</p>
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl opacity-0 group-hover/intel:opacity-100 pointer-events-none transition-all z-50 shadow-xl">
            <p className="text-[9px] text-gray-300 font-medium leading-relaxed text-right">
              Total study cycles you&apos;ve started and logged throughout the day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyIntel;
