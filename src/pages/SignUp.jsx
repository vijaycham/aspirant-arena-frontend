import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import OAuth from "../components/OAuth";
import { useSelector } from "react-redux";

const API_URL = "https://aspirant-arena-backend-production.up.railway.app";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  // 🚀 Redirect if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token || currentUser) {
      navigate("/"); // Redirect to home or dashboard
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation: Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `
        ${API_URL}/api/auth/signup`,
        formData
      );

      console.log("Sign Up success!", res.data.message);
      setLoading(false);
      setError(""); // Clear error if successful

      navigate("/signin"); // Redirect to sign-in page after successful sign-up
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data.error) {
        setError(error.response.data.error); // Show backend error message
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
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
