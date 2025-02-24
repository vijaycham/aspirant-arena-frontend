import React from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaLightbulb, FaClock } from "react-icons/fa";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-peach-100 flex flex-col items-center py-12 px-6 text-gray-800">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold text-peach-600 mb-4">
          About Aspirant Arena
        </h1>
        <p className="text-lg mb-6">
          Welcome to Aspirant Arena, your ultimate productivity companion
          designed to help you stay focused and organized on your journey to
          success.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl text-center mt-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <FaCheckCircle className="text-peach-500 text-4xl mx-auto mb-3" />
          <h2 className="text-xl font-semibold">Task Management</h2>
          <p className="text-sm mt-2">
            Organize your tasks effectively with our easy-to-use To-Do list.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <FaLightbulb className="text-peach-500 text-4xl mx-auto mb-3" />
          <h2 className="text-xl font-semibold">Future Enhancements</h2>
          <p className="text-sm mt-2">
            We're adding study planners, analytics, and more!
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <FaClock className="text-peach-500 text-4xl mx-auto mb-3" />
          <h2 className="text-xl font-semibold">Focus Tools</h2>
          <p className="text-sm mt-2">
            Stay productive with our built-in Pomodoro timer.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          to="/"
          className="bg-peach-500  px-6 py-2 rounded-lg shadow-md hover:bg-peach-600 transition"
        > Back to Home
        </Link>
      </div>
    </div>
  );
};

export default AboutUs;
