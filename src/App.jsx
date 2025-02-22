import { Routes, Route,} from "react-router-dom";
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

const App = () => {
 

  return (
    <>
      
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/todo" element={<ToDo />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/timer" element={<Timer />} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </>
  );
};

export default App;
