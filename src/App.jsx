import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Feedback from "./pages/Feedback";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import Tasks from "./pages/Tasks";
import Notes from "./pages/Notes";
import Timer from "./pages/Timer";
import TestTracker from "./pages/TestTracker";
import ArenaDashboard from "./pages/ArenaDashboard";
import Leaderboard from "./pages/Leaderboard";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import VerificationBanner from "./components/VerificationBanner";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "./redux/user/authSlice";
import api from "./utils/api";
import { useEffect } from "react";

const App = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // 🔄 Sync user profile (especially verification status) when window gains focus
  useEffect(() => {
    const syncProfile = async () => {
      if (!currentUser) return;
      try {
        const res = await api.get("/profile");
        if (res.status === "success" && res.data.user) {
          dispatch(updateProfile(res.data.user));
        }
      } catch (err) {
        console.error("Profile sync failed:", err);
      }
    };

    window.addEventListener("focus", syncProfile);
    return () => window.removeEventListener("focus", syncProfile);
  }, [currentUser, dispatch]);

  return (
    <>
      <ScrollToTop />
      <ToastContainer position="top-right" autoClose={3000} />
      <VerificationBanner />
      <Header />
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={currentUser ? <Home /> : <Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />

          <Route path="/tasks" element={<Tasks />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/test-tracker" element={<TestTracker />} />
          <Route path="/arena" element={<ArenaDashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
