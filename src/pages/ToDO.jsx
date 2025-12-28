import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../utils/api";
import {
  setTodos,
  addTodo,
  removeTodo,
  toggleTodo,
} from "../redux/slice/todoSlice";
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

  const fetchTodos = async () => {
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
  };

  useEffect(() => {
    if (user && !loading) {
      fetchTodos();
    }
  }, [user, loading]);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-2xl border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 flex items-center justify-center gap-3">
          <span className="text-4xl">📝</span> Your Aspirations
        </h1>

        <div className="flex flex-col gap-4 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What needs to be done?"
              className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Priority:</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="p-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Due Date:</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="p-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>

            <button
              onClick={addTask}
              className="ml-auto bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 font-semibold"
            >
              Add Task
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
             <p className="text-gray-500 animate-pulse">Loading your tasks...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-12 px-6 border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-gray-400 text-lg">No tasks yet. Start by adding one above!</p>
          </div>
        ) : (
          <ul className="space-y-4">
            <AnimatePresence initial={false}>
              {todos.map((todo) => (
                <motion.li
                  key={todo._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:shadow-md ${
                    todo.completed ? "bg-gray-50 border-gray-100" : "bg-white border-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTask(todo._id, todo.completed)}
                      className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex flex-col gap-1">
                      <span
                        className={`text-lg transition-all ${
                          todo.completed ? "line-through text-gray-400" : "text-gray-700 font-medium"
                        }`}
                      >
                        {todo.text}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(todo.priority)}`}>
                          {todo.priority}
                        </span>
                        {todo.dueDate && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            📅 {new Date(todo.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeTask(todo._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete task"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
};

export default ToDo;
