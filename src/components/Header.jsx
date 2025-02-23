import React from "react";
import { Link , useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signOut } from "../redux/user/userSlice";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSingOut = () => {
    dispatch(signOut());
    localStorage.removeItem("token");
    navigate("/signin");
    

  };

  return (
    <div className="bg-orange-200 h-14 px-6 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold">
        <Link to="/" className="hover:text-orange-700">
          Aspirant Arena
        </Link>
      </h1>

      <div className="flex items-center space-x-4">
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="hover:text-orange-700">
              Home
            </Link>
          </li>
          <li>
            <Link to="/todo" className="hover:text-orange-700">
              ToDo
            </Link>
          </li>
          <li>
            <Link to="/notes" className="hover:text-blue-700">
              Notes
            </Link>
          </li>
          <li>
            <Link to="/timer" className="hover:text-blue-700">
              Timer
            </Link>
          </li>
          <li>
            <Link to="/profile" className="hover:text-blue-700">
              Profile
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-orange-700">
              About Us
            </Link>
          </li>
        </ul>

        <button
          onClick={handleSingOut}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Header;
