import React, { useState, useEffect } from "react";
import OAuth from "../components/OAuth";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/authSlice";
import { useDispatch, useSelector } from "react-redux";

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

      const res = await api.post("/auth/signin", formData);
     

      dispatch(signInSuccess(res.userProfile)); // Store user in Redux
      navigate("/"); // Redirect after login
    } catch (error) {
      dispatch(signInFailure(error.response?.data?.message || error.response?.data?.error || "An unexpected error occurred."));
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-gray-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[25%] w-[40%] h-[40%] rounded-full bg-primary-200/30 blur-3xl opacity-50 mix-blend-multiply animate-blob"></div>
        <div className="absolute bottom-[20%] right-[25%] w-[40%] h-[40%] rounded-full bg-secondary-200/30 blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
             <input
              type="email"
              placeholder="Email Address"
              id="emailId"
              className="w-full px-5 py-3 rounded-xl bg-white border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all shadow-sm text-gray-700 placeholder-gray-400"
              required
              onChange={handleChange}
            />
          </div>

          <div>
             <input
              type="password"
              placeholder="Password"
              id="password"
              className="w-full px-5 py-3 rounded-xl bg-white border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all shadow-sm text-gray-700 placeholder-gray-400"
              required
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.01] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
          
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or continue with</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <OAuth />
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center">
             {error}
          </div>
        )}

        <div className="flex justify-center gap-2 mt-8 text-sm text-gray-600">
          <p>Don't have an account?</p>
          <Link to="/signup">
            <span className="text-primary-600 font-semibold hover:underline">Create Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
