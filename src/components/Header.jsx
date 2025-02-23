import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { signOut } from "../redux/user/userSlice";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user.currentUser);

  const isAuthenticated = !!user;
  console.log("User Data:", user);

  const handleSignOut = () => {
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

      <div className="flex items-center  object-center space-x-4">
        <ul className="flex space-x-4">
          <li>
            <Link to="/about" className="hover:text-orange-700">
              About Us
            </Link>
          </li>
          {isAuthenticated && (
            <>
              {" "}
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
                  {user.photoUrl ? (
                    <img
                      src={user.photoUrl}
                      alt="User"
                      className="w-9 h-9 object-cover rounded-full"
                    />
                  ) : (
                    "Profile"
                  )}
                </Link>
              </li>
            </>
          )}
        </ul>
        {!isAuthenticated ? (
          location.pathname === "/signin" ? (
            <Link
              to="/signup"
              className="bg-orange-500 text-white text-xs px-2 py-1 rounded-md hover:bg-orange-600"
            >
              Sign Up
            </Link>
          ) : (
            <Link
              to="/signin"
              className="bg-orange-500 text-white text-xs px-2 py-1 rounded-md hover:bg-orange-600"
            >
              Sign In
            </Link>
          )
        ) : (
          <button
            onClick={handleSignOut}
            className="bg-orange-500 text-white text-xs px-2 py-1 rounded-md hover:bg-orange-600"
          >
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
