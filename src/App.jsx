import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import ToDo from "./pages/ToDo";
import Notes from "./pages/Notes";
import Timer from "./pages/Timer";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Header />
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/todo" element={<ToDo />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/timer" element={<Timer />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
