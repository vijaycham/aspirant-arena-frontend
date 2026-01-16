import { Link } from "react-router-dom";
import {FaRocket, FaShieldAlt, FaChartBar } from "react-icons/fa";

const AboutUs = () => {
  return (
    <div className="min-h-screen relative bg-gray-50 flex flex-col pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-outfit overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-200/20 blur-3xl opacity-60 mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full text-center space-y-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
            <span className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest">Our Mission</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-[1.1]">
            Empowering the <br />
            <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
              Next Generation of Leaders
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Aspirant Arena is more than just a tool; it&apos;s a dedicated workspace 
            built to handle the unique rigors of Civil Services preparation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <FaShieldAlt className="text-primary-500" />,
              title: "Strategic Edge",
              desc: "Move beyond simple to-do lists. Track mock tests and automate your revision loops with surgical precision."
            },
            {
              icon: <FaChartBar className="text-indigo-500" />,
              title: "Data Driven",
              desc: "Deep-dive into your performance with interactive analytics. Identify subject streaks and conceptual bottlenecks."
            },
            {
              icon: <FaRocket className="text-secondary-500" />,
              title: "Built for Focus",
              desc: "A distraction-free, premium interface designed to keep your mind on the goal: the Final Merit List."
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 hover:scale-[1.02] transition-all duration-300 group">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-gray-100 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Developer Section */}
        <div className="bg-white/80 backdrop-blur-xl border border-white p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden text-left">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -mr-32 -mt-32"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden shrink-0">
                 <span className="text-4xl">👨‍💻</span>
              </div>
              <div className="space-y-4 text-center md:text-left">
                 <div>
                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Meet the Creator</span>
                    <h2 className="text-3xl font-black text-gray-900 leading-tight mt-1">Built with ❤️ by Vijay</h2>
                 </div>
                 <p className="text-gray-500 font-medium max-w-xl leading-relaxed">
                    &quot;I built Aspirant Arena to solve the chaos of preparation. 
                    Merging technology with discipline, my goal is to give every serious aspirant the digital infrastructure they deserve to succeed.&quot;
                 </p>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link to="/feedback" className="px-5 py-2 rounded-xl bg-primary-100 text-primary-700 font-black text-xs uppercase tracking-widest hover:bg-primary-200 transition-colors">
                      Get in Touch
                    </Link>
                    <span className="text-gray-300 hidden sm:inline">•</span>
                    <a href="https://github.com/vijaycham" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">GitHub</a>
                    <span className="text-gray-300">•</span>
                    <a href="https://www.linkedin.com/in/vijaycham/" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">LinkedIn</a>
                  </div>
              </div>
           </div>
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl font-black tracking-tight">Ready to conquer the Arena?</h2>
            <p className="text-gray-400 italic mb-4">
              &quot;The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack in will.&quot; 
              <span className="block text-primary-400 font-bold mt-2">- Vince Lombardi</span>
            </p>
            <p className="text-gray-400 font-medium max-w-xl mx-auto leading-relaxed">
              Join thousands of aspirants who are already using data to optimize
              their daily routine and maximize their scores.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to="/signup"
                className="px-8 py-4 rounded-2xl bg-white text-slate-900 font-black hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
              >
                Create Free Workspace
              </Link>
              <Link
                to="/signin"
                className="px-8 py-4 rounded-2xl bg-white/10 text-white font-black hover:bg-white/20 transition-all uppercase tracking-widest text-xs border border-white/10"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
