import { motion, AnimatePresence } from "framer-motion";

// Custom Hook
import { useTasks } from "../hooks/useTasks";

// Sub-components
import ConfirmationModal from "../components/tasks/ConfirmationModal";
import TaskInput from "../components/tasks/TaskInput";
import TaskItem from "../components/tasks/TaskItem";

// Utils
import { getPriorityColor } from "../utils/tasks/taskHelpers";
import LockedOverlay from "../components/LockedOverlay";
import { useSelector } from "react-redux";
import { hasAccess } from "../utils/auth/verifyHelpers";

const Tasks = () => {
  const { currentUser: user } = useSelector((state) => state.user);
  const {
    tasks,
    archivedTasks,
    loading,
    task,
    setTask,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    editingTask,
    showArchived,
    setShowArchived,
    showDeleteModal,
    setShowDeleteModal,
    addTask,
    startEditing,
    cancelEditing,
    handleKeyDown,
    toggleTask,
    removeTask,
    confirmClearArchive,
    clearAllArchived,
    selectedArenaId,
    setSelectedArenaId,
    selectedNodeId,
    setSelectedNodeId,
    sortedTasks,
  } = useTasks();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200 flex flex-col pt-20 px-4 sm:px-6 lg:px-8 font-outfit relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary-200/20 dark:bg-primary-900/10 blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
        <div className="absolute top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-rose-200/20 dark:bg-rose-900/10 blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto space-y-8 pb-20">
        
        {/* 🔒 Full Page Lock ONLY if grace period EXPIRED and unverified */}
        {user && !hasAccess(user) && (
          <div className="fixed inset-0 z-[100] mt-16 backdrop-blur-md flex items-center justify-center p-6">
             <div className="bg-white/80 p-10 rounded-[3rem] shadow-2xl border border-white max-w-md w-full relative">
                <LockedOverlay message="Grace period expired. Strategic task management is now locked. Please verify your email to continue organizing your preparation journey." />
                {/* Add a spacer so the overlay content is visible since LockedOverlay is absolute */}
                <div className="h-[300px]"></div>
             </div>
          </div>
        )}
        
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center justify-center md:justify-start gap-4 uppercase transition-colors duration-200">
            Your <span className="text-primary-600 italic">Aspirations</span> 🚀
          </h1>
          <p className="text-gray-500 font-bold text-xs md:text-sm mt-2 uppercase tracking-widest opacity-70">
            Strategic task management for high-performance prep
          </p>
        </div>

        <TaskInput
          task={task}
          setTask={setTask}
          priority={priority}
          setPriority={setPriority}
          dueDate={dueDate}
          setDueDate={setDueDate}
          onAdd={addTask}
          onCancel={cancelEditing}
          isEditing={!!editingTask}
          onKeyDown={handleKeyDown}
          selectedArenaId={selectedArenaId}
          setSelectedArenaId={setSelectedArenaId}
          selectedNodeId={selectedNodeId}
          setSelectedNodeId={setSelectedNodeId}
        />

        {/* List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Roadmap</h3>
             <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full uppercase italic">
               {tasks.length} Focus Points
             </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
               <div className="w-12 h-12 border-4 border-gray-100 border-t-primary-600 rounded-full animate-spin"></div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Synchronizing Workspace...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 px-8 bg-white/50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center gap-4">
               <span className="text-4xl">🏝️</span>
               <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Your agenda is clear. Ready for deep work?</p>
            </div>
          ) : (
            <ul className="space-y-3 md:space-y-4">
              <AnimatePresence initial={false}>
                {sortedTasks.map((taskItem) => (
                  <TaskItem
                    key={taskItem._id}
                    taskItem={taskItem}
                    onToggle={toggleTask}
                    onEdit={startEditing}
                    onRemove={removeTask}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* Archived Section */}
        {archivedTasks.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
              >
                {showArchived ? "▼" : "▶"} Archived Tasks ({archivedTasks.length})
              </button>
              
              {showArchived && (
                <button
                  onClick={clearAllArchived}
                  className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-lg transition-all"
                >
                  Clear Archive
                </button>
              )}
            </div>
            
            <AnimatePresence>
              {showArchived && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  {archivedTasks.map((taskItem) => (
                    <li
                      key={taskItem._id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-slate-800/50 border border-transparent opacity-60"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-emerald-500 italic">✓</span>
                        <span className="text-sm text-gray-500 line-through font-medium">{taskItem.text}</span>
                      </div>
                      <button
                        onClick={() => toggleTask(taskItem._id, true)}
                        className="text-[10px] font-black text-primary-600 hover:underline uppercase tracking-widest"
                      >
                        Restore
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmClearArchive}
        title="Arena Cleanup"
        message="Are you sure you want to permanently delete all archived tasks? This action cannot be undone."
        confirmText="Yes, Clear Everything"
      />
    </div>
  );
};

export default Tasks;
