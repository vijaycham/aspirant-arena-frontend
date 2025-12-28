import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  FaInfoCircle,
  FaBars,
  FaTimes,
  FaChartLine,
} from "react-icons/fa";
import { signOut } from "../redux/user/authSlice";
import api from "../utils/api";
//import SearchBar from "./SearchBar";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user.currentUser);
  const isAuthenticated = !!user;
  //const [searchQuery, SetSearchQuery] = useState("");

  // 📱 Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 📱 Toggle Mobile Menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // 🏁 Sign Out Handler
  const handleSignOut = async () => {
    try {
      await api.post("/auth/signout", {});
      // Dispatch Redux action to clear user state
      dispatch(signOut());

      // Ensure persistor is cleared properly
      await persistor.purge();
      await persistor.flush();

      // Manually clear the authentication cookie
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      //  dispatch({ type: "RESET_AUTH" });
      // Redirect to Sign In page
      navigate("/signin");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // const handleSearch = () => {};
  // const onClearSearch = () => {
  //   SetSearchQuery("");
  // };

  return (
    <header className="sticky top-0 z-50 bg-[#f8fafc]/95 backdrop-blur-md border-b border-slate-200 dark:bg-gray-900/95 dark:border-slate-800 transition-all duration-300">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg group-hover:shadow-primary/50 transition-all duration-300">
             <img
              src={logo}
              alt="Aspirant Arena Logo"
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent hidden sm:block">
            Aspirant Arena
          </span>
        </Link>

        {/* 📱 Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden text-2xl text-gray-700 hover:text-primary-600 focus:outline-none transition-colors"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* 🌍 Navigation Menu */}
        <nav
          className={`lg:flex items-center space-x-8 ${
            mobileMenuOpen
              ? "absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 py-6 px-6 flex flex-col shadow-xl"
              : "hidden lg:flex"
          }`}
        >
          <ul className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8 text-white font-medium">
            {/* 🏠 Home */}
            {isAuthenticated && (
              <li>
                <Link
                  to="/"
                  className="flex items-center gap-2 hover:text-primary-600 transition-colors duration-300 relative group"
                >
                  <FaHome className="text-lg" /> <span>Home</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
            )}

            {/* ✅ To-Do */}
            {isAuthenticated && (
              <li>
                <Link
                  to="/todo"
                  className="flex items-center gap-2 hover:text-primary-600 transition-colors duration-300 relative group"
                >
                  <FaTasks className="text-lg" /> <span>To-Do</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
            )}

            {/* 📊 Performance */}
            {isAuthenticated && (
              <li>
                <Link
                  to="/test-tracker"
                  className="flex items-center gap-2 hover:text-primary-600 transition-colors duration-300 relative group"
                >
                  <FaChartLine className="text-lg" /> <span>Performance</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
            )}

            {/* 📝 Notes (Coming Soon) */}
            {isAuthenticated && (
              <li className="opacity-50 cursor-not-allowed group relative">
                <div className="flex items-center gap-2">
                  <FaStickyNote /> <span>Notes</span>
                </div>
                 <span className="absolute -top-3 -right-3 text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-500">Soon</span>
              </li>
            )}

            {/* ⏳ Timer (Coming Soon) */}
            {isAuthenticated && (
              <li className="opacity-50 cursor-not-allowed group relative">
                <div className="flex items-center gap-2">
                  <FaClock /> <span>Timer</span>
                </div>
                <span className="absolute -top-3 -right-3 text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-500">Soon</span>
              </li>
            )}

            {/* ℹ️ About Us */}
            {!isAuthenticated &&
              (location.pathname === "/signin" ||
                location.pathname === "/signup") && (
                <li>
                  <Link
                    to="/about"
                    className="flex items-center gap-2 hover:text-primary-600 transition-colors duration-300"
                  >
                    <FaInfoCircle /> <span>About Us</span>
                  </Link>
                </li>
              )}

            {/* 👤 Profile */}
            {isAuthenticated && (
              <li>
                <Link
                  to="/profile"
                  className="block p-0.5 rounded-full border-2 border-transparent hover:border-primary-500 transition-all"
                >
                  {user.photoUrl ? (
                    <img
                      src={user.photoUrl}
                      alt="User"
                      className="w-9 h-9 object-cover rounded-full"
                    />
                  ) : (
                    <FaUserCircle className="text-3xl text-gray-400 hover:text-primary-600 transition-colors" />
                  )}
                </Link>
              </li>
            )}
          </ul>

          {/* 🔑 Sign In / Out Buttons */}
          <div className="mt-6 lg:mt-0 flex flex-col lg:flex-row gap-4">
            {!isAuthenticated ? (
              location.pathname === "/signin" ? (
                <Link
                  to="/signup"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-95 transition-all duration-300 text-center"
                >
                  Get Started
                </Link>
              ) : (
                <Link
                  to="/signin"
                  className="px-6 py-2.5 rounded-xl bg-white text-gray-700 border border-gray-200 font-medium hover:bg-gray-50 hover:text-primary-600 transition-all duration-300 text-center"
                >
                  Sign In
                </Link>
              )
            ) : (
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-300 font-medium"
              >
                <FaSignOutAlt />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
