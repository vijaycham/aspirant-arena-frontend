import React, { useState, useEffect } from "react";
import OAuth from "../components/OAuth";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/authSlice";
import { useDispatch, useSelector } from "react-redux";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const SignIn = () => {
  const [formData, setFormData] = useState({
    emailId: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (currentUser) {
      navigate("/"); // Redirect if user is already logged in
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());

      const res = await axios.post(`${API_URL}/api/auth/signin`, formData, {
        withCredentials: true,
      });
     

      dispatch(signInSuccess(res.data.userProfile)); // Store user in Redux
      navigate("/"); // Redirect after login
    } catch (error) {
      dispatch(signInFailure(error.response?.data?.error || "An unexpected error occurred."));
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold mt-8 mb-4">
        Welcome back
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-4 rounded-lg"
      >
        <input
          type="email"
          placeholder="Email"
          id="emailId"
          className="bg-orange-50 p-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-orange-400"
          required
          onChange={handleChange}
        />

        <input
          type="password"
          placeholder="Password"
          id="password"
          className="bg-orange-50 p-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-orange-400"
          required
          onChange={handleChange}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 text-white p-2 rounded-lg uppercase hover:bg-orange-600 w-full"
        >
          {loading ? "Loading..." : "Sign In"}
        </button>
        <OAuth />
      </form>
      {error && <p className="text-red-700 text-sm">* {error}</p>}
      <div className="flex justify-center gap-2 mt-5">
        <p>Don't have an account?</p>
        <Link to="/signup">
          <span className="text-blue-500 hover:underline">Sign Up</span>
        </Link>
      </div>
    </div>
  );
};

export default SignIn;
