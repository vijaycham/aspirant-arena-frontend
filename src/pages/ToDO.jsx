import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../utils/api";
import {
  setTodos,
  addTodo,
  removeTodo,
  toggleTodo,
} from "../redux/slice/todoSlice";
import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const ToDo = () => {
  const dispatch = useDispatch();
  const todos = useSelector((state) => state.todo.todos || []);
  const user = useSelector((state) => state.user.currentUser);
  const loading = useSelector((state) => state.user.loading);
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const fetchTodos = useCallback(async () => {
    try {
      const res = await api.get("/todo");
      // res is { status: "success", results: ..., data: { todos: [...] } }
      if (res.data && res.data.todos && Array.isArray(res.data.todos)) {
        dispatch(setTodos(res.data.todos));
      } else {
        console.error("Unexpected API response:", res);
        dispatch(setTodos([]));
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error(error.response?.data?.message || "Failed to load tasks.");
    }
  }, [dispatch]);

  useEffect(() => {
    if (user && !loading) {
      fetchTodos();
    }
  }, [user, loading, fetchTodos]);

  const addTask = async () => {
    const trimmedTask = task.trim();
    if (!trimmedTask) return;
    try {
      const res = await api.post("/todo", {
        text: trimmedTask,
        priority,
        dueDate: dueDate || undefined,
      });
      // backend returns { status: "success", data: { todo: ... } }
      dispatch(addTodo(res.data.todo));
      setTask("");
      setPriority("medium");
      setDueDate("");
      toast.success("Task added successfully!");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error(error.response?.data?.message || "Failed to add task.");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTask();
    }
  };

  const toggleTask = async (id, currentStatus) => {
    try {
      const res = await api.patch(`/todo/${id}`, {
        completed: !currentStatus,
      });
      // backend returns { status: "success", data: { todo: ... } }
      dispatch(toggleTodo(res.data.todo));
      toast.success("Task status updated!");
    } catch (error) {
      console.error("Error toggling task:", error);
      toast.error(error.response?.data?.message || "Failed to update task.");
    }
  };

  const removeTask = async (id) => {
    try {
      await api.delete(`/todo/${id}`);
      dispatch(removeTodo(id));
      toast.success("Task removed!");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error(error.response?.data?.message || "Failed to delete task.");
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case "high":
        return "text-red-500 bg-red-50 border-red-100";
      case "medium":
        return "text-amber-500 bg-amber-50 border-amber-100";
      case "low":
        return "text-green-500 bg-green-50 border-green-100";
      default:
        return "text-gray-500 bg-gray-50 border-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-20 px-4 sm:px-6 lg:px-8 font-outfit relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary-200/20 blur-3xl opacity-60 mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-rose-200/20 blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto space-y-8 pb-20">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter flex items-center justify-center md:justify-start gap-4 uppercase">
            Your <span className="text-primary-600 italic">Aspirations</span> 🚀
          </h1>
          <p className="text-gray-500 font-bold text-xs md:text-sm mt-2 uppercase tracking-widest opacity-70">
            Strategic task management for high-performance prep
          </p>
        </div>

        {/* Input Area */}
        <div className="glass-card p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-white">
          <div className="flex flex-col gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Task Description</label>
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={handleKeyDown}
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

              <button
                onClick={addTask}
                className="w-full md:w-auto px-10 py-3.5 bg-gray-900 text-white font-black rounded-2xl hover:bg-black hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-gray-200 uppercase tracking-widest text-xs"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Roadmap</h3>
             <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full uppercase italic">
               {todos.length} Focus Points
             </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
               <div className="w-12 h-12 border-4 border-gray-100 border-t-primary-600 rounded-full animate-spin"></div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Synchronizing Workspace...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-20 px-8 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
              <span className="text-4xl">🏝️</span>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Your agenda is clear. Ready for deep work?</p>
            </div>
          ) : (
            <ul className="space-y-3 md:space-y-4">
              <AnimatePresence initial={false}>
                {todos.map((todo) => (
                  <motion.li
                    key={todo._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex items-center justify-between p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 transition-all group ${
                      todo.completed 
                        ? "bg-gray-50/50 border-transparent opacity-60" 
                        : "bg-white border-white shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:border-primary-100"
                    }`}
                  >
                    <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTask(todo._id, todo.completed)}
                          className="w-6 h-6 rounded-lg border-2 border-gray-200 text-primary-600 focus:ring-primary-500 cursor-pointer transition-all peer opacity-0 absolute z-10"
                        />
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          todo.completed ? "bg-primary-600 border-primary-600" : "bg-white border-gray-200 peer-hover:border-primary-300"
                        }`}>
                          {todo.completed && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1 min-w-0">
                        <span
                          className={`text-sm md:text-base transition-all truncate ${
                            todo.completed ? "line-through text-gray-400" : "text-gray-900 font-black tracking-tight"
                          }`}
                        >
                          {todo.text}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className={`text-[8px] uppercase font-black px-2.5 py-1 rounded-[0.75rem] border-2 shadow-sm ${getPriorityColor(todo.priority)}`}>
                            {todo.priority}
                          </span>
                          {todo.dueDate && (
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                              <span className="text-xs opacity-50">📅</span> {new Date(todo.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeTask(todo._id)}
                      className="ml-4 p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all group-hover:opacity-100 opacity-0 lg:opacity-30"
                      title="Archive task"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToDo;
