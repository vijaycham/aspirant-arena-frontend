import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiClock } from "react-icons/fi";

// Helper for priority colors
const getPriorityColor = (p) => {
  switch (p) {
    case "high": return "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30";
    case "medium": return "text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30";
    case "low": return "text-green-500 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30";
    default: return "text-gray-500 bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700";
  }
};

const KanbanCard = ({ task, isOverlay = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task._id,
    data: { type: "task", task }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="opacity-30 bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl h-[100px] w-full"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 
        hover:shadow-md dark:hover:shadow-black/40 transition-all cursor-grab active:cursor-grabbing group
        ${isOverlay ? "scale-105 shadow-xl rotate-2 ring-2 ring-primary-500 z-50" : ""}
      `}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-lg border ${getPriorityColor(task.priority)}`}>
          {task.priority || "Normal"}
        </span>
      </div>

      <p className="font-bold text-gray-700 dark:text-gray-200 text-sm mb-3 line-clamp-3">
        {task.text}
      </p>

      {task.dueDate && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
          <FiClock className="text-gray-300" />
          <span>
            {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            {task.dueDate.includes("T") && (
               <span className="opacity-60 ml-1 font-normal">
                 {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default KanbanCard;
