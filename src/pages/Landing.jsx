import { Link, useSearchParams } from "react-router-dom";
import { FaRocket, FaShieldAlt, FaChartBar, FaAngleRight, FaCheck } from "react-icons/fa";
import logo from "../../assets/3.png";
import { useEffect } from "react";
import toast from "react-hot-toast";

const Landing = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast.success("Email verified successfully! You can now sign in to your account.", {
        id: "verify-success-landing",
        duration: 6000,
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen relative bg-gray-50 flex flex-col font-outfit overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] rounded-full bg-primary-200/20 blur-[120px] opacity-60 mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-200/20 blur-[120px] opacity-60 mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-200/10 blur-[120px] opacity-60 mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 text-center lg:text-left transition-all duration-1000">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/50 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Built for UPSC Aspirants</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-gray-900 leading-[0.95] tracking-tighter">
              Aspirant <br />
              <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-secondary-600 bg-clip-text text-transparent">
                Arena
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Master your civil services preparation with a precision-engineered 
              workspace. Track mocks, automate revision, and analyze subject progress 
              in one high-performance arena.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <Link
                to="/signup"
                className="group relative px-10 py-5 rounded-[2.5rem] bg-slate-900 text-white font-black shadow-2xl shadow-slate-200 hover:bg-black hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden text-sm md:text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10 flex items-center gap-3">
                  Start Your Journey <FaAngleRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                to="/signin"
                className="px-10 py-5 rounded-[2.5rem] bg-white text-slate-900 font-black border border-gray-100 shadow-sm hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 text-sm md:text-base flex items-center justify-center"
              >
                Sign In to Account
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 pt-4 opacity-70 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-2">
                    <FaCheck className="text-primary-500 text-xs" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Free Forever</span>
                </div>
                <div className="flex items-center gap-2">
                    <FaCheck className="text-primary-500 text-xs" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cloud Sync</span>
                </div>
                <div className="flex items-center gap-2">
                    <FaCheck className="text-primary-500 text-xs" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Zero Ads</span>
                </div>
            </div>
          </div>

          {/* Feature Highlight Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-indigo-600 rounded-[4rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-white p-4 sm:p-10 rounded-[3.5rem] shadow-2xl border border-gray-100 ring-1 ring-gray-900/5 transition-transform duration-500 hover:-rotate-1">
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-gray-900">High-Fidelity Prep</h3>
                    <p className="text-gray-400 font-medium text-sm">Everything you need to succeed.</p>
                  </div>
                  <div className="w-14 h-14 bg-primary-50 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-primary-500/10">
                    <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: "Mock Tracking", icon: <FaChartBar className="text-primary-500" />, desc: "Log and analyze mocks." },
                    { title: "Smart Revision", icon: <FaRocket className="text-indigo-500" />, desc: "Auto-generated tasks." },
                    { title: "Focused UI", icon: <FaShieldAlt className="text-secondary-500" />, desc: "Zero distractions." },
                    { title: "Daily Insights", icon: <FaRocket className="text-emerald-500" />, desc: "Performance based tips." }
                  ].map((f, i) => (
                    <div key={i} className="p-4 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:border-primary-100 hover:shadow-lg transition-all">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 text-lg">
                        {f.icon}
                      </div>
                      <h4 className="text-sm font-black text-gray-900 mb-1">{f.title}</h4>
                      <p className="text-[11px] text-gray-400 font-medium leading-tight">{f.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex -space-x-3">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
                                <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                            </div>
                        ))}
                        <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-sm">+1k</div>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined by top aspirants</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 border-y border-gray-100 bg-white/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-12">Trusted by Civil Services Aspirants</h2>
            {/* <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale pointer-events-none">
                <span className="text-2xl font-black text-gray-900 tracking-tighter italic">Vajiram & Ravi Style</span>
                <span className="text-2xl font-black text-gray-900 tracking-tighter italic">Vision IAS Flow</span>
                <span className="text-2xl font-black text-gray-900 tracking-tighter italic">Insights On India</span>
                <span className="text-2xl font-black text-gray-900 tracking-tighter italic">IASbaba Grade</span>
            </div> */}
        </div>
      </section>
    </div>
  );
};

export default Landing;
