import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import KanbanCard from "./KanbanCard";

const KanbanColumn = ({ id, title, tasks, icon }) => {
  const { setNodeRef } = useDroppable({
    id: id,
    data: { type: "column", id }
  });

  return (
    <div className="flex flex-col h-full bg-gray-50/50 dark:bg-slate-900/50 rounded-[1.5rem] border-2 border-transparent hover:border-gray-100 dark:hover:border-white/5 transition-colors">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <span className="text-xl bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                {icon}
            </span>
            <div className="flex flex-col">
                <h3 className="font-black text-gray-800 dark:text-gray-100 text-sm uppercase tracking-wider">
                    {title}
                </h3>
                <span className="text-[10px] font-bold text-gray-400 mt-0.5">
                    {tasks.length} Tasks
                </span>
            </div>
        </div>
      </div>

      {/* Task List - Droppable Area */}
      <div 
        ref={setNodeRef} 
        className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[150px]"
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task._id} task={task} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
            <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                <span className="text-xs font-bold text-gray-300 dark:text-slate-700 uppercase tracking-widest">
                    Drop Here
                </span>
            </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
