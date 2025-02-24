import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to Aspirant Arena
        </h1>
        <p className="text-gray-600 mb-6">
          Your all-in-one productivity and study companion. Manage your tasks,
          track your progress, and stay focused on your goals.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/todo"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Go to To-Do List
          </Link>
          <Link
            to="/notes"
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
          >
            Notes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
