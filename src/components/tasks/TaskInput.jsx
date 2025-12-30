const TaskInput = ({ 
  task, 
  setTask, 
  priority, 
  setPriority, 
  dueDate, 
  setDueDate, 
  onAdd, 
  onCancel, 
  isEditing, 
  onKeyDown 
}) => {
  return (
    <div className="glass-card p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-white">
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Task Description</label>
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="What needs to be done?"
            className="w-full p-4 bg-gray-50/50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300 shadow-sm"
          />
        </div>
        
        <div className="flex flex-col md:flex-row items-end gap-6">
          <div className="grid grid-cols-2 gap-4 flex-1 w-full">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-3 bg-gray-50/50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-gray-700 text-sm appearance-none shadow-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-3 bg-gray-50/50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-gray-700 text-sm shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={onAdd}
              className="px-10 py-3.5 bg-gray-900 text-white font-black rounded-2xl hover:bg-black hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-gray-200 uppercase tracking-widest text-xs"
            >
              {isEditing ? "Update Task" : "Add Task"}
            </button>
            {isEditing && (
              <button
                onClick={onCancel}
                className="px-10 py-3.5 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskInput;
