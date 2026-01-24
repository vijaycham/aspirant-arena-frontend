import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../redux/user/authSlice";
import { fetchArenas } from "../redux/slice/arenaSlice";
import toast from "react-hot-toast";
import Shimmer from "../components/Shimmer";
import LockedOverlay from "../components/LockedOverlay";
import { hasAccess } from "../utils/auth/verifyHelpers";
import { FiLayers, FiStar, FiTarget, FiActivity, FiChevronRight } from "react-icons/fi";

const getStrategyNote = (stats) => {
  if (!stats) return null;
  if (stats.pendingRevisions > 5) {
    return {
      title: "Revision Bottleneck",
      text: "You have many pending revision loops. Pause new mocks and clear conceptual errors first.",
      color: "from-rose-600 to-orange-600",
      icon: "⚠️"
    };
  }
  if (stats.accuracy < 50) {
    return {
      title: "Foundation Alert ",
      text: "Accuracy is low. Focus on error analysis instead of increasing mock frequency.",
      color: "from-amber-500 to-orange-600",
      icon: "🧐"
    };
  }
  if (stats.accuracy >= 70) {
    return {
      title: "Strong Momentum ",
      text: "Accuracy is strong. Increase mock frequency and focus on time optimization.",
      color: "from-emerald-500 to-teal-600",
      icon: "🚀"
    };
  }
  return {
    title: "Consistency Tip ",
    text: "Daily analysis of mistakes compounds into major score improvement.",
    color: "from-indigo-600 to-primary-700",
    icon: "💡"
  };
};

const Home = () => {
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
              const microTopics = nodes.filter(n => n.type === 'micro-topic');
              const completedCount = microTopics.filter(n => n.status === 'completed').length;
              const progress = microTopics.length > 0 ? Math.round((completedCount / microTopics.length) * 100) : 0;
              setPrimaryArena({ ...primary, progress });
            } catch (err) {
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

  const strategy = getStrategyNote(stats);

  return (
    <div className="min-h-screen relative bg-gray-50 dark:bg-slate-950 transition-colors duration-200 flex flex-col pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 font-outfit">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary-200/30 dark:bg-primary-900/10 blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary-200/30 dark:bg-secondary-900/10 blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

        {/* Hero Section */}
        <div className="lg:col-span-7 space-y-6 md:space-y-8 text-center lg:text-left">
          <span className="text-[10px] md:text-xs font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2 justify-center lg:justify-start">
            <FiActivity className="text-primary-600" /> High Performance Dashboard
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tighter transition-colors duration-200">
            {primaryArena ? (
              <>Master your <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">{primaryArena.title}</span></>
            ) : (
              <>Elite Focus <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-secondary-600 bg-clip-text text-transparent">Architecture</span></>
            )}
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-gray-500 dark:text-gray-400 max-w-2xl font-medium leading-relaxed mx-auto lg:mx-0 transition-colors duration-200">
            {primaryArena
              ? `You are currently focusing on ${primaryArena.title}. Track your syllabus, automate revision loops, and master every micro-topic with elite precision.`
              : "Welcome back. Track your mock tests, automate revision loops, and sync your study sessions across specialized Roadmap Arenas."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            <Link to="/arena" className="px-8 py-4 rounded-[2rem] bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black shadow-xl hover:scale-[1.03] active:scale-95 transition-transform duration-200 flex items-center justify-center gap-3 text-sm md:text-base border border-transparent">
              Roadmap Arenas ⛩️
            </Link>
            <Link to="/test-tracker" className="px-8 py-4 rounded-[2rem] bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-black shadow-xl shadow-gray-100/50 dark:shadow-none hover:bg-gray-50 dark:hover:bg-slate-700 hover:scale-[1.03] active:scale-95 transition-transform duration-200 flex items-center justify-center gap-3 text-sm md:text-base">
              Performance 📈
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Widget */}
        <div className="lg:col-span-5 relative">
          {user ? (
            <div className="space-y-6">
              <div className={`relative bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl shadow-gray-200 dark:shadow-slate-900/50 border border-gray-100 dark:border-white/10 scale-100 lg:scale-105 transition-all duration-200 hover:rotate-1 overflow-hidden`}>

                {user && !hasAccess(user) && <LockedOverlay />}

                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Live Command</h3>
                  <div className="w-12 h-12 bg-primary-50 dark:bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400 text-2xl font-black italic">
                    <FiTarget />
                  </div>
                </div>

                {primaryArena ? (
                  <div className="space-y-8">
                    <div className="flex items-center gap-6">
                      <div className="relative w-24 h-24 shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle className="text-gray-100 dark:text-gray-800 stroke-current" strokeWidth="10" fill="transparent" r="40" cx="50" cy="50" />
                          <circle
                            className="text-primary-600 stroke-current transition-all duration-1000"
                            strokeWidth="10" strokeLinecap="round" fill="transparent" r="40" cx="50" cy="50"
                            strokeDasharray={`${2.51 * (primaryArena.progress || 0)} 251`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-black text-lg text-gray-900 dark:text-white">{primaryArena.progress || 0}%</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Primary Goal</span>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white truncate max-w-[180px]">{primaryArena.title}</h4>
                        <Link to="/arena" className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1 mt-1">
                          Roadmap Active <FiStar className="fill-current" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 p-6 bg-gray-50 dark:bg-slate-800/50 rounded-[2rem] border border-dashed border-gray-200 dark:border-white/5 text-center flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center text-amber-500 mb-3 animate-pulse">
                      <FiLayers size={24} />
                    </div>
                    <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">No Primary Roadmap</h4>
                    <Link to="/arena" className="text-[10px] font-black text-primary-600 uppercase hover:underline mt-1 flex items-center gap-1">Set One Now <FiChevronRight /></Link>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-8 border-t border-gray-100 dark:border-white/5 pt-6 mt-8">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                      {primaryArena ? "Goal Focus" : "Focused Today"}
                    </span>
                    {stats ? (
                      <span className="text-3xl font-black text-primary-600">
                        {stats.focusedToday >= 60 ? `${Math.floor(stats.focusedToday / 60)}h ${stats.focusedToday % 60}m` : `${stats.focusedToday}m`}
                      </span>
                    ) : <Shimmer variant="stats" className="h-8 w-16" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                      {primaryArena ? "Goal Acc." : "Avg Accuracy"}
                    </span>
                    {stats ? (
                      <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.accuracy}%</span>
                    ) : <Shimmer variant="stats" className="h-8 w-16" />}
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100/50 dark:border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Strategic Tasks</span>
                    <Link to="/tasks" className="text-[9px] font-black text-primary-600 uppercase hover:underline">Manage All</Link>
                  </div>
                  <div className="space-y-3">
                    {loading ? (
                      <Shimmer variant="bar" className="h-12" />
                    ) : tasks.length > 0 ? (
                      tasks.map((t) => (
                        <Link key={t._id} to={t.text.includes("conceptual errors") ? "/test-tracker" : "/tasks"} className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-sm p-3 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:scale-[1.02] transition-all group">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${t.priority === "high" ? "bg-rose-500" : "bg-primary-500"}`}></div>
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-300 truncate group-hover:text-gray-900 dark:group-hover:text-white uppercase tracking-tight">{t.text}</span>
                        </Link>
                      ))
                    ) : (
                      <p className="text-xs font-bold text-gray-300 italic uppercase py-4">Sky is clear. No urgent loops!</p>
                    )}
                  </div>
                </div>
              </div>

              {strategy && (
                <div className={`bg-gradient-to-br ${strategy.color} p-8 rounded-[3rem] shadow-xl text-white relative overflow-hidden group`}>
                  <h4 className="font-black text-lg mb-2 flex items-center gap-2">{strategy.icon} {strategy.title}</h4>
                  <p className="text-[11px] font-bold uppercase tracking-tight opacity-90 leading-relaxed">{strategy.text}</p>
                </div>
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
    </div>
  );
};

export default Home;
