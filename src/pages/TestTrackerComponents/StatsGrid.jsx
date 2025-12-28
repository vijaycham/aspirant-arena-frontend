import React from "react";

const StatsGrid = ({ quickStats, selectedSubject }) => {
  if (!quickStats) return null;

  const cards = [
    { label: "Pool Size", value: `${quickStats.total} Tests`, color: "text-blue-600", bg: "bg-blue-50" },
    {
      label: selectedSubject === "All" ? "Global Acc." : "Focus Acc.",
      value: `${quickStats.accuracy}%`,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      trend: quickStats.lastChange
    },
    { 
      label: selectedSubject === "All" ? "Peak Performance" : "Avg Speed Index", 
      value: selectedSubject === "All" ? quickStats.best : `${quickStats.avgSpeed} m/m`, 
      color: "text-indigo-600", 
      bg: "bg-indigo-50" 
    },
    { label: "Avg Errors / Test", value: quickStats.avgMistakes, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`${card.bg} p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-white shadow-sm flex flex-col justify-center relative overflow-hidden`}
        >
          <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">
            {card.label}
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className={`text-lg md:text-2xl font-black ${card.color} truncate`}>{card.value}</span>
            {card.trend !== undefined && card.trend !== 0 && (
              <span
                className={`text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 rounded-full w-fit ${
                  card.trend > 0 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                }`}
              >
                {card.trend > 0 ? "↑" : "↓"} {Math.abs(card.trend)}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
