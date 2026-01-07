import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlay,
  FaPause,
  FaUndo,
  FaStepForward,
  FaCoffee,
  FaBrain,
  FaSyncAlt,
  FaCalendarDay,
  FaEdit,
  FaTasks,
} from "react-icons/fa";
import { useTimer } from "../hooks/useTimer";
import { useTasks } from "../hooks/useTasks";

const Timer = () => {
  const {
    mode,
    setMode: switchMode,
    timeLeft,
    isActive,
    toggleTimer,
    resetTimer,
    resetCycle,
    resetDay,
    skipTimer,
    applyPreset,
    setManualTime,
    sessionsCompleted,
    totalMinutesToday,
    cycleNumber,
    subject,
    setSubject,
    selectedTaskId,
    setSelectedTaskId,
    modes,
  } = useTimer();

  const { tasks = [] } = useTasks() || {};
  const [isEditing, setIsEditing] = useState(false);
  const [manualMin, setManualMin] = useState("");
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);

  /* ------------------ FORMATTERS ------------------ */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTotalTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const mins = parseInt(manualMin);
    if (mins > 0 && mins <= 300) {
      setManualTime(mins);
      setIsEditing(false);
      setManualMin("");
    }
  };

  /* ------------------ PRESETS ------------------ */
  const upscPresets = [
    { name: "Mains Sprint", focus: 90, short: 15, long: 30, icon: "✍️" },
    { name: "Prelims Mock", focus: 120, short: 20, long: 40, icon: "📝" },
    { name: "Answer Writing", focus: 30, short: 5, long: 15, icon: "⏱️" },
    { name: "Standard Pomo", focus: 25, short: 5, long: 15, icon: "🍅" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 font-outfit relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 mix-blend-multiply animate-blob transition-colors duration-1000 ${
            mode === "FOCUS" ? "bg-primary-300" : mode === "SHORT_BREAK" ? "bg-emerald-300" : "bg-indigo-300"
          }`}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-6 text-gray-900">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">
              Focus <span className="text-primary-600 italic">Arena</span> 🎯
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetCycle}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm active:scale-95"
            >
              <FaSyncAlt /> Cycle
            </button>

            <button
              onClick={resetDay}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm active:scale-95"
            >
              <FaCalendarDay /> Day
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Content (Left) */}
          <div className="lg:col-span-8">
            {/* Timer Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 md:p-12 rounded-[2.5rem] shadow-xl border border-white/60 text-center relative overflow-hidden h-full flex flex-col justify-center min-h-[500px]"
            >
              <div className="inline-flex p-1 bg-gray-100/50 backdrop-blur-md rounded-xl mb-12 self-center">
                {Object.entries(modes || {}).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => switchMode(key)}
                    className={`px-6 md:px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                      mode === key ? "bg-white text-gray-900 shadow-sm scale-105" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {value.label}
                  </button>
                ))}
              </div>

              <div className="relative mb-10">
                <AnimatePresence mode="wait">
                  {!isEditing ? (
                    <motion.div
                      key="timer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group cursor-pointer relative inline-block"
                      onClick={() => setIsEditing(true)}
                    >
                      <h1 className="text-7xl md:text-9xl font-black text-gray-900 tracking-tighter leading-none">
                        {formatTime(timeLeft)}
                      </h1>
                      <div className="absolute -top-4 -right-8 opacity-0 group-hover:opacity-100 transition-opacity text-primary-500">
                        <FaEdit size={18} />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="edit"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      onSubmit={handleManualSubmit}
                      className="flex flex-col items-center gap-2"
                    >
                      <input 
                        autoFocus
                        type="number"
                        placeholder="Mins"
                        value={manualMin}
                        onChange={(e) => setManualMin(e.target.value)}
                        className="text-6xl font-black w-40 text-center bg-transparent border-b-4 border-primary-500 outline-none"
                      />
                      <div className="flex gap-4 mt-4">
                        <button type="submit" className="text-xs font-black uppercase text-primary-600">Save</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="text-xs font-black uppercase text-gray-400">Cancel</button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
                
                <div className="mt-8 flex flex-col items-center gap-2">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <div
                        key={num}
                        className={`h-2 w-10 rounded-full transition-all duration-500 ${
                          num < cycleNumber ? "bg-primary-600 shadow-sm" : num === cycleNumber && isActive ? "bg-primary-400 animate-pulse" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="max-w-md mx-auto mb-10 w-full relative">
                <div className="flex gap-2 mb-2 px-2 items-center justify-between">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Focus Mission</label>
                  {tasks?.length > 0 && (
                    <button 
                      onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                      className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                      <FaTasks size={10} /> {selectedTaskId ? "Change Task" : "Choose Task"}
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Focus Mission... (e.g. Laxmikanth Polity)"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setSelectedTaskId(""); 
                    }}
                    className="w-full bg-gray-50/50 border-2 border-transparent focus:border-primary-100 focus:bg-white px-6 py-4 rounded-2xl outline-none text-center font-bold text-gray-700 transition-all placeholder:text-gray-300 text-base shadow-inner"
                  />
                  
                  {/* Task Dropdown Menu */}
                  <AnimatePresence>
                    {showTaskDropdown && (
                      <div className="contents">
                        <div 
                          className="fixed inset-0 z-40 bg-black/5" 
                          onClick={() => setShowTaskDropdown(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-full left-0 right-0 mb-4 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-2xl z-50 max-h-[300px] overflow-y-auto overflow-x-hidden p-3"
                        >
                          <div className="p-2 border-b border-gray-50 mb-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Your Active Tasks</p>
                          </div>
                          {(tasks || []).map((t) => (
                            <button
                              key={t._id}
                              onClick={() => {
                                setSubject(t.text);
                                setSelectedTaskId(t._id);
                                setShowTaskDropdown(false);
                              }}
                              className="w-full text-left p-4 hover:bg-gray-50 rounded-2xl transition-all group flex items-start gap-3"
                            >
                              <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                t.priority === 'high' ? 'bg-rose-500' : 
                                t.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              <span className="text-sm font-bold text-gray-700 group-hover:text-primary-600 truncate">{t.text}</span>
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              setSelectedTaskId("");
                              setSubject("");
                              setShowTaskDropdown(false);
                            }}
                            className="w-full text-center p-3 mt-2 text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            Clear Mission
                          </button>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center justify-center gap-8">
                <button
                  onClick={resetTimer}
                  className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all active:scale-95 shadow-sm"
                >
                  <FaUndo className="text-xl" />
                </button>

                <button
                  onClick={toggleTimer}
                  className={`w-24 h-24 flex items-center justify-center rounded-[2.5rem] shadow-xl transition-all active:scale-90 ${
                    isActive ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-300/50"
                  }`}
                >
                  {isActive ? <FaPause className="text-3xl" /> : <FaPlay className="text-3xl ml-1" />}
                </button>

                <button
                  onClick={skipTimer}
                  className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all active:scale-95 shadow-sm"
                >
                  <FaStepForward className="text-xl" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Daily Intel */}
            <div className="glass-card p-8 rounded-[2rem] border border-white/60 shadow-lg relative overflow-hidden">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Daily Intel</h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                    <FaBrain size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Focus Today</p>
                    <p className="text-2xl font-black text-gray-900 tracking-tight">{formatTotalTime(totalMinutesToday)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <FaCoffee size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Sessions</p>
                    <p className="text-2xl font-black text-gray-900 tracking-tight">{sessionsCompleted}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-3">
              <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Quick Strategy</h3>
              <div className="grid grid-cols-2 gap-3">
                {upscPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset.name, preset.focus, preset.short, preset.long)}
                    className="glass-card hover:bg-white p-4 rounded-2xl border border-white/60 text-left transition-all hover:shadow-md active:scale-95 group"
                  >
                    <span className="text-xl mb-1 block group-hover:scale-110 transition-transform">{preset.icon}</span>
                    <h4 className="text-[8px] font-black uppercase text-gray-400 mb-0.5 tracking-tight group-hover:text-primary-600">{preset.name}</h4>
                    <p className="text-xs font-black text-gray-900">{preset.focus}m / {preset.short}m</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Wisdom Quote */}
            <div className="bg-gray-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group border border-gray-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
              <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-4 italic">Aspirant Wisdom</p>
              <p className="text-sm font-medium leading-relaxed italic opacity-85 group-hover:opacity-100 transition-opacity">
                “The secret of getting ahead is getting started.”
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;
