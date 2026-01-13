import Shimmer from "../../components/Shimmer";

const StatsGrid = ({ quickStats, selectedSubject, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-50/50 dark:bg-slate-800/50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 dark:border-white/5 flex flex-col justify-center">
            <Shimmer variant="bar" className="w-16 mb-3" />
            <Shimmer variant="stats" className="w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!quickStats) return null;

  const cards = [
    { label: "Pool Size", value: `${quickStats.total} Tests`, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/10 dark:border-blue-500/10" },
    {
      label: selectedSubject === "All" ? "Global Acc." : "Focus Acc.",
      value: `${quickStats.accuracy}%`,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-500/10",
      trend: quickStats.lastChange
    },
    { 
      label: selectedSubject === "All" ? "Peak Performance" : "Avg Speed Index", 
      value: selectedSubject === "All" ? quickStats.best : `${quickStats.avgSpeed} m/m`, 
      color: "text-indigo-600 dark:text-indigo-400", 
      bg: "bg-indigo-50 dark:bg-indigo-900/10 dark:border-indigo-500/10" 
    },
    { label: "Avg Errors / Test", value: quickStats?.avgMistakes, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/10 dark:border-rose-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`${card.bg} p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-white dark:border-transparent shadow-sm flex flex-col justify-center relative overflow-hidden`}
        >
          <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">
            {card.label}
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className={`text-lg md:text-2xl font-black ${card.color} truncate`}>{card.value}</span>
            {card.trend !== undefined && card.trend !== 0 && (
              <span
                className={`text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 rounded-full w-fit ${
                  card.trend > 0 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
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
