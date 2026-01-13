import React from "react";

const QuickStrategy = ({ applyPreset, setIsEditing, upscPresets }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Quick Strategy</h3>
      <div className="grid grid-cols-2 gap-3">
        {upscPresets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => {
              applyPreset(preset.name, preset.focus, preset.short, preset.long);
              setIsEditing(false);
            }}
            className="glass-card dark:bg-slate-900/60 dark:border-white/10 dark:shadow-black/50 hover:bg-white dark:hover:bg-slate-800 p-4 rounded-2xl border border-white/60 shadow-lg dark:hover:shadow-black/70 text-left transition-all hover:shadow-md active:scale-95 group"
          >
            <span className="text-xl mb-1 block group-hover:scale-110 transition-transform">{preset.icon}</span>
            <h4 className="text-[8px] font-black uppercase text-gray-400 mb-0.5 tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400">{preset.name}</h4>
            <p className="text-xs font-black text-gray-900 dark:text-white">{preset.focus}m / {preset.short}m</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickStrategy;
