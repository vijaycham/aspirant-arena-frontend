import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useSelector } from "react-redux";

const Home = () => {
  const { currentUser: user } = useSelector((state) => state.user);
  const [stats, setStats] = useState(null);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    if (user) {
      const fetchHomeStats = async () => {
        try {
          const [testsRes, todosRes] = await Promise.all([
            api.get("/test"),
            api.get("/todo")
          ]);
          
          const todoItems = todosRes?.data?.todos || [];
          const tests = testsRes?.data?.tests || [];
          
          const avgAcc = tests.length > 0 
            ? Math.round((tests.reduce((acc, t) => acc + (t.marksObtained / (t.totalMarks || 1)), 0) / tests.length) * 100)
            : 0;

          setStats({
            count: tests.length,
            accuracy: avgAcc,
            pendingRevisions: todoItems.filter(t => !t.completed && t.text.includes("Revise conceptual errors")).length
          });
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          const sortedTodos = todoItems
            .filter(t => !t.completed)
            .sort((a, b) => {
              const weightA = priorityWeight[a.priority] || 0;
              const weightB = priorityWeight[b.priority] || 0;
              return weightB - weightA;
            });
          setTodos(sortedTodos.slice(0, 3));
        } catch (err) {
          console.error("Failed to load dashboard stats", err);
        }
      };
      fetchHomeStats();
    }
  }, [user]);

  return (
    <div className="min-h-screen relative bg-gray-50 flex flex-col pt-20 px-4 sm:px-6 lg:px-8 font-outfit">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary-200/30 blur-3xl opacity-60 mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary-200/30 blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-200/30 blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Hero Section */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Aspirant Workspace 2.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] tracking-tighter">
            Where Ambition Meets <br />
            <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-secondary-600 bg-clip-text text-transparent">
              High Performance
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl font-medium leading-relaxed">
            The all-in-one strategic hub for UPSC aspirants. Track mock tests, 
            automate revision loops, and master your syllabus with data-driven precision.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <Link
              to="/test-tracker"
              className="px-8 py-4 rounded-[2rem] bg-gray-900 text-white font-black shadow-2xl shadow-gray-300 hover:bg-black hover:scale-[1.05] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
            >
              Analyze Your Performance 📈
            </Link>
            <Link
              to="/todo"
              className="px-8 py-4 rounded-[2rem] bg-white text-gray-900 font-black border border-gray-100 shadow-sm hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
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
              <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-gray-200 border border-gray-100 scale-100 lg:scale-105 transition-transform hover:rotate-1">
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Live Progress</h3>
                  <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 text-2xl font-black italic">!</div>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Overall Accuracy</span>
                    <span className="text-4xl font-black text-primary-600">{stats?.accuracy || 0}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Tests Logged</span>
                    <span className="text-4xl font-black text-gray-900">{stats?.count || 0}</span>
                  </div>
                </div>

                {stats?.pendingRevisions > 0 && (
                  <div className="mt-6 flex items-center justify-between bg-rose-50 p-3 rounded-2xl border border-rose-100">
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Active Revision Loops</span>
                    <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full">{stats.pendingRevisions} Pending</span>
                  </div>
                )}
                
                <div className="mt-10 pt-8 border-t border-gray-50">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Urgent Revision Tasks</span>
                   <div className="space-y-3">
                     {todos.length > 0 ? todos.map(t => (
                        <Link 
                          key={t._id} 
                          to={t.text.includes("conceptual errors") ? "/test-tracker" : "/todo"}
                          className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 hover:bg-gray-100 hover:scale-[1.02] active:scale-95 transition-all group"
                        >
                          <div className={`w-2 h-2 rounded-full shrink-0 ${t.priority === 'high' ? 'bg-rose-500 shadow-sm shadow-rose-200' : 'bg-primary-500 shadow-sm shadow-primary-200'}`}></div>
                          <span className="text-xs font-bold text-gray-600 truncate group-hover:text-gray-900">{t.text}</span>
                        </Link>
                     )) : (
                        <p className="text-xs font-bold text-gray-300 italic uppercase">No pending revisions. Great job!</p>
                     )}
                   </div>
                </div>
              </div>

              {/* Quick Info Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-primary-700 p-8 rounded-[3rem] shadow-xl text-white">
                <h4 className="font-black text-lg mb-2">Strategy Note 💡</h4>
                <p className="text-xs font-medium opacity-80 leading-relaxed">
                  Consistent analysis of &quot;Unattended&quot; questions is the fastest way to increase your prelims score. Check your Mistake Pie Chart today!
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-gray-200 border border-gray-100 text-center space-y-6">
               <div className="w-20 h-20 bg-gray-50 rounded-[2rem] mx-auto flex items-center justify-center text-4xl">🚀</div>
               <h3 className="text-2xl font-black text-gray-900">Join the Arena</h3>
               <p className="text-sm text-gray-500 font-medium">Create your free workspace to start tracking your journey to the Civil Services.</p>
               <Link to="/auth" className="block w-full py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 transition-all">Get Started</Link>
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
