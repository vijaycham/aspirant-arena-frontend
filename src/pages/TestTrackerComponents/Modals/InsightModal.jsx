import React from "react";

const InsightModal = ({ viewingReflection, setViewingReflection }) => {
  if (!viewingReflection) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl dark:shadow-slate-950/50 max-w-lg w-full border border-gray-100 dark:border-white/10 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 sm:duration-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight">
              {viewingReflection.subject}
            </h3>
            <p className="text-xs font-bold text-primary-500 dark:text-primary-400 uppercase tracking-widest">
              {viewingReflection.testName}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {viewingReflection.marks}
              <span className="text-gray-300 dark:text-gray-600 text-sm">/{viewingReflection.total}</span>
            </div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score Profile</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-500/20 text-center">
            <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">{viewingReflection.startTime || "--:--"}</div>
            <div className="text-[9px] font-black text-indigo-300 dark:text-indigo-300/60 uppercase tracking-widest">Start Time</div>
          </div>
          <div className="bg-emerald-50/50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/20 text-center">
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {viewingReflection.timeTaken || "--"}{" "}
              <span className="text-[10px] uppercase text-emerald-400 dark:text-emerald-500/60">Min</span>
            </div>
            <div className="text-[9px] font-black text-emerald-300 dark:text-emerald-300/60 uppercase tracking-widest">Duration</div>
          </div>
        </div>

        <div className="bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-white/5 mb-6 flex justify-between items-center group">
          <div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Speed Index</span>
            <div className="text-xl font-black text-gray-900 dark:text-white">
              {viewingReflection.timeTaken ? (viewingReflection.marks / viewingReflection.timeTaken).toFixed(2) : "--"}
              <span className="text-gray-300 dark:text-gray-600 text-xs ml-1 font-bold italic">marks/min</span>
            </div>
          </div>
          <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
            ⚡
          </div>
        </div>

        <div className="bg-gray-50/50 dark:bg-slate-800/50 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 dark:border-white/5 mb-6 sm:mb-8 min-h-[120px] sm:min-h-[150px] flex flex-col">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 block">
            Self-Reflection & Notes
          </span>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed whitespace-pre-wrap flex-1 italic">
            {viewingReflection.reflection ||
              "No written reflection logged for this session."}
          </p>
        </div>

        <button
          onClick={() => setViewingReflection(null)}
          className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl hover:bg-black dark:hover:bg-gray-200 transition-all shadow-xl shadow-gray-200 dark:shadow-none uppercase tracking-widest text-xs"
        >
          Close Insights
        </button>
      </div>
    </div>
  );
};

export default InsightModal;
