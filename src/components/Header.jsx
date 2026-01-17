import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  FaBars, 
  FaTimes, 
  FaUserCircle, 
  FaHome, 
  FaChartLine, 
  FaTrophy, 
  FaTasks, 
  FaClock 
} from "react-icons/fa";
import { FiLayers } from "react-icons/fi";
import { HiCheckCircle, HiXCircle, HiClock } from "react-icons/hi";
import { AnimatePresence, motion } from "framer-motion";

import logo from "../../assets/3.png";
import ThemeToggle from "./ThemeToggle";
import api from "../utils/api";
import { signOut } from "../redux/user/authSlice";
import { persistor } from "../redux/store";
import { getRemainingGraceHours } from "../utils/auth/verifyHelpers";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.currentUser);
  const isAuthenticated = !!user;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // 🖱️ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ⌨️ Close dropdown on Escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleSignOut = async () => {
    try {
      await api.post("/auth/signout", {});
      dispatch(signOut());
      await persistor.purge();
      await persistor.flush();
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      navigate("/signin");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 font-outfit">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden shadow-lg shadow-primary-500/20">
              <img src={logo} alt="Aspirant Arena" className="w-full h-full object-cover" />
            </div>
            <span className="hidden sm:block text-lg font-black uppercase tracking-tight text-white">
              Aspirant Arena
            </span>
          </Link>

          {/* ================= DESKTOP NAV (Right Aligned & Calmer) ================= */}
          {isAuthenticated && (
            <div className="hidden xl:flex items-center gap-8 ml-auto mr-12 text-sm font-bold text-white/70">
              <Link to="/" className="hover:text-primary-400 transition-colors">Home</Link>
              <Link to="/test-tracker" className="hover:text-primary-400 transition-colors">Analytics</Link>
              <Link to="/arena" className="hover:text-primary-400 transition-colors">Arena</Link>
              <Link to="/tasks" className="hover:text-primary-400 transition-colors">Tasks</Link>
              <Link to="/timer" className="hover:text-primary-400 transition-colors">Focus</Link>
            </div>
          )}

          {/* ================= ACTIONS ================= */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <nav className="hidden lg:flex items-center gap-6">
                <Link to="/about" className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                  About
                </Link>
                <Link
                  to="/signin"
                  className="px-6 py-2 rounded-xl bg-white text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all shadow-lg"
                >
                  Login
                </Link>
              </nav>
            ) : (
              <div className="flex items-center gap-4">
                <ThemeToggle className="hidden xl:block" />

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="hidden lg:flex items-center gap-2 transition-opacity hover:opacity-80"
                    aria-label="User Menu"
                  >
                    {user.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt="User"
                        className="w-8 h-8 rounded-full border border-white/10"
                      />
                    ) : (
                      <FaUserCircle className="text-2xl text-gray-400" />
                    )}
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 py-1"
                      >
                        <div className="px-4 py-3 border-b border-white/5 mb-1">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Account Context</p>
                          <p className="text-sm font-bold text-white truncate">{user.firstName} {user.lastName}</p>
                          <p className="text-[10px] text-gray-500 truncate mt-0.5">{user.emailId}</p>
                          
                          {/* Verification in Dropdown (Clean) */}
                          <div className="mt-2 text-[10px] font-black uppercase tracking-widest">
                            {user.isEmailVerified ? (
                              <span className="text-emerald-500 flex items-center gap-1">
                                <HiCheckCircle /> Verified Profile
                              </span>
                            ) : (
                              <span className={getRemainingGraceHours(user) > 0 ? "text-amber-500 flex items-center gap-1" : "text-rose-500 flex items-center gap-1"}>
                                {getRemainingGraceHours(user) > 0 ? <HiClock /> : <HiXCircle />} 
                                {getRemainingGraceHours(user) > 0 ? "Grace Period" : "Unverified Access"}
                              </span>
                            )}
                          </div>
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors font-bold"
                        >
                          View Profile
                        </Link>
                        <Link
                          to="/leaderboard"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors font-bold"
                        >
                          Leaderboard
                        </Link>
                        <Link
                          to="/feedback"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors font-bold"
                        >
                          Feedback & Support
                        </Link>
                        <div className="h-px bg-white/5 my-1" />
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors font-bold"
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Mobile Actions */}
            <div className="lg:hidden flex items-center gap-3">
              {isAuthenticated && <ThemeToggle />}
              {isAuthenticated && (
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-xl text-white/80"
                >
                  <FaBars />
                </button>
              )}
              {!isAuthenticated && (
                <Link to="/signin" className="px-5 py-2 rounded-xl bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ================= MOBILE DRAWER (UNCHANGED PREMIUM UX) ================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[60]"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-slate-900 border-l border-white/5 z-[70] flex flex-col font-outfit"
            >
              {/* Header */}
              <div className="p-6 flex justify-between items-center border-b border-white/5">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Aspirant Navigation</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-white/60">
                  <FaTimes />
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white font-bold border border-white/5 group">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-lg">
                    <FaHome />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">Home</span>
                    <span className="text-[10px] text-gray-500 font-medium">Dashboard Overview</span>
                  </div>
                </Link>

                <Link to="/test-tracker" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white font-bold border border-white/5 group">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg">
                    <FaChartLine />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">Analytics</span>
                    <span className="text-[10px] text-gray-500 font-medium">Test Stats & Insights</span>
                  </div>
                </Link>

                <Link to="/leaderboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white font-bold border border-white/5 group">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white transition-all shadow-lg">
                    <FaTrophy />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">Leaderboard</span>
                    <span className="text-[10px] text-gray-500 font-medium">Top Performers</span>
                  </div>
                </Link>

                <Link to="/arena" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white font-bold border border-white/5 group">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-lg">
                    <FiLayers />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">Syllabus Arena</span>
                    <span className="text-[10px] text-gray-500 font-medium">Recursive Roadmap</span>
                  </div>
                </Link>

                <Link to="/tasks" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white font-bold border border-white/5 group">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary-500/10 text-secondary-400 group-hover:bg-secondary-500 group-hover:text-white transition-all shadow-lg">
                    <FaTasks />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">Tasks</span>
                    <span className="text-[10px] text-gray-500 font-medium">Manage Your Tasks</span>
                  </div>
                </Link>

                <Link to="/timer" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white font-bold border border-white/5 group">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-lg relative">
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
                       <span className="bg-primary-500 text-[7px] px-1.5 py-0.5 rounded-full text-white font-black">NEW</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">Deep Work Timer</span>
                  </div>
                </Link>

                <Link to="/feedback" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white font-bold border border-white/5 group">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-lg">
                    <FaTasks />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">Feedback & Support</span>
                    <span className="text-[10px] text-gray-500 font-medium">Reach out to us</span>
                  </div>
                </Link>
              </div>

              {/* Footer Account Section */}
              <div className="p-6 mt-auto bg-black/20 border-t border-white/5">
                 <Link 
                   to="/profile" 
                   onClick={() => setMobileMenuOpen(false)}
                   className="flex items-center gap-4 mb-6 group"
                 >
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt="User" className="w-12 h-12 rounded-2xl object-cover border border-white/10" />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-gray-500 text-2xl">
                        <FaUserCircle />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{user.firstName}</span>
                        {user.isEmailVerified ? <HiCheckCircle className="text-emerald-500" /> : <HiClock className="text-amber-500" />}
                      </div>
                      <span className="text-[10px] text-primary-400 font-black uppercase tracking-widest">Profile &rarr;</span>
                    </div>
                 </Link>

                 <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-4 rounded-2xl bg-rose-500/10 text-rose-500 font-black uppercase tracking-widest text-[10px] border border-rose-500/20"
                  >
                    Sign Out
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
