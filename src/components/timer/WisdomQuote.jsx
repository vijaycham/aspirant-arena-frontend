import React from "react";

const WisdomQuote = () => {
  return (
    <div className="glass-card p-8 rounded-[2rem] border border-white/60 shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
      <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-4 italic">Aspirant Wisdom</p>
      <p className="text-sm font-semibold leading-relaxed italic text-gray-700 group-hover:text-gray-900 transition-colors">
        “The secret of getting ahead is getting started.”
      </p>
    </div>
  );
};

export default WisdomQuote;
