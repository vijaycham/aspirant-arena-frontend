import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/3.png";
import { useSelector, useDispatch } from "react-redux";
import { persistor } from "../redux/store";
import {
  FaSignOutAlt,
  FaTasks,
  FaUserCircle,
  FaStickyNote,
  FaClock,
  FaHome,
  FaBars,
  FaTimes,
  FaChartLine,
} from "react-icons/fa";
import { FiLayers } from "react-icons/fi";
import { HiCheckCircle, HiXCircle, HiClock } from "react-icons/hi";
import { signOut } from "../redux/user/authSlice";
import api from "../utils/api";
import { getRemainingGraceHours } from "../utils/auth/verifyHelpers";

import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const location = useLocation(); // Unused
  const user = useSelector((state) => state.user.currentUser);
  const isAuthenticated = !!user;

  // 📱 Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await api.post("/auth/signout", {});
      dispatch(signOut());
      await persistor.purge();
      await persistor.flush();
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      navigate("/signin");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <>
      <header className="sticky top-4 z-50 px-4 sm:px-6 font-outfit">
        <div className="container mx-auto bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] px-6 py-3.5 flex justify-between items-center text-white shadow-2xl shadow-slate-900/20 transition-all duration-300">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-all duration-300">
              <img
                src={logo}
                alt="Aspirant Arena Logo"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <span className="text-lg font-black tracking-tighter bg-gradient-to-r from-white to-primary-300 bg-clip-text text-transparent hidden sm:block uppercase">
              Aspirant Arena
            </span>
          </Link>

          {/* 🌍 Desktop Navigation */}
          {isAuthenticated ? (
            <nav className="hidden lg:flex items-center gap-8 font-bold text-sm tracking-tight text-white/80">
              <Link to="/" className="hover:text-primary-400 transition-colors">Home</Link>
              <Link to="/test-tracker" className="hover:text-primary-400 transition-colors">Analytics</Link>
              <Link to="/arena" className="relative group/arena hover:text-primary-400 transition-colors flex items-center gap-1.5 underline decoration-primary-500/30 underline-offset-4">
                Arena
                <motion.span
                  animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="bg-primary-500 text-[8px] px-1.5 py-0.5 rounded-full text-white font-black"
                >
                  NEW
                </motion.span>
              </Link>
              <Link to="/tasks" className="hover:text-primary-400 transition-colors">Tasks</Link>
              <Link to="/timer" className="hover:text-primary-400 transition-colors flex items-center gap-1.5">
                Focus Arena
              </Link>
              
              {/* Verification Status Badge */}
              <div className="flex items-center">
                {user.isEmailVerified ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/5">
                    <HiCheckCircle className="text-sm" /> Verified
                  </div>
                ) : (
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-lg ${
                    getRemainingGraceHours(user) > 0 
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/5" 
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5"
                  }`}>
                    {getRemainingGraceHours(user) > 0 ? <HiClock className="text-sm" /> : <HiXCircle className="text-sm" />}
                    {getRemainingGraceHours(user) > 0 ? "Grace Period" : "Unverified"}
                  </div>
                )}
              </div>

              <div className="h-4 w-px bg-white/10 mx-2" />
              <Link
                to="/profile"
                className="inline-block p-0.5 rounded-full border-2 border-transparent hover:border-primary-400 transition-all"
              >
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt="User" className="w-9 h-9 object-cover rounded-full border border-white/10 shadow-lg" />
                ) : (
                  <FaUserCircle className="text-3xl text-gray-400" />
                )}
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-rose-400 hover:text-rose-500 transition-colors font-black uppercase text-[10px] tracking-widest pl-2"
              >
                <FaSignOutAlt className="text-xs" /> Logout
              </button>
            </nav>
          ) : (
            <nav className="hidden lg:flex items-center gap-8 font-bold text-sm tracking-tight text-white/80">
              <Link to="/about" className="hover:text-primary-400 transition-colors uppercase tracking-widest text-[10px]">About Arena</Link>
              <Link to="/signin" className="px-6 py-2.5 rounded-xl bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all shadow-lg shadow-white/5 active:scale-95">
                Portal Login
              </Link>
            </nav>
          )}

          {/* 📱 Mobile Toggle Button */}
          {!isAuthenticated && (
            <div className="flex items-center gap-4 lg:hidden">
              <Link to="/about" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">About</Link>
              <Link to="/signin" className="px-5 py-2 rounded-xl bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest active:scale-95">
                Login
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-xl active:scale-95 transition-all"
              aria-label="Open Mobile Menu"
            >
              <FaBars />
            </button>
          )}
        </div>
      </header>

      {/* 📱 MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[60] lg:hidden"
            />

            {/* Side Drawer */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-slate-900 border-l border-white/5 z-[70] shadow-2xl flex flex-col font-outfit lg:hidden"
            >
              {/* Header */}
              <div className="p-6 flex justify-between items-center border-b border-white/5">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Aspirant Navigation</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/60 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/5 group">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-lg shadow-primary-500/10">
                    <FaHome />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">Home</span>
                    <span className="text-[10px] text-gray-500 font-medium">Dashboard Overview</span>
                  </div>
                </Link>

                <Link to="/test-tracker" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/5 group">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg shadow-indigo-500/10">
                    <FaChartLine />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">Analytics</span>
                    <span className="text-[10px] text-gray-500 font-medium">Test Stats & Insights</span>
                  </div>
                </Link>

                <Link to="/arena" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/5 group">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-lg shadow-primary-500/10">
                    <FiLayers />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">Syllabus Arena</span>
                    <span className="text-[10px] text-gray-500 font-medium">Recursive Roadmap</span>
                  </div>
                </Link>

                <Link to="/tasks" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/5 group">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary-500/10 text-secondary-400 group-hover:bg-secondary-500 group-hover:text-white transition-all shadow-lg shadow-secondary-500/10">
                    <FaTasks />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">Tasks</span>
                    <span className="text-[10px] text-gray-500 font-medium">Manage Your Tasks</span>
                  </div>
                </Link>

                <Link to="/timer" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/5 group">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-lg shadow-primary-500/10 relative">
                    <FaClock />
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary-500 rounded-full border-2 border-slate-900"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                       <span className="text-sm">Focus Arena</span>
                       <span className="bg-primary-500 text-[7px] px-1.5 py-0.5 rounded-full text-white font-black animate-pulse">NEW</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">Deep Work Timer</span>
                  </div>
                </Link>

                <div className="mt-4 pt-6 border-t border-white/5 space-y-4 opacity-40 grayscale pointer-events-none">
                  <div className="px-4 flex items-center gap-4">
                    <FaStickyNote className="text-lg" /> <span className="text-sm font-bold">Cloud Notes (Soon)</span>
                  </div>
                </div>
              </div>

              {/* Footer / Account */}
              <div className="p-6 mt-auto bg-black/20 border-t border-white/5">
                 <Link 
                   to="/profile" 
                   onClick={() => setMobileMenuOpen(false)}
                   className="flex items-center gap-4 mb-6 group"
                 >
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt="User" className="w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-xl" />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-gray-500 text-2xl">
                        <FaUserCircle />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{user.firstName || "Aspirant"}</span>
                        {/* Mobile Badge */}
                        {user.isEmailVerified ? (
                           <HiCheckCircle className="text-emerald-500 text-sm" />
                        ) : (
                           <HiClock className={getRemainingGraceHours(user) > 0 ? "text-amber-500 text-sm" : "text-rose-500 text-sm"} />
                        )}
                      </div>
                      <span className="text-[10px] text-primary-400 font-black uppercase tracking-widest group-hover:text-primary-300 transition-colors">View Profile &rarr;</span>
                    </div>
                 </Link>

                 <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-black uppercase tracking-widest text-[10px] border border-rose-500/20 shadow-lg shadow-rose-950/20"
                  >
                    <FaSignOutAlt />
                    <span>Sign Out</span>
                  </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
