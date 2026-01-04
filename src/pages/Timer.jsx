import { FaClock } from "react-icons/fa";
import { motion } from "framer-motion";

const Timer = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-outfit relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[25%] w-[40%] h-[40%] rounded-full bg-rose-200/20 blur-[120px] opacity-60 mix-blend-multiply animate-blob"></div>
        <div className="absolute bottom-[20%] left-[25%] w-[40%] h-[40%] rounded-full bg-orange-200/20 blur-[120px] opacity-60 mix-blend-multiply animate-blob animation-delay-2000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-lg w-full bg-white/80 backdrop-blur-2xl shadow-2xl rounded-[3rem] p-10 md:p-16 text-center border border-white/60"
      >
        <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-rose-500/10">
          <FaClock className="text-4xl text-rose-600 animate-pulse" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tighter uppercase">
          Focus <span className="text-rose-600 italic">Timer</span> ⏳
        </h1>
        
        <div className="inline-flex items-center gap-2 bg-rose-950 px-4 py-1.5 rounded-full mb-6">
          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span className="text-[10px] font-black text-rose-100 uppercase tracking-widest">Deep Work Ready</span>
        </div>

        <p className="text-gray-500 font-medium leading-relaxed mb-10">
          The ultimate Pomodoro & Deep Work timer is coming your way. 
          Integrated with your task list to track focused hours spent on each subject.
        </p>

        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center gap-2">
                <span className="text-xl">🍅</span>
                <span className="text-[10px] font-black uppercase text-gray-400">Pomodoro</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center gap-2">
                <span className="text-xl">📊</span>
                <span className="text-[10px] font-black uppercase text-gray-400">Time Stats</span>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Timer;
