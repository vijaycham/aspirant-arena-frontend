import React from "react";

const InsightModal = ({ viewingReflection, setViewingReflection }) => {
  if (!viewingReflection) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white p-6 sm:p-8 rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl max-w-lg w-full border border-gray-100 scale-100 animate-in translate-y-full sm:translate-y-0 sm:zoom-in-95 duration-300 sm:duration-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter leading-tight">
              {viewingReflection.subject}
            </h3>
            <p className="text-xs font-bold text-primary-500 uppercase tracking-widest">
              {viewingReflection.testName}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-gray-900">
              {viewingReflection.marks}
              <span className="text-gray-300 text-sm">/{viewingReflection.total}</span>
            </div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score Profile</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 text-center">
            <div className="text-lg font-black text-indigo-600">{viewingReflection.startTime || "--:--"}</div>
            <div className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Start Time</div>
          </div>
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 text-center">
            <div className="text-lg font-black text-emerald-600">
              {viewingReflection.timeTaken || "--"}{" "}
              <span className="text-[10px] uppercase text-emerald-400">Min</span>
            </div>
            <div className="text-[9px] font-black text-emerald-300 uppercase tracking-widest">Duration</div>
          </div>
        </div>

        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mb-6 flex justify-between items-center group">
          <div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Speed Index</span>
            <div className="text-xl font-black text-gray-900">
              {viewingReflection.timeTaken ? (viewingReflection.marks / viewingReflection.timeTaken).toFixed(2) : "--"}
              <span className="text-gray-300 text-xs ml-1 font-bold italic">marks/min</span>
            </div>
          </div>
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
            ⚡
          </div>
        </div>

        <div className="bg-gray-50/50 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 mb-6 sm:mb-8 min-h-[120px] sm:min-h-[150px] flex flex-col">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 block">
            Self-Reflection & Notes
          </span>
          <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-wrap flex-1 italic">
            {viewingReflection.reflection ||
              "No written reflection logged for this session."}
          </p>
        </div>

        <button
          onClick={() => setViewingReflection(null)}
          className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 uppercase tracking-widest text-xs"
        >
          Close Insights
        </button>
      </div>
    </div>
  );
};

export default InsightModal;
