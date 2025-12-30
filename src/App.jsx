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
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";

const App = () => {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Header />
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={currentUser ? <Home /> : <Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />

          <Route path="/tasks" element={<Tasks />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/test-tracker" element={<TestTracker />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
