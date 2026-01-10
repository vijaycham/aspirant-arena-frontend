import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSyncAlt,
  FaCalendarDay,
  FaTasks,
  FaLightbulb,
  FaFire,
  FaVolumeUp,
  FaVolumeMute,
  FaCloudRain,
  FaMusic,
  FaWater,
  FaBell,
  FaBellSlash,
} from "react-icons/fa";
import { FiTarget } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { useTimer } from "../hooks/useTimer";
import { useTasks } from "../hooks/useTasks";
import { fetchArenas, fetchSyllabus } from "../redux/slice/arenaSlice";
import { UPSC_PRESETS, AMBIENT_SOUNDS } from "../utils/timer/timerConstants";
import TimerDisplay from "../components/timer/TimerDisplay";
import TimerControls from "../components/timer/TimerControls";
import FocusRhythm from "../components/timer/FocusRhythm";
import WisdomQuote from "../components/timer/WisdomQuote";
import DailyIntel from "../components/timer/DailyIntel";
import QuickStrategy from "../components/timer/QuickStrategy";
import TimerResetModal from "../components/timer/TimerResetModal";
import FocusRatingModal from "../components/timer/FocusRatingModal";
import FocusHeatmap from "../components/timer/FocusHeatmap";
import FullScreenTimer from "../components/timer/FullScreenTimer";

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
    selectedArenaId,
    setSelectedArenaId,
    selectedNodeId,
    setSelectedNodeId,
    modes,
    pendingSession,
    completeRating,
    setPendingSession,
    reflectionEnabled,
    setReflectionEnabled,
    todaySessions,
    effectiveMinutesToday,
    efficiencyScore,
    streak,
    ambientEnabled,
    setAmbientEnabled,
    ambientType,
    setAmbientType,
    volume,
    setVolume,
    notificationPermission,
    requestNotificationPermission,
    progress,
  } = useTimer();

  const { arenas, syllabus } = useSelector(state => state.arena);
  const dispatch = useDispatch();

  /* eslint-disable no-unused-vars */ // Temporarily ignore remaining unused vars if any
  const { tasks = [] } = useTasks() || {};
  const [isEditing, setIsEditing] = useState(false);
  const [manualMin, setManualMin] = useState("");
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = React.useState(typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);

  React.useEffect(() => {
    const handleResize = () => setIsMobileOrTablet(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (arenas.length === 0) {
      dispatch(fetchArenas());
    }
  }, [arenas.length, dispatch]);

  React.useEffect(() => {
    if (selectedArenaId && !syllabus[selectedArenaId]) {
      dispatch(fetchSyllabus(selectedArenaId));
    }
  }, [selectedArenaId, dispatch, syllabus]);

  // Prevent body scroll when in Zen Mode
  React.useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullScreen]);

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
    if (!manualMin) {
      setIsEditing(false);
      return;
    }
    const mins = parseInt(manualMin);
    if (mins > 0 && mins <= 300) {
      setManualTime(mins);
      setIsEditing(false);
      setManualMin("");
    } else {
      toast.error("Please enter 1-300 mins");
    }
  };

  /* ------------------ RENDER ------------------ */
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

          <div className="flex items-center gap-2">
            {/* Notification Control */}
            <div className="relative group/notify h-[34px]">
              <button
                onClick={requestNotificationPermission}
                className={`flex items-center justify-center w-[34px] h-full rounded-lg border transition-all shadow-sm active:scale-90 ${
                  notificationPermission === "granted" 
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                    : notificationPermission === "denied"
                    ? "bg-rose-50 border-rose-100 text-rose-600"
                    : "bg-white border-gray-200 text-gray-400 hover:text-primary-600 hover:border-primary-100"
                }`}
              >
                {notificationPermission === "denied" ? <FaBellSlash size={12} /> : <FaBell size={12} />}
              </button>
              
              <div className="absolute top-full right-0 mt-3 w-44 p-3 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl opacity-0 group-hover/notify:opacity-100 pointer-events-none transition-all z-[60] shadow-2xl text-center">
                <p className="text-[8px] font-black text-primary-400 uppercase tracking-widest mb-1">Notifications</p>
                <p className="text-[10px] font-black text-white uppercase tracking-tighter">
                  {notificationPermission === "granted" ? "Enabled! 🔔" : notificationPermission === "denied" ? "Blocked ❌" : "Click to Enable 🔔"}
                </p>
                {notificationPermission === "denied" && (
                  <p className="text-[8px] text-gray-400 mt-2 leading-tight uppercase font-bold px-1">
                    {isMobileOrTablet ? "Enable in Site/Phone Settings" : "Enable in Browser Address Bar"}
                  </p>
                )}
              </div>
            </div>

            {/* Streak Indicator */}
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 border border-orange-100 rounded-lg group/streak relative cursor-pointer mr-2 shadow-sm shadow-orange-100/50">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    filter: ["drop-shadow(0 0 2px #f97316)", "drop-shadow(0 0 8px #f97316)", "drop-shadow(0 0 2px #f97316)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FaFire className="text-orange-500 text-sm" />
                </motion.div>
                <span className="text-[10px] font-black text-orange-600 tabular-nums tracking-tight">{streak}</span>
                
                <div className="absolute top-full right-0 mt-3 w-40 p-3 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl opacity-0 group-hover/streak:opacity-100 pointer-events-none transition-all z-[60] shadow-2xl text-center">
                  <p className="text-[8px] font-black text-primary-400 uppercase tracking-widest mb-1">Consistency</p>
                  <p className="text-[10px] font-black text-white uppercase tracking-tighter tabular-nums">{streak} Day Streak! 🔥</p>
                </div>
              </div>
            )}

            <button
              onClick={resetCycle}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm active:scale-95 h-[34px]"
            >
              <FaSyncAlt /> Cycle
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm active:scale-95 h-[34px]"
            >
              <FaCalendarDay /> Day
            </button>

            <div className="relative group/reflect flex items-center h-[34px]">
              <button
                disabled={isActive}
                onClick={() => setReflectionEnabled(!reflectionEnabled)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 border rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 h-full ${
                  isActive 
                    ? "opacity-60 cursor-not-allowed bg-gray-50 border-gray-100 text-gray-400" 
                    : reflectionEnabled 
                      ? "bg-primary-50 border-primary-100 text-primary-600 hover:bg-primary-100" 
                      : "bg-white border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="relative flex items-center">
                  <FaLightbulb className={reflectionEnabled && !isActive ? "animate-pulse" : ""} />
                  <div className={`absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full ${reflectionEnabled ? "bg-emerald-500" : "bg-gray-300"}`} />
                </div>
                <span className="hidden xs:inline">Reflect</span>
              </button>

               {/* Info Tooltip - Dark Glass Style */}
              <div className="absolute top-full right-0 mt-3 w-60 p-4 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl opacity-0 group-hover/reflect:opacity-100 pointer-events-none transition-all z-[60] shadow-2xl">
                <p className={`uppercase tracking-[0.2em] text-[8px] font-black mb-2 ${isActive ? "text-rose-400" : "text-primary-400"}`}>
                  {isActive ? "⚠️ Reflection Locked" : "Self-Reflection"}
                </p>
                <p className="text-[10px] font-bold text-gray-300 leading-relaxed tracking-tight">
                  {isActive 
                    ? "You cannot change reflection settings while a session is active. Please pause or reset the timer to modify." 
                    : "When enabled, you'll be asked to rate your focus intensity and add notes after every focus session. Helps track quality, not just quantity."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Content (Left) */}
          <div className="lg:col-span-8">
            {/* Timer Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 md:p-12 rounded-[2.5rem] shadow-xl border border-white/60 text-center relative h-full flex flex-col justify-center min-h-[500px]"
            >
              <TimerDisplay 
                  mode={mode}
                  modes={modes}
                  switchMode={switchMode}
                  timeLeft={timeLeft}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  manualMin={manualMin}
                  setManualMin={setManualMin}
                   handleManualSubmit={handleManualSubmit}
                   formatTime={formatTime}
                   cycleNumber={cycleNumber}
                   isActive={isActive}
                   onFullScreen={() => {
                     setIsFullScreen(true);
                     if (document.documentElement.requestFullscreen) {
                       document.documentElement.requestFullscreen().catch(err => {
                         console.warn("Fullscreen request failed:", err);
                       });
                     }
                   }}
                  />

              {/* Focus Mission Input - Restored */}
              <div className="max-w-md mx-auto mb-10 w-full relative">
                <div className="flex gap-2 mb-2 px-2 items-center justify-between">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Focus Mission</label>
                  {tasks?.length > 0 ? (
                    <button 
                      onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                      className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 hover:bg-primary-50 px-2 py-1 rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <FaTasks className="text-primary-500" size={10} /> 
                      {selectedTaskId ? "Change Task" : "Choose Task"}
                    </button>
                  ) : (
                    <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest italic">No tasks active</span>
                  )}
                </div>

                <div className="relative group/input">
                  <div className="absolute inset-0 bg-primary-100/20 blur-xl rounded-full opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500"></div>
                  <input
                    type="text"
                    placeholder="Focus Mission... (e.g. Laxmikanth Polity)"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setSelectedTaskId(""); 
                      setSelectedNodeId("");
                    }}
                    className="relative w-full bg-white/40 backdrop-blur-md border border-white/60 focus:border-primary-300 focus:bg-white/60 px-6 py-4 rounded-2xl outline-none text-center font-bold text-gray-800 transition-all placeholder:text-gray-400 text-base shadow-sm hover:shadow-md focus:shadow-lg focus:scale-[1.02]"
                  />
                  
                  {/* Task Metadata Indicator (if linked to Syllabus) */}
                  {selectedNodeId && (
                    <div className="mt-4 flex justify-center">
                       <div className="px-4 py-2 rounded-xl bg-primary-50 border border-primary-100 text-[10px] font-black uppercase tracking-widest text-primary-600 transition-all flex items-center gap-2 shadow-sm">
                          <FiTarget size={12} className="animate-pulse" /> 
                          Linked to Roadmap
                        </div>
                    </div>
                  )}

                  {/* Task Dropdown Menu */}
                  <AnimatePresence>
                    {showTaskDropdown && (
                      <div className="contents">
                        <div 
                          className="fixed inset-0 z-40 bg-black/5 rounded-[2.5rem]" 
                          onClick={() => setShowTaskDropdown(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-full left-0 right-0 mb-4 bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-2xl z-[100] max-h-[250px] overflow-y-auto overflow-x-hidden p-5 ring-1 ring-black/5 scrollbar-hide"
                        >
                          <div className="p-2 border-b border-gray-100/50 mb-2">
                            <p className="text-[9px] font-black text-black uppercase tracking-widest">Select Active Mission</p>
                          </div>
                          <div className="space-y-1">
                            {(tasks || []).map((t) => (
                              <button
                                key={t._id}
                                onClick={() => {
                                  setSubject(t.text);
                                  setSelectedTaskId(t._id);
                                  setSelectedArenaId(t.arenaId || "");
                                  setSelectedNodeId(t.nodeId || "");
                                  setShowTaskDropdown(false); 
                                }}
                                className="w-full text-left p-4 hover:bg-white hover:shadow-sm rounded-xl transition-all group flex items-start gap-3 border border-transparent hover:border-white/50"
                              >
                                <div className="flex items-center gap-3 w-full">
                                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 shadow-sm ${
                                    t.priority === 'high' ? 'bg-rose-500 shadow-rose-200' : 
                                    t.priority === 'medium' ? 'bg-amber-500 shadow-amber-200' : 'bg-emerald-500 shadow-emerald-200'
                                  }`} />
                                  <span className="text-sm font-bold text-gray-700 group-hover:text-primary-600 truncate flex-1">{t.text}</span>
                                  {t.nodeId && <FiTarget className="text-primary-400 animate-pulse flex-shrink-0" size={14} />}
                                </div>
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedTaskId("");
                              setSelectedArenaId("");
                              setSelectedNodeId("");
                              setSubject("");
                              setShowTaskDropdown(false);
                            }}
                            className="w-full text-center p-3 mt-2 text-[10px] font-black uppercase text-rose-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-rose-100 rounded-xl transition-all"
                          >
                            Clear Mission
                          </button>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <TimerControls 
                isActive={isActive}
                onToggle={toggleTimer}
                onReset={resetTimer}
                onSkip={skipTimer}
              />

              {/* Focus Rhythm Chart - Improved alignment */}
              <FocusRhythm todaySessions={todaySessions} />
            </motion.div>

            
            <div className="mt-6">
              <FocusHeatmap />
            </div>
          </div>

            {/* Sidebar (Right) */}
            <div className="lg:col-span-4 space-y-6">
              <WisdomQuote />

              {/* Daily Intel */}
              <DailyIntel 
                totalMinutesToday={totalMinutesToday}
                effectiveMinutesToday={effectiveMinutesToday}
                efficiencyScore={efficiencyScore}
                sessionsCompleted={sessionsCompleted}
                formatTotalTime={formatTotalTime}
              />

              {/* Ambient Atmosphere */}
              <div className="glass-card p-6 rounded-[2rem] border border-white/60 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FaCloudRain className="text-primary-500" /> Ambient Focus
                  </h3>
                  <button 
                    onClick={() => setAmbientEnabled(!ambientEnabled)}
                    className={`w-10 h-[22px] rounded-full transition-all duration-300 relative ${ambientEnabled ? 'bg-primary-500' : 'bg-gray-200'} shadow-inner`}
                  >
                    <motion.div 
                      layout
                      animate={{ x: ambientEnabled ? 20 : 2 }}
                      initial={false}
                      className="absolute top-[2.5px] left-0 w-[17px] h-[17px] bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>

                <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide px-1">
                  {AMBIENT_SOUNDS.filter(s => s.id !== 'none').map(sound => (
                    <button
                      key={sound.id}
                      onClick={() => {
                        setAmbientType(sound.id);
                        if (!ambientEnabled) setAmbientEnabled(true);
                      }}
                      className={`flex-shrink-0 px-4 py-3 rounded-2xl border text-[9px] font-black uppercase tracking-tight transition-all flex items-center gap-2 relative overflow-hidden group/sbtn ${
                        ambientType === sound.id && ambientEnabled 
                          ? 'bg-primary-50/50 border-primary-200 text-primary-700 shadow-sm' 
                          : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600'
                      }`}
                    >
                      {ambientType === sound.id && ambientEnabled && (
                        <motion.div 
                          layoutId="activeSound"
                          className="absolute inset-0 bg-primary-100/20"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        {sound.id === 'rain' && <FaCloudRain size={10} />}
                        {sound.id === 'droplets' && <FaCloudRain size={10} />}
                        {sound.id === 'river' && <FaWater size={10} />}
                        {sound.id === 'lofi' && <FaMusic size={10} />}
                        {sound.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 px-1">
                  <div className="text-gray-400 flex-shrink-0">
                    {volume === 0 || !ambientEnabled ? <FaVolumeMute size={12} /> : <FaVolumeUp size={12} className="text-primary-500" />}
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                  <span className="text-[10px] font-black text-gray-400 w-8 tabular-nums text-right">{Math.round(volume * 100)}%</span>
                </div>
              </div>

              <QuickStrategy 
                applyPreset={applyPreset}
                setIsEditing={setIsEditing}
                upscPresets={UPSC_PRESETS}
              />
            </div>
        </div>
      </div>

      {/* Post-Session Rating Modal */}
      <FocusRatingModal
        isOpen={!!pendingSession}
        onClose={() => setPendingSession(null)}
        onComplete={completeRating}
        sessionData={pendingSession}
      />

      {/* Reset Confirmation Modal */}
       <TimerResetModal 
         isOpen={showResetConfirm}
         onClose={() => setShowResetConfirm(false)}
         onConfirm={() => {
           resetDay();
           setShowResetConfirm(false);
         }}
       />

       {/* Simple Full Screen Timer */}
       <FullScreenTimer
         isOpen={isFullScreen}
         timeLeft={timeLeft}
         isActive={isActive}
         toggleTimer={toggleTimer}
         progress={progress}
         onClose={() => {
           setIsFullScreen(false);
           if (document.fullscreenElement) {
             document.exitFullscreen().catch(() => {});
           }
         }}
       />
     </div>
  );
};

export default Timer;
