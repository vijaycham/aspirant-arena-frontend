import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary-200/30 blur-3xl opacity-60 mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary-200/30 blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-200/30 blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="bg-white/60 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12 border border-white/50">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
            Welcome to <br />
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Aspirant Arena
            </span>
          </h1>
          
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your all-in-one productivity workspace. Master your tasks, organize your thoughts, 
            and accelerate your growth with a focused environment designed for achievers.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/todo"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold shadow-xl shadow-primary-500/30 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Start Managing Tasks
            </Link>
            <Link
              to="/notes"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-gray-700 font-semibold border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:text-primary-600 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Take Notes
            </Link>
          </div>
        </div>

        {/* Feature Highlights (Optional Visuals) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
           {/* Card 1 */}
           <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm hover:bg-white/60 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-4 text-xl">
                ✨
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Stay Organized</h3>
              <p className="text-sm text-gray-600">Keep track of every deadline and detail in one place.</p>
           </div>
           {/* Card 2 */}
           <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm hover:bg-white/60 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 mb-4 text-xl">
                🚀
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Boost Productivity</h3>
              <p className="text-sm text-gray-600">Tools designed to help you focus and achieve more.</p>
           </div>
           {/* Card 3 */}
           <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm hover:bg-white/60 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 mb-4 text-xl">
                🎯
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Hit Your Goals</h3>
              <p className="text-sm text-gray-600">Visualize progress and celebrate your wins.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
