import React from "react";

const ToDo = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5ddd5] p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          📝 To-Do List
        </h1>
        <input
          type="text"
          placeholder="Add a new task..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button className="w-full bg-blue-500 text-white py-2 mt-4 rounded-lg hover:bg-blue-600 transition">
          Add Task
        </button>
        <ul className="mt-4 space-y-2">
          <li className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
            <span className="text-gray-700">Task 1</span>
            <button className="text-red-500 hover:text-red-600">❌</button>
          </li>
          <li className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
            <span className="text-gray-700">Task 2</span>
            <button className="text-red-500 hover:text-red-600">❌</button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ToDo;
