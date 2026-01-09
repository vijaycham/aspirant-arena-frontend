import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { FaFire, FaExclamationTriangle } from 'react-icons/fa';

const DAYS_TO_SHOW = 365;
const CELL_SIZE = 12;
const GAP_SIZE = 3;
const COL_WIDTH = CELL_SIZE + GAP_SIZE;

// Configurable Color Buckets (Adjusted for "Easy Wins" & "High Intensity")
const COLOR_BUCKETS = [
  { max: 0, cls: "bg-gray-100/50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-700" },
  { max: 15, cls: "bg-emerald-200 border-emerald-300" }, // Started (<15m)
  { max: 45, cls: "bg-emerald-300 border-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.4)]" }, // Warming up (<45m)
  { max: 90, cls: "bg-emerald-400 border-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]" }, // Solid session (<1.5h)
  { max: 180, cls: "bg-emerald-500 border-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.6)]" }, // Deep Work (<3h)
  { max: Infinity, cls: "bg-emerald-600 border-emerald-700 shadow-[0_0_15px_rgba(5,150,105,0.8)] ring-1 ring-emerald-400/50" }, // Mastery (>3h)
];

const getColor = (minutes) => {
  return COLOR_BUCKETS.find(b => minutes <= b.max)?.cls || COLOR_BUCKETS[0].cls;
};

const FocusHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [totalYearlyMinutes, setTotalYearlyMinutes] = useState(0);
  const scrollContainerRef = useRef(null);

  // State for "Lifted" Tooltip (Renders outside overflow container)
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, align: 'center' });
  const wrapperRef = useRef(null);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const tzOffset = new Date().getTimezoneOffset();
        const { data } = await api.get(`/focus/stats/heatmap?offset=${tzOffset}`);
        
        const dataMap = {};
        let total = 0;
        
        (data.heatmap || []).forEach(item => {
          dataMap[item._id] = item;
          total += item.minutes;
        });

        setHeatmapData(dataMap);
        setTotalYearlyMinutes(total);
      } catch (err) {
        console.error("Heatmap fetch failed", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmap();
  }, []);

  // Construct the array of 365 days
  const { days, months } = useMemo(() => {
    const today = new Date();
    const dayArray = [];
    const monthLabels = [];
    
    // Logic: Iterate backwards 365 days to build chronologically sorted list
    let currentMonth = -1;

    for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dateStr = date.toLocaleDateString("en-CA"); 
      const monthIndex = date.getMonth();

      const label = date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

      const data = heatmapData[dateStr] || { minutes: 0, count: 0 };
      
      dayArray.push({
        date: dateStr,
        dayOfWeek: date.getDay(), // 0=Sun, 6=Sat
        label,
        ...data
      });
    }
    
    // Second pass for months: simpler to just check every 28 days or change of month
    dayArray.forEach((day, index) => {
      const d = new Date(day.date);
      // If it's the first week of the month (approx), add a label
      if (d.getDate() <= 7 && index % 7 === 0) {
         monthLabels.push({
           index: Math.floor(index / 7), // Column index
           label: d.toLocaleDateString(undefined, { month: 'short' })
         });
      }
    });

    const filteredMonths = monthLabels.filter((m, i, arr) => 
      i === 0 || m.label !== arr[i-1].label
    );

    return { days: dayArray, months: filteredMonths };
  }, [heatmapData]);

  // ✅ Auto-scroll to end on load
  useEffect(() => {
    if (scrollContainerRef.current && !loading) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [loading, days]);

  const handleMouseEnter = (e, day) => {
    if (!wrapperRef.current) return;
    
    const cellRect = e.currentTarget.getBoundingClientRect();
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    
    // Check if we are near the right edge to flip alignment
    const isNearRight = (cellRect.right - wrapperRect.left) > (wrapperRect.width - 120); 
    
    // Calculate position
    const x = isNearRight 
        ? cellRect.right - wrapperRect.left 
        : cellRect.left - wrapperRect.left + (cellRect.width / 2);

    // Clamped Y position (Prevent clipping at top)
    const rawY = cellRect.top - wrapperRect.top - 8;
    const y = Math.max(rawY, 40); // Keep at least 40px down from top edge of card

    const align = isNearRight ? 'right' : 'center';

    setTooltipPos({ x, y, align });
    setHoveredDay(day);
  };

  if (error) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center text-rose-400 gap-2 h-40">
        <FaExclamationTriangle size={20} />
        <span className="text-xs font-bold uppercase tracking-widest">Unable to load heatmap</span>
      </div>
    );
  }

  if (loading) return <div className="h-40 animate-pulse bg-gray-100/10 rounded-[2rem] border border-white/20" />;

  return (
    <div 
      ref={wrapperRef}
      className="glass-card p-6 md:p-8 rounded-[2rem] border border-white/60 shadow-lg relative group"
    >
       {/* Background Glow Container (Clipped) */}
       <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 blur-3xl rounded-full -mr-20 -mt-20 transition-opacity opacity-50 group-hover:opacity-100"></div>
       </div>

      <div className="flex items-center justify-between mb-2 relative z-10 px-1">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <FaFire size={14} />
            </div>
            <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Yearly Consistency</h3>
                <p className="text-sm font-black text-gray-900 tracking-tight">
                    {Math.round(totalYearlyMinutes / 60)}h Focused
                </p>
            </div>
        </div>
        
        {/* Legend */}
        <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-gray-400 uppercase mr-1">Less</span>
            {COLOR_BUCKETS.map((b, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-[2px] ${b.cls}`} />
            ))}
            <span className="text-[9px] font-bold text-gray-400 uppercase ml-1">More</span>
        </div>
      </div>



      {/* Heatmap Grid Container */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto pb-4 pt-4 scrollbar-hide relative z-10 -mx-2 px-2"
        style={{ scrollBehavior: 'smooth' }}
        onMouseLeave={() => setHoveredDay(null)}
      >
        <div className="relative min-w-max">
            <div className="flex relative h-5 mb-1 pointer-events-none">
                {months.map((m, i) => (
                   <span 
                     key={`${m.label}-${i}`}
                     style={{ left: `${m.index * COL_WIDTH}px` }}
                     className="absolute text-[9px] font-black text-gray-300 uppercase tracking-widest"
                   >
                     {m.label}
                   </span>
                ))}
            </div>

            <div 
                className="grid grid-rows-7 grid-flow-col gap-[3px]"
                role="grid"
                aria-label="Study activity calendar"
            >
                {/* Day of Week Labels (Left Side Sticky?) - optional, skipped for clean look currently */}
                
                {days.map((day) => (
                    <motion.div
                        key={day.date}
                        onMouseEnter={(e) => handleMouseEnter(e, day)}
                        onFocus={(e) => handleMouseEnter(e, day)}
                        onBlur={() => setHoveredDay(null)}
                        whileHover={{ scale: 1.25, zIndex: 10 }}
                        whileFocus={{ scale: 1.25, zIndex: 10 }}
                        className={`relative w-3 h-3 rounded-[3px] border transition-colors duration-300 cursor-pointer ${getColor(day.minutes)}`}
                        role="gridcell"
                        aria-label={`${itemLabel(day.minutes, day.label)}`}
                        tabIndex="0"
                    />
                ))}
            </div>
        </div>
      </div>

      {/* LIFTED TOOLTIP */}
      <AnimatePresence>
        {hoveredDay && (
           <div
             style={{ 
               left: tooltipPos.x, 
               top: tooltipPos.y,
             }}
             className={`absolute z-[100] pointer-events-none ${
                tooltipPos.align === 'right' ? '-translate-x-full -translate-y-full origin-bottom-right' : '-translate-x-1/2 -translate-y-full origin-bottom'
             }`}
           >
             <motion.div 
               key={hoveredDay.date}
               initial={{ opacity: 0, scale: 0.8, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.8, y: 10 }}
               transition={{ type: "spring", stiffness: 350, damping: 25 }}
               className="mb-1 w-32 bg-slate-900/95 backdrop-blur-xl border border-slate-800 p-2.5 rounded-xl text-center shadow-xl flex flex-col items-center"
             >
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-white/10 pb-1 mb-1 w-full truncate">
                    {hoveredDay.label}
                </p>
                <div className="flex flex-col gap-0.5 justify-center items-center">
                  <span className={`text-[12px] font-black ${hoveredDay.minutes > 0 ? "text-emerald-400" : "text-gray-500"}`}>
                    {hoveredDay.minutes} min
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">
                    {hoveredDay.count} sessions
                  </span>
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const itemLabel = (minutes, date) => `${minutes} minutes focused on ${date}`;

export default FocusHeatmap;
