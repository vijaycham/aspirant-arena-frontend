import React from "react";
import { FiList, FiLayout, FiCalendar, FiClock, FiGrid } from "react-icons/fi";

const SmartToolbar = ({
  viewMode,
  setViewMode,
  timeFilter,
  setTimeFilter,
  activeTaskCount,
}) => {
  const filters = [
    { id: "all", label: "All Tasks", icon: <FiGrid /> },
    { id: "today", label: "Today", icon: <FiClock /> },
    { id: "upcoming", label: "Upcoming", icon: <FiCalendar /> },
  ];

  const views = [
    { id: "list", label: "List", icon: <FiList /> },
    { id: "board", label: "Board", icon: <FiLayout /> },
    { id: "calendar", label: "Calendar", icon: <FiCalendar /> },
  ];

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 mb-6 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
      
      {/* 🟢 Left: Time Filters */}
      <div className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-slate-800 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setTimeFilter(f.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
              timeFilter === f.id
                ? "bg-white dark:bg-primary-600 text-primary-600 dark:text-white shadow-sm scale-105"
                : "text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-gray-100/50 dark:hover:bg-slate-800"
            }`}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {/* 🔵 Right: View Switcher */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
        
        {/* Active Count Badge */}
        <div className="hidden md:flex items-center gap-2 px-4">
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
             {activeTaskCount} Active
           </span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-slate-800 rounded-2xl">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id)}
              className={`p-3 rounded-xl transition-all duration-200 ${
                viewMode === v.id
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-gray-200 dark:shadow-none scale-105"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-slate-700/50"
              }`}
              title={`${v.label} View`}
            >
              {v.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartToolbar;
