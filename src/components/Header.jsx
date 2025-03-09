import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
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
} from "react-icons/fa";
import { signOut } from "../redux/user/authSlice";
import axios from "axios";
const API_URL = import.meta.env.VITE_BACKEND_URL;

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user.currentUser);
  const isAuthenticated = !!user;

  // 📱 Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 📱 Toggle Mobile Menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // 🏁 Sign Out Handler
  const handleSignOut = async () => {
    try {
      await axios.post(
        `${API_URL}/api/auth/signout`,
        {},
        { withCredentials: true }
      );
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

  return (
    <header className="bg-peach-200 text-gray-800 shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="w-40 h-12 rounded-2xl overflow-hidden flex items-center">
          <Link to="/">
            <img
              src={logo}
              alt="Aspirant Arena Logo"
              className="w-full object-cover scale-110 rounded-2xl transition-transform duration-300"
            />
          </Link>
        </div>

        {/* 📱 Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden text-2xl focus:outline-none"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* 🌍 Navigation Menu */}
        <nav
          className={`lg:flex items-center space-x-6 ${
            mobileMenuOpen
              ? "block absolute top-16 left-48 w-full bg-peach-200 py-4 px-6"
              : "hidden lg:flex"
          }`}
        >
          <ul className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* 🏠 Home */}
            {isAuthenticated && (
              <li>
                <Link
                  to="/"
                  className="flex items-center space-x-2 hover:text-orange-600 transition duration-300"
                >
                  <FaHome /> <span>Home</span>
                </Link>
              </li>
            )}

            {/* ✅ To-Do */}
            {isAuthenticated && (
              <li>
                <Link
                  to="/todo"
                  className="flex items-center space-x-2 hover:text-orange-600 transition duration-300"
                >
                  <FaTasks /> <span>To-Do</span>
                </Link>
              </li>
            )}

            {/* 📝 Notes (Coming Soon) */}
            {isAuthenticated && (
              <li className="opacity-50 cursor-not-allowed">
                <div className="flex items-center space-x-2">
                  <FaStickyNote className="text-gray-500" /> <span>Notes</span>
                </div>
              </li>
            )}

            {/* ⏳ Timer (Coming Soon) */}
            {isAuthenticated && (
              <li className="opacity-50 cursor-not-allowed">
                <div className="flex items-center space-x-2">
                  <FaClock className="text-gray-500" /> <span>Timer</span>
                </div>
              </li>
            )}

            {/* ℹ️ About Us - Only on Sign In / Sign Up pages */}
            {!isAuthenticated &&
              (location.pathname === "/signin" ||
                location.pathname === "/signup") && (
                <li>
                  <Link
                    to="/about"
                    className="flex items-center space-x-2 hover:text-orange-600 transition duration-300"
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
                  className="hover:text-orange-600 transition duration-300"
                >
                  {user.photoUrl ? (
                    <img
                      src={user.photoUrl}
                      alt="User"
                      className="w-10 h-10 object-cover rounded-full border-2"
                    />
                  ) : (
                    <FaUserCircle className="text-3xl text-gray-700" />
                  )}
                </Link>
              </li>
            )}
          </ul>

          {/* 🔑 Sign In / Out Buttons */}
          <div className="mt-4 lg:mt-0">
            {!isAuthenticated ? (
              location.pathname === "/signin" ? (
                <Link
                  to="/signup"
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition duration-300 text-sm font-semibold"
                >
                  Sign Up
                </Link>
              ) : (
                <Link
                  to="/signin"
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition duration-300 text-sm font-semibold"
                >
                  Sign In
                </Link>
              )
            ) : (
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition duration-300 text-sm font-semibold"
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
