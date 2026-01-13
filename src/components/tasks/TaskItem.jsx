import { motion } from "framer-motion";
import { FiTarget } from "react-icons/fi";

const TaskItem = ({ 
  taskItem, 
  onToggle, 
  onEdit, 
  onRemove, 
  getPriorityColor 
}) => {
  return (
    <motion.li
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`flex items-center justify-between p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 transition-colors group ${
        taskItem.completed 
          ? "bg-gray-50/50 dark:bg-slate-800/50 border-transparent opacity-60" 
          : "bg-white dark:bg-slate-900 border-white dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/50 hover:border-primary-100 dark:hover:border-primary-900"
      }`}
    >
      <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            checked={taskItem.completed}
            onChange={() => onToggle(taskItem._id, taskItem.completed)}
            className="w-6 h-6 rounded-lg border-2 border-gray-200 text-primary-600 focus:ring-primary-500 cursor-pointer transition-colors peer opacity-0 absolute z-10"
          />
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
            taskItem.completed ? "bg-primary-600 border-primary-600" : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 peer-hover:border-primary-300"
          }`}>
            {taskItem.completed && (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-1 min-w-0">
          <span
            className={`text-sm md:text-base transition-colors truncate ${
              taskItem.completed ? "line-through text-gray-400" : "text-gray-900 dark:text-gray-200 font-black tracking-tight"
            }`}
          >
            {taskItem.text}
          </span>
          <div className="flex items-center gap-3">
            <span className={`text-[8px] uppercase font-black px-2.5 py-1 rounded-[0.75rem] border-2 shadow-sm ${getPriorityColor(taskItem.priority)}`}>
              {taskItem.priority}
            </span>
            {taskItem.dueDate && (
              <span className="text-[9px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="text-xs opacity-70">📅</span> {new Date(taskItem.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
            {taskItem.nodeId && (
              <span className="text-[8px] font-black text-primary-400 dark:text-primary-300 uppercase tracking-widest flex items-center gap-1 bg-primary-50/50 dark:bg-primary-900/30 px-2 py-0.5 rounded-lg border border-primary-100/30 dark:border-primary-700/30">
                <FiTarget size={10} className="animate-pulse" /> Linked to Roadmap
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {!taskItem.completed && (
          <button
            onClick={() => onEdit(taskItem)}
            className="p-3 text-gray-300 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-colors opacity-0 group-hover:opacity-100"
            title="Edit task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onRemove(taskItem._id)}
          className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-colors opacity-0 group-hover:opacity-100"
          title="Delete task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </motion.li>
  );
};

export default TaskItem;
