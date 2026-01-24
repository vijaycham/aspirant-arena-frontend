import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../redux/user/authSlice";
import { fetchArenas } from "../redux/slice/arenaSlice";
import { useTimer } from "../hooks/useTimer";
import toast from "react-hot-toast";
import Shimmer from "../components/Shimmer";
import LockedOverlay from "../components/LockedOverlay";
import { hasAccess } from "../utils/auth/verifyHelpers";
import { FiActivity, FiTarget, FiLayers, FiZap } from 'react-icons/fi';

const getStrategyNote = (stats, primaryArena) => {
  if (!stats) return null;
  const context = primaryArena ? `for ${primaryArena.title}` : "";

  if (stats.pendingRevisions > 5) {
    return {
      title: "Revision Bottleneck",
      text: `You have many pending revision loops ${context}. Pause new mocks and clear conceptual errors first.`,
      color: "from-rose-600 to-orange-600",
      icon: "⚠️"
    };
  }
  if (stats.accuracy < 50 && stats.count > 0) {
    return {
      title: "Foundation Alert",
      text: `Accuracy ${context} is low. Focus on error analysis instead of increasing mock frequency.`,
      color: "from-amber-500 to-orange-600",
      icon: "🧐"
    };
  }
  if (stats.accuracy >= 70 && stats.count > 0) {
    return {
      title: "Strong Momentum",
      text: `Accuracy ${context} is strong. Increase mock frequency and focus on time optimization.`,
      color: "from-emerald-500 to-teal-600",
      icon: "🚀"
    };
  }
  return {
    title: "Strategic Tip",
    text: primaryArena
      ? `Focusing on ${primaryArena.title}. Master its micro-topics to build unbreakable momentum.`
      : "Daily analysis of mistakes compounds into major score improvement across all arenas.",
    color: "from-indigo-600 to-primary-700",
    icon: "💡"
  };
};

const Home = () => {
  const { isActive: isTimerActive, timeLeft, mode: timerMode } = useTimer();
  const { currentUser: user } = useSelector((state) => state.user);
  const { arenas } = useSelector((state) => state.arena);
  const userId = user?._id;
  const isEmailVerified = user?.isEmailVerified;
  const createdAt = user?.createdAt;
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [primaryArena, setPrimaryArena] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync Arenas on Mount
  useEffect(() => {
    if (arenas.length === 0 && userId) {
      dispatch(fetchArenas());
    }
  }, [arenas.length, dispatch, userId]);

  useEffect(() => {
    // 🛡️ Only fetch if user has access (verified or within grace period)
    const userForAccess = { isEmailVerified, createdAt };
    if (userId && hasAccess(userForAccess)) {
      const fetchHomeData = async () => {
        setLoading(true);
        try {
          const tzOffset = new Date().getTimezoneOffset();
          const primary = arenas.find(a => a.isPrimary);
          const arenaFilter = primary ? `&arenaId=${primary._id}` : '';
          const arenaQuery = primary ? `?arenaId=${primary._id}` : '';

          const [testsRes, tasksRes, focusRes] = await Promise.all([
            api.get(`/test${arenaQuery}`),
            api.get("/tasks"),
            api.get(`/focus/stats/today?offset=${tzOffset}${arenaFilter}`)
          ]);

          const taskItems = tasksRes?.data?.tasks || [];
          const tests = testsRes?.data?.tests || [];
          const focusStats = focusRes?.data || {};

          if (primary) {
            // Calculate progress for primary arena
            try {
              const syllabusRes = await api.get(`/arenas/${primary._id}/syllabus`);
              const nodes = syllabusRes.data.nodes || [];
              const microTopics = nodes.filter(n => ['micro-topic', 'topic', 'subtopic'].includes(n.type));
              const completedCount = microTopics.filter(n => n.status === 'completed').length;
              const progress = microTopics.length > 0 ? Math.round((completedCount / microTopics.length) * 100) : 0;
              setPrimaryArena({ ...primary, progress });
            } catch {
              setPrimaryArena(primary);
            }
          } else {
            setPrimaryArena(null);
          }

          const avgAcc = tests.length > 0
            ? Math.round((tests.reduce((acc, t) => acc + (t.marksObtained / (t.totalMarks || 1)), 0) / tests.length) * 100)
            : 0;

          setStats({
            count: tests.length,
            accuracy: avgAcc,
            focusedToday: focusStats.totalMinutes || 0,
            pendingRevisions: taskItems.filter(t => !t.completed && t.text.includes("Revise conceptual errors")).length
          });

          const priorityWeight = { high: 3, medium: 2, low: 1 };
          const sortedTasks = taskItems
            .filter(t => !t.completed)
            .sort((a, b) => {
              const weightA = priorityWeight[a.priority] || 0;
              const weightB = priorityWeight[b.priority] || 0;
              return weightB - weightA;
            });
          setTasks(sortedTasks.slice(0, 3));
        } catch (err) {
          console.error("Failed to load dashboard stats", err);
        } finally {
          setLoading(false);
        }
      };
      fetchHomeData();
    } else {
      setLoading(false);
    }
  }, [userId, isEmailVerified, createdAt, arenas]);

  // Handle successful verification redirect
  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast.success("Email verified successfully! Welcome to the Arena.", { id: "verify-success", duration: 5000 });
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("verified");
      window.history.replaceState({}, "", `${window.location.pathname}?${newParams.toString()}`);

      const syncProfile = async () => {
        if (!userId || isEmailVerified) return;
        try {
          const res = await api.get("/profile");
          if (res.status === "success" && res.data.user) dispatch(updateProfile(res.data.user));
        } catch (err) { console.error("Sync failed", err); }
      };
      syncProfile();
    }
  }, [searchParams, dispatch, userId, isEmailVerified]);

  const strategy = getStrategyNote(stats, primaryArena);

  return (
    <div className="min-h-screen relative bg-gray-50 dark:bg-slate-950 transition-colors duration-200 flex flex-col pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 font-outfit">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary-200/30 dark:bg-primary-900/10 blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary-200/30 dark:bg-secondary-900/10 blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start lg:pt-6">

        {/* Hero Section */}
        <div className="lg:col-span-7 space-y-6 md:space-y-8 text-center lg:text-left pt-4 lg:pt-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 animate-in fade-in slide-in-from-left-4">
            Aspirant Arena
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tighter transition-colors duration-200">
            {primaryArena ? (
              <>Master your <br className="hidden lg:block" /><span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">{primaryArena.title}</span></>
            ) : (
              <>
                Where Ambition Meets <br className="hidden lg:block" />
                <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-secondary-600 bg-clip-text text-transparent">
                  High Performance
                </span>
              </>
            )}
          </h1>
          <p className="text-base md:text-md lg:text-lg text-gray-500 dark:text-gray-400 font-bold max-w-2xl mx-auto lg:mx-0 leading-relaxed tracking-tight transition-all duration-500">
            {primaryArena
              ? `You are currently focusing on ${primaryArena.title}. Track your syllabus, automate revision loops, and master every micro-topic with elite precision.`
              : "The all-in-one strategic hub for aspirants. Track mock tests, automate revision loops, and master your syllabus with data-driven precision."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            {!isTimerActive ? (
              <>
                <Link to="/timer" className="px-8 py-4 rounded-[2rem] bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black shadow-xl hover:scale-[1.03] active:scale-95 transition-transform duration-200 flex items-center justify-center gap-3 text-sm md:text-base border border-transparent">
                  Focus Arena ⚡
                </Link>
                <Link to="/test-tracker" className="px-8 py-4 rounded-[2rem] bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-black shadow-xl shadow-gray-100/50 dark:shadow-none hover:bg-gray-50 dark:hover:bg-slate-700 hover:scale-[1.03] active:scale-95 transition-transform duration-200 flex items-center justify-center gap-3 text-sm md:text-base">
                  Analyze Performance 📈
                </Link>
                <Link to="/tasks" className="px-8 py-4 rounded-[2rem] bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-black shadow-xl shadow-gray-100/50 dark:shadow-none hover:bg-gray-50 dark:hover:bg-slate-700 hover:scale-[1.03] active:scale-95 transition-transform duration-200 flex items-center justify-center gap-3 text-sm md:text-base">
                  Manage Tasks 📝
                </Link>
              </>
            ) : (
              <div className="flex flex-wrap gap-4">
                <Link to="/test-tracker" className="px-8 py-4 rounded-[2rem] bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-black shadow-xl shadow-gray-100/50 dark:shadow-none hover:bg-gray-50 dark:hover:bg-slate-700 hover:scale-[1.03] active:scale-95 transition-transform duration-200 flex items-center justify-center gap-3 text-sm md:text-base">
                  Analyze Performance 📈
                </Link>
                <Link to="/arena" className="px-8 py-4 rounded-[2rem] bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-black shadow-xl shadow-gray-100/50 dark:shadow-none hover:bg-gray-50 dark:hover:bg-slate-700 hover:scale-[1.03] active:scale-95 transition-transform duration-200 flex items-center justify-center gap-3 text-sm md:text-base">
                  Master Syllabus ⛩️
                </Link>
                <Link to="/tasks" className="px-8 py-4 rounded-[2rem] bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-black shadow-xl shadow-gray-100/50 dark:shadow-none hover:bg-gray-50 dark:hover:bg-slate-700 hover:scale-[1.03] active:scale-95 transition-transform duration-200 flex items-center justify-center gap-3 text-sm md:text-base">
                  Manage Tasks 📝
                </Link>
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-16 grid grid-cols-3 gap-8 border-t border-gray-200 dark:border-white/5 mt-24"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                <FiLayers size={16} />
              </div>
              <h5 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Map</h5>
              <p className="text-[9px] text-gray-700 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tighter">Recursive Roadmap</p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center text-secondary-600 dark:text-secondary-400">
                <FiActivity size={16} />
              </div>
              <h5 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Analyze</h5>
              <p className="text-[9px] text-gray-700 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tighter">Error-First Intel</p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <FiTarget size={16} />
              </div>
              <h5 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Command</h5>
              <p className="text-[9px] text-gray-700 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tighter">Deep Focus Auto</p>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Preview Widget */}
        <div className="lg:col-span-5 relative">
          {user ? (
            <div className="space-y-6">
              <div className={`relative bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl shadow-gray-200 dark:shadow-slate-900/50 border border-gray-100 dark:border-white/10 scale-100 lg:scale-105 transition-all duration-200 hover:rotate-1 overflow-hidden`}>

                {user && !hasAccess(user) && <LockedOverlay />}

                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                    {isTimerActive ? "Live Command" : "Progress Intel"}
                  </h3>
                  <div className="w-12 h-12 bg-primary-50 dark:bg-primary-500/20 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400 text-2xl font-black italic">
                    {isTimerActive ? <FiTarget /> : "!"}
                  </div>
                </div>

                {isTimerActive ? (
                  <div className="flex flex-col items-center justify-center py-6 bg-primary-50/50 dark:bg-primary-500/5 rounded-[2.5rem] border border-primary-100 dark:border-primary-500/10 mb-4 scale-105 shadow-lg shadow-primary-500/5">
                    <div className="relative w-36 h-36 shrink-0 mb-4">
                      <div className="relative w-full h-full">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle className="text-gray-100 dark:text-gray-800 stroke-current" strokeWidth="4" fill="transparent" r="46" cx="50" cy="50" />
                          <circle
                            className="text-primary-600 stroke-current animate-pulse transition-all duration-1000"
                            strokeWidth="6" strokeLinecap="round" fill="transparent" r="46" cx="50" cy="50"
                            strokeDasharray="289"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black text-gray-900 dark:text-white tabular-nums leading-none tracking-tighter">
                            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] font-black text-primary-500 uppercase tracking-[0.2em] mt-2">
                            {timerMode === 'FOCUS' ? 'Focusing' : 'Break'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-black text-primary-600/60 dark:text-primary-400/60 uppercase tracking-widest block mb-1">Current Command</span>
                      <h4 className="text-lg font-black text-gray-900 dark:text-white max-w-[280px] leading-tight truncate">
                        {primaryArena ? primaryArena.title : "Deep Work Depth"}
                      </h4>
                      <Link to="/timer" className="text-[10px] font-bold text-primary-600 hover:underline mt-1 inline-block">Open Focus Arena &rarr;</Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-8 mb-4 px-4">
                    <div className="text-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Arena Progress</span>
                      <div className="flex flex-col items-center">
                        <span className="text-4xl font-black text-gray-900 dark:text-white">
                          {primaryArena ? (primaryArena.progress || 0) : 0}<span className="text-lg text-gray-400 ml-1">%</span>
                        </span>
                        {!primaryArena && (
                          <Link to="/arena" className="text-[10px] font-bold text-primary-600 hover:underline mt-1 uppercase tracking-wide">
                            Set Map
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Focus Today</span>
                      <div>
                        <span className="text-4xl font-black text-gray-900 dark:text-white">
                          {stats ? Math.round(stats.focusedToday / 60 * 10) / 10 : 0}<span className="text-lg text-gray-400 ml-1">h</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Accuracy</span>
                      <div>
                        <span className="text-4xl font-black text-gray-900 dark:text-white">
                          {stats ? stats.accuracy : 0}<span className="text-lg text-gray-400 ml-1">%</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Tests Logged</span>
                      <div>
                        <span className="text-4xl font-black text-gray-900 dark:text-white">
                          {stats ? stats.count : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100/50 dark:border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Strategic Tasks</span>
                    <Link to="/tasks" className="text-[8px] font-black text-primary-600 uppercase hover:underline">Manage All</Link>
                  </div>
                  <div className="space-y-3">
                    {loading ? (
                      <Shimmer variant="bar" className="h-12" />
                    ) : tasks.length > 0 ? (
                      tasks.map((t) => (
                        <Link
                          key={t._id}
                          to="/timer"
                          state={{ autoTask: t }}
                          className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-sm p-3 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:scale-[1.02] transition-all group"
                        >
                          <div className={`w-2 h-2 rounded-full shrink-0 ${t.priority === "high" ? "bg-rose-500" : "bg-primary-500"}`}></div>
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-300 truncate group-hover:text-gray-900 dark:group-hover:text-white tracking-tight normal-case capitalize">{t.text.toLowerCase()}</span>
                          <FiZap className="ml-auto text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))
                    ) : (
                      <p className="text-xs font-bold text-gray-300 italic uppercase py-4">Sky is clear. No urgent loops!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Strategic Tip (Old Card Design) - Now in Right Column */}
              {strategy && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className={`bg-gradient-to-br ${strategy.color} p-8 rounded-[3rem] shadow-2xl shadow-gray-200 dark:shadow-none text-white relative overflow-hidden group border border-white/10`}
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <h4 className="font-black text-lg mb-2 flex items-center gap-2">
                    {strategy.icon} {strategy.title}
                  </h4>
                  <p className="text-xs font-medium opacity-90 leading-relaxed">
                    {strategy.text}
                  </p>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border border-gray-100 dark:border-white/5 text-center space-y-6">
              <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-[2rem] mx-auto flex items-center justify-center text-4xl shadow-inner italic font-black text-primary-600">🏛️</div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">Join the Arena</h3>
              <Link to="/signup" className="block w-full py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 transition-all uppercase text-xs tracking-widest">Initialize Workspace</Link>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full border-t border-gray-200 dark:border-gray-800 mt-20 pt-12 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center md:text-left">
          <div>
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Data Security</span>
            <p className="text-sm font-black text-gray-900 dark:text-white/80">JWT Protected</p>
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Sync Status</span>
            <p className="text-sm font-black text-gray-900 dark:text-white/80">Real-time Cloud</p>
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Architecture</span>
            <p className="text-sm font-black text-gray-900 dark:text-white/80">Scalable MERN</p>
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">UX Philosophy</span>
            <p className="text-sm font-black text-gray-900 dark:text-white/80">Deep Focus</p>
          </div>
        </div>
      </div>
    </div >
  );
};

export default Home;
