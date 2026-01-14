import React, { useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

// 🌍 Setup Localizer
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const TaskCalendar = ({ tasks, onEdit }) => {
  // 🎨 Map Tasks to Events
  const events = useMemo(() => {
    return tasks
      .filter((t) => t.dueDate) // Only tasks with due dates
      .map((t) => {
        const date = new Date(t.dueDate);
        return {
          id: t._id,
          title: t.text,
          start: date,
          end: new Date(date.getTime() + 60 * 60 * 1000), // Default 1 hour duration
          resource: t,
        };
      });
  }, [tasks]);

  // 🖌️ Event Styler (Priority Based)
  const eventPropGetter = (event) => {
    const priority = event.resource.priority;
    let style = {
      border: "none",
      borderRadius: "6px",
      fontSize: "0.75rem",
      fontWeight: "bold",
      color: "white",
    };

    switch (priority) {
      case "high":
        style.backgroundColor = "#ef4444"; // red-500
        break;
      case "medium":
        style.backgroundColor = "#f59e0b"; // amber-500
        break;
      case "low":
        style.backgroundColor = "#10b981"; // emerald-500
        break;
      default:
        style.backgroundColor = "#6366f1"; // primary-500
    }

    return { style };
  };

  return (
    <div className="h-[600px] bg-white dark:bg-slate-900 ml-1 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
      <style>{`
        /* 🌑 Dark Mode Overrides for RBC */
        .dark .rbc-calendar { color: #e2e8f0; }
        .dark .rbc-off-range-bg { bg-color: #1e293b; }
        .dark .rbc-off-range { color: #475569; }
        .dark .rbc-header { border-bottom: 1px solid #334155; }
        .dark .rbc-month-view, .dark .rbc-time-view, .dark .rbc-agenda-view { border: 1px solid #334155; }
        .dark .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #334155; }
        .dark .rbc-month-row + .rbc-month-row { border-top: 1px solid #334155; }
        .dark .rbc-today { background-color: rgba(99, 102, 241, 0.1); }
        .dark .rbc-btn-group button { color: #e2e8f0; }
        .dark .rbc-btn-group button:hover { bg-color: #334155; }
        .dark .rbc-btn-group .rbc-active { background-color: #334155; color: white; box-shadow: none;}
        .dark .rbc-time-content { border-top: 1px solid #334155; }
        .dark .rbc-timeslot-group { border-bottom: 1px solid #334155; }
        .dark .rbc-day-slot .rbc-time-slot { border-top: 1px solid #334155; }
        
        /* General Polish */
        .rbc-event { box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .rbc-toolbar-label { font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; font-size: 1.1rem; }
        .rbc-header { padding: 10px 0; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; color: #94a3b8; }
        .rbc-btn-group button { border: none !important; background: transparent; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; padding: 6px 12px; border-radius: 8px !important; margin: 0 2px; }
        .rbc-btn-group button:hover { background-color: #f1f5f9; }
        .rbc-btn-group .rbc-active { background-color: #0f172a; color: white; }
      `}</style>
      
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        eventPropGetter={eventPropGetter}
        onSelectEvent={(event) => onEdit && onEdit(event.resource)}
        views={["month", "week", "day"]}
        defaultView="month"
      />
    </div>
  );
};

export default TaskCalendar;
