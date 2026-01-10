import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../redux/user/authSlice";
import toast from "react-hot-toast";
import Shimmer from "../components/Shimmer";
import LockedOverlay from "../components/LockedOverlay";
import { hasAccess } from "../utils/auth/verifyHelpers";

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
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // 🛡️ Only fetch if user has access (verified or within grace period)
    if (user && hasAccess(user)) {
      const fetchHomeStats = async () => {
        try {
          const [testsRes, tasksRes] = await Promise.all([
            api.get("/test"),
            api.get("/tasks")
          ]);
          
          const taskItems = tasksRes?.data?.tasks || [];
          const tests = testsRes?.data?.tests || [];
          
          const avgAcc = tests.length > 0 
            ? Math.round((tests.reduce((acc, t) => acc + (t.marksObtained / (t.totalMarks || 1)), 0) / tests.length) * 100)
            : 0;

          setStats({
            count: tests.length,
            accuracy: avgAcc,
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
        }
      };
      fetchHomeStats();
    }
  }, [user?._id, user?.isEmailVerified]);

  // Handle successful verification redirect
  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast.success("Email verified successfully! Welcome to the Arena.", {
        id: "verify-success",
        duration: 5000,
      });
            
      // Sync profile to remove banner/unlock features if state is stale

      // Clear the "verified" param from URL so this doesn't run again on re-render/user sync
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("verified");
      window.history.replaceState({}, "", `${window.location.pathname}?${newParams.toString()}`);

      const syncProfile = async () => {
        if (!user || user.isEmailVerified) return;
        try {
          const res = await api.get("/profile");
          if (res.status === "success" && res.data.user) {
            dispatch(updateProfile(res.data.user));
          }
        } catch (err) {
          console.error("Sync failed", err);
        }
      };
      syncProfile();
    }
  }, [searchParams, dispatch, user?._id, user?.isEmailVerified]);

  const strategy = getStrategyNote(stats);

  return (
    <div className="min-h-screen relative bg-gray-50 flex flex-col pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 font-outfit">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary-200/30 blur-3xl opacity-60 mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary-200/30 blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-200/30 blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Hero Section */}
        <div className="lg:col-span-7 space-y-6 md:space-y-8 text-center lg:text-left">
            <span className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-widest">Aspirant Arena</span>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tighter">
            Where Ambition Meets <br className="hidden lg:block" />
            <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-secondary-600 bg-clip-text text-transparent">
              High Performance
            </span>
          </h1>
          
          <p className="text-base md:text-lg lg:text-xl text-gray-500 max-w-2xl font-medium leading-relaxed mx-auto lg:mx-0">
            The all-in-one strategic hub for UPSC aspirants. Track mock tests, 
            automate revision loops, and master your syllabus with data-driven precision.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            <Link
              to="/test-tracker"
              className="px-8 py-4 rounded-[2rem] bg-gray-900 text-white font-black shadow-2xl shadow-gray-200 hover:bg-black hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 text-sm md:text-base"
            >
              Analyze Your Performance 📈
            </Link>
            <Link
              to="/tasks"
              className="px-8 py-4 rounded-[2rem] bg-white text-gray-900 font-black border border-gray-100 shadow-sm hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              Manage Tasks 📝
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Widget */}
        <div className="lg:col-span-5 relative">
          {user ? (
            <div className="space-y-6">
              {/* Stats Card */}
              <div className={`relative bg-white p-8 rounded-[3rem] shadow-2xl shadow-gray-200 border border-gray-100 scale-100 lg:scale-105 transition-transform hover:rotate-1 overflow-hidden`}>
                
                {/* 🔒 Locked State only if grace period EXPIRED and unverified */}
                {user && !hasAccess(user) && (
                   <LockedOverlay />
                )}

                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Live Progress</h3>
                  <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 text-2xl font-black italic">!</div>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Overall Accuracy</span>
                    {stats ? (
                      <span className="text-4xl font-black text-primary-600 animate-fade-in">
                        {stats.accuracy}%
                      </span>
                    ) : user && !hasAccess(user) ? (
                      <span className="text-4xl font-black text-gray-200">0%</span>
                    ) : (
                      <Shimmer variant="stats" className="mt-1" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Tests Logged</span>
                    {stats ? (
                      <span className="text-4xl font-black text-gray-900 animate-fade-in">
                        {stats.count}
                      </span>
                    ) : user && !hasAccess(user) ? (
                      <span className="text-4xl font-black text-gray-200">0</span>
                    ) : (
                      <Shimmer variant="stats" className="mt-1" />
                    )}
                  </div>
                </div>

                {stats?.pendingRevisions > 0 && (
                  <div className="mt-6 flex items-center justify-between bg-rose-50 p-3 rounded-2xl border border-rose-100">
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Active Revision Loops</span>
                    <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full">{stats.pendingRevisions} Pending</span>
                  </div>
                )}
                
                <div className="mt-10 pt-8 border-t border-gray-100/50">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Urgent Revision Tasks</span>
                   <div className="space-y-3">
                     {!stats && (!user || hasAccess(user)) ? (
                       <>
                         <Shimmer variant="bar" className="h-12" />
                         <Shimmer variant="bar" className="h-12 w-5/6" />
                       </>
                     ) : tasks.length > 0 ? (
                       tasks.map((t) => (
                         <Link
                           key={t._id}
                           to={t.text.includes("conceptual errors") ? "/test-tracker" : "/tasks"}
                           className="flex items-center gap-3 bg-white/50 hover:bg-white backdrop-blur-sm p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-100 hover:scale-[1.02] active:scale-95 transition-all group"
                         >
                           <div
                             className={`w-2 h-2 rounded-full shrink-0 ${
                               t.priority === "high"
                                 ? "bg-rose-500 shadow-sm shadow-rose-200"
                                 : "bg-primary-500 shadow-sm shadow-primary-200"
                             }`}
                           ></div>
                           <span className="text-xs font-bold text-gray-600 truncate group-hover:text-gray-900">
                             {t.text}
                           </span>
                         </Link>
                       ))
                     ) : (
                       <p className="text-xs font-bold text-gray-300 italic uppercase">
                         No pending revisions. Great job!
                       </p>
                     )}
                   </div>
                </div>
              </div>

              {/* Dynamic Strategy Card */}
              {strategy && (
                <div 
                  className={`bg-gradient-to-br ${strategy.color} p-8 rounded-[3rem] shadow-xl text-white relative overflow-hidden group`}
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <h4 className="font-black text-lg mb-2 flex items-center gap-2">
                    {strategy.icon} {strategy.title}
                  </h4>
                  <p className="text-xs font-medium opacity-90 leading-relaxed">
                    {strategy.text}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-gray-200 border border-gray-100 text-center space-y-6">
               <div className="w-20 h-20 bg-gray-50 rounded-[2rem] mx-auto flex items-center justify-center text-4xl">🚀</div>
               <h3 className="text-2xl font-black text-gray-900">Join the Arena</h3>
               <p className="text-sm text-gray-500 font-medium">Create your free workspace to start tracking your journey to the Civil Services.</p>
               <Link to="/signup" className="block w-full py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 transition-all">Get Started</Link>
            </div>
          )}
        </div>

      </div>

      {/* Trust Blocks */}
      <div className="relative z-10 max-w-7xl mx-auto w-full mt-24 mb-12 py-12 border-y border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { label: "Data Security", value: "JWT Protected" },
             { label: "Sync Status", value: "Real-time Cloud" },
             { label: "Architecture", value: "Scalable MERN" },
             { label: "UX Philosophy", value: "Deep Focus" }
           ].map((item, i) => (
             <div key={i} className="text-center md:text-left">
               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</div>
               <div className="text-sm font-black text-gray-800">{item.value}</div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
