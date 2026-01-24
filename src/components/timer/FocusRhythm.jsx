import React from "react";

const FocusRhythm = ({ todaySessions }) => {
  if (!todaySessions || todaySessions.length === 0) return null;

  return (
    <div className="max-w-md mx-auto w-full px-2 border-t border-gray-100/50 dark:border-white/10 pt-10">
      <div className="flex items-center justify-center mb-8 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
        <span>Focus Rhythm</span>
      </div>
      <div className="overflow-x-auto pt-20 pb-4 scrollbar-hide -mt-20">
        <div className={`flex items-end gap-2 h-28 min-w-full ${todaySessions.length <= 8 ? "justify-center" : "justify-start px-4"}`}>
          {todaySessions.map((s, i) => (
            <div
              key={s._id || i}
              className="flex flex-col items-center justify-end flex-shrink-0 w-8 h-full relative group cursor-pointer"
            >
            <div 
              className={`w-full rounded-t-lg transition-all duration-700 ease-out border border-white/20 dark:border-white/10 ${
                s.focusRating >= 5 ? "bg-emerald-600 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] shadow-emerald-500/30" :
                s.focusRating >= 4 ? "bg-emerald-400" :
                s.focusRating >= 3 ? "bg-amber-400" :
                s.focusRating >= 2 ? "bg-orange-500" : "bg-rose-500"
              }`}
              style={{ 
                height: `${(s.focusRating / 5) * 100}%`,
                minHeight: '4px',
                opacity: 0.85 + (s.focusRating / 5) * 0.15
              }} 
            />
            {/* Time Label */}
            <span className="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-tighter tabular-nums leading-none">
              {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
            
            {/* Improved Floating Tooltip - Dark Glass Style */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-slate-900/95 backdrop-blur-xl border border-slate-800 p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 pointer-events-none z-50 shadow-2xl w-36 text-center">
              <p className="border-b border-white/10 pb-2 mb-2 font-black truncate text-primary-400 uppercase text-[8px] tracking-widest">{s.subject || 'Focus'}</p>
              <div className="flex justify-between items-center px-1">
                <span className="font-bold text-white text-[10px]">{s.duration}m</span>
                <span className="text-emerald-400 font-black text-[10px]">{s.focusRating}★</span>
              </div>
            </div>
            </div>
          ))}
          {/* Placeholder - Only show if very few sessions */}
          {todaySessions.length < 8 && Array.from({ length: 8 - todaySessions.length }).map((_, i) => (
            <div key={`empty-${i}`} className="w-8 h-4 bg-gray-100/50 dark:bg-white/5 rounded-md border border-gray-50 dark:border-white/5 mb-[22px] flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* 🧭 Semantic Legend */}
      <div className="flex justify-center items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5 opacity-60 grayscale hover:grayscale-0 transition-all">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400/50"></div>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Flow</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-60 grayscale hover:grayscale-0 transition-all">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></div>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Zone</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-60 grayscale hover:grayscale-0 transition-all">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-400/50"></div>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Drift</span>
        </div>
      </div>
    </div>
  );
};

export default FocusRhythm;
