import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  setTodos,
  addTodo,
  removeTodo,
  toggleTodo,
} from "../redux/slice/todoSlice";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const API_URL = "https://aspirant-arena-backend-production.up.railway.app";

const ToDo = () => {
  const dispatch = useDispatch();
  const todos = useSelector((state) => state.todo.todos);
  const user = useSelector((state) => state.user.currentUser);
  const loading = useSelector((state) => state.user.loading);
  const [task, setTask] = useState("");

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return; // Ensure token exists before making a request

      const res = await axios.get(`${API_URL}/api/todo`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      dispatch(setTodos(res.data));
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast.error("Failed to load tasks.");
    }
  };

  useEffect(() => {
    if (user) fetchTodos();
  }, [user]);

  const addTask = async () => {
    if (task.trim()) {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.post(
          `${API_URL}/api/todo`,
          { text: task },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        dispatch(addTodo(res.data));
        setTask(""); // Clear input field
        toast.success("Task added successfully!");
      } catch (error) {
        console.error("Error adding task:", error);
        toast.error("Failed to add task.");
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTask();
    }
  };

  const toggleTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.patch(
        `${API_URL}/api/todo/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch(toggleTodo(res.data));
      toast.success("Task status updated!");
    } catch (error) {
      console.error("Error toggling task:", error);
      toast.error("Failed to update task.");
    }
  };

  const removeTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.delete(`${API_URL}/api/todo/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      dispatch(removeTodo(id));
      toast.success("Task removed!");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          📝 To-Do List
        </h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={addTask}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Add
          </button>
        </div>
        {loading ? (
          <div className="text-center mt-4">Loading tasks...</div>
        ) : todos.length === 0 ? (
          <div className="text-center mt-4 text-gray-500">
            No tasks available!
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            <AnimatePresence>
              {todos.map((todo) => (
                <motion.li
                  key={todo._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between bg-gray-100 p-3 rounded-lg cursor-pointer transition"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTask(todo._id)}
                      className="cursor-pointer"
                    />
                    <span
                      className={`${
                        todo.completed
                          ? "line-through text-gray-500"
                          : "text-gray-700"
                      }`}
                    >
                      {todo.text}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTask(todo._id);
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    ❌
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
