import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";

const KanbanBoard = ({ tasks, onToggleTask }) => {
  // Split tasks into columns
  const [columns, setColumns] = useState({
    todo: [],
    done: []
  });

  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    // Sync with props
    setColumns({
        todo: tasks.filter(t => !t.completed),
        done: tasks.filter(t => t.completed)
    });
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // 5px movement to start drag
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t._id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    // Find source and diff
    const activeId = active.id;
    const overId = over.id; // Could be column ID or task ID

    // Identify target type
    const isOverColumn = overId === "todo" || overId === "done";
    const overTask = tasks.find(t => t._id === overId);
    
    let targetColumn = null;
    if (isOverColumn) targetColumn = overId;
    else if (overTask) targetColumn = overTask.completed ? "done" : "todo";

    if (!targetColumn) return;

    // Check if status changed
    const task = tasks.find(t => t._id === activeId);
    if (!task) return;

    const currentColumn = task.completed ? "done" : "todo";

    if (currentColumn !== targetColumn) {
        // Status Changed! Trigger toggle
        onToggleTask(activeId, task.completed);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[500px]">
        <KanbanColumn 
            id="todo" 
            title="To Do" 
            tasks={columns.todo} 
            icon="📝"
        />
        <KanbanColumn 
            id="done" 
            title="Completed" 
            tasks={columns.done} 
            icon="✅" 
        />
      </div>

      {createPortal(
        <DragOverlay>
          {activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default KanbanBoard;
