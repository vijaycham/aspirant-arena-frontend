import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import OAuth from "../components/OAuth";
import { useSelector, useDispatch } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/authSlice";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector((state) => state.user);

  // 🚀 Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation: Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      dispatch(signInFailure("Passwords do not match."));
      return;
    }

    try {
      dispatch(signInStart());
      const res = await axios.post(`${API_URL}/api/auth/signup`, formData, {
        withCredentials: true,
      });

      dispatch(signInSuccess(res.data.userProfile)); // Store user in Redux
      navigate("/");
    } catch (error) {
      dispatch(
        signInFailure(
          error.response?.data?.error || "An unexpected error occurred."
        )
      );
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold mt-8 mb-4">Sign Up</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-4 rounded-lg"
      >
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="First Name"
            id="firstName"
            className="bg-orange-50 p-2 rounded-lg w-full sm:w-1/2 outline-none focus:ring-2 focus:ring-orange-400"
            required
            onChange={handleChange}
          />
          <input
            type="text"
            placeholder="Last Name"
            id="lastName"
            className="bg-orange-50 p-2 rounded-lg w-full sm:w-1/2 outline-none focus:ring-2 focus:ring-orange-400"
            required
            onChange={handleChange}
          />
        </div>

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

        <input
          type="password"
          placeholder="Confirm Password"
          id="confirmPassword"
          className="bg-orange-50 p-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-orange-400"
          required
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 text-white p-2 rounded-lg uppercase hover:bg-orange-600 w-full"
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>
        <OAuth />
      </form>
      {error && <p className="text-red-700 text-sm">* {error}</p>}
      <div className="flex justify-center gap-2 mt-5">
        <p>Have an account?</p>
        <Link to="/signin">
          <span className="text-blue-500 hover:underline">Sign in</span>
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
