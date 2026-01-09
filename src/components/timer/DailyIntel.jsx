import React from "react";
import { FaBrain, FaBolt, FaChartLine, FaCoffee } from "react-icons/fa";

const DailyIntel = ({
  totalMinutesToday,
  effectiveMinutesToday,
  efficiencyScore,
  sessionsCompleted,
  formatTotalTime
}) => {
  return (
    <div className="glass-card p-8 rounded-[2rem] border border-white/60 shadow-lg relative overflow-hidden">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Daily Intel</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Total Sit */}
        <div className="flex flex-col items-start gap-2 p-3 bg-primary-50/30 rounded-2xl border border-primary-100/20 group/intel relative cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
            <FaBrain size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Total Spent</p>
            <p className="text-lg font-black text-gray-900 tracking-tight">{formatTotalTime(totalMinutesToday)}</p>
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl opacity-0 group-hover/intel:opacity-100 pointer-events-none transition-all z-50 shadow-xl">
            <p className="text-[9px] text-gray-300 font-medium leading-relaxed">
              The raw clock time you&apos;ve spent with the timer active today.
            </p>
          </div>
        </div>

        {/* Deep Focus */}
        <div className="flex flex-col items-start gap-2 p-3 bg-amber-50/30 rounded-2xl border border-amber-100/20 group/intel relative cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <FaBolt size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Deep Focus</p>
            <p className="text-lg font-black text-gray-900 tracking-tight">{formatTotalTime(effectiveMinutesToday)}</p>
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl opacity-0 group-hover/intel:opacity-100 pointer-events-none transition-all z-50 shadow-xl">
            <p className="text-[9px] text-gray-300 font-medium leading-relaxed text-right">
              Time weighted by your self-rated focus intensity (e.g. 1 hour at 5-star focus = 1 hour Deep Focus).
            </p>
          </div>
        </div>

        {/* Quality */}
        <div className="flex flex-col items-start gap-2 p-3 bg-orange-50/30 rounded-2xl border border-orange-100/20 group/intel relative cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
            <FaChartLine size={14} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Quality</p>
              <div className={`w-1.5 h-1.5 rounded-full ${
                efficiencyScore >= 80 ? "bg-emerald-500" :
                efficiencyScore >= 60 ? "bg-amber-500" : "bg-rose-500"
              }`} />
            </div>
            <p className="text-lg font-black text-gray-900 tracking-tight">{efficiencyScore}%</p>
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl opacity-0 group-hover/intel:opacity-100 pointer-events-none transition-all z-50 shadow-xl">
            <p className="text-[9px] text-gray-300 font-medium leading-relaxed">
              Your average study efficiency based on self-reflection ratings today.
            </p>
          </div>
        </div>

        {/* Sessions */}
        <div className="flex flex-col items-start gap-1.5 p-3 bg-emerald-50/30 rounded-2xl border border-emerald-100/20 group/intel relative cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <FaCoffee size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Sessions</p>
            <p className="text-lg font-black text-gray-900 tracking-tight">{sessionsCompleted}</p>
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
