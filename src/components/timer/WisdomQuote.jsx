import React, { useState, useEffect } from "react";

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Don't watch the clock; do what it does. Keep going.",
  "Believe you can and you're halfway there.",
  "Your time is limited, so don't waste it living someone else's life.",
  "The future depends on what you do today.",
  "It always seems impossible until it's done.",
  "Discipline is the bridge between goals and accomplishment.",
  "Dream big and dare to fail.",
  "Quality is not an act, it is a habit."
];

const WisdomQuote = () => {
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    // Pick a random quote on mount (client-side only to avoid hydration mismatch if SSR, 
    // but here it's SPA so random is fine)
    const random = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(random);
  }, []);

  return (
    <div className="glass-card dark:bg-slate-900/60 dark:border-white/10 dark:shadow-black/50 p-8 rounded-[2rem] border border-white/60 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-500">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary-200/30 transition-colors duration-500"></div>
      <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-4 italic">Aspirant Wisdom</p>
      <p className="text-sm font-semibold leading-relaxed italic text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
        “{quote}”
      </p>
    </div>
  );
};

export default WisdomQuote;
