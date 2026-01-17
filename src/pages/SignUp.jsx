import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import OAuth from "../components/OAuth";
import { useSelector, useDispatch } from "react-redux";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  signInStart,
  signInSuccess,
  signInFailure,
  clearError,
} from "../redux/user/authSlice";


const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector((state) => state.user);

  // 🚀 Redirect if user is already logged in
  useEffect(() => {
    dispatch(clearError());
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate, dispatch]);

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
      const res = await api.post("/auth/signup", formData);

      dispatch(signInSuccess(res.userProfile)); // Store user in Redux
      navigate("/");
    } catch (error) {
      dispatch(
        signInFailure(
          error.response?.data?.message || error.response?.data?.error || "An unexpected error occurred."
        )
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-gray-50 relative overflow-hidden font-outfit">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[25%] w-[40%] h-[40%] rounded-full bg-primary-200/20 blur-[120px] opacity-60 mix-blend-multiply animate-blob"></div>
        <div className="absolute bottom-[20%] left-[25%] w-[40%] h-[40%] rounded-full bg-secondary-200/20 blur-[120px] opacity-60 mix-blend-multiply animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg bg-white/80 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] p-8 md:p-10 border border-white/60">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-block p-3 rounded-2xl bg-primary-50 text-primary-500 mb-4 shadow-sm">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-gray-500 font-medium text-sm">Join the arena and start your productivity journey</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
           <div className="flex flex-col sm:flex-row gap-4">
             <input
              type="text"
              placeholder="First Name"
              id="firstName"
              className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 font-medium placeholder-gray-400 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
              required
              onChange={handleChange}
            />
             <input
              type="text"
              placeholder="Last Name"
              id="lastName"
              className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 font-medium placeholder-gray-400 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
              required
              onChange={handleChange}
            />
          </div>

          <div>
             <input
              type="email"
              placeholder="Email Address"
              id="emailId"
              className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 font-medium placeholder-gray-400 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
              required
              autoComplete="email"
              onChange={handleChange}
            />
          </div>

          <div>
             <div className="relative">
               <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                id="password"
                className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 font-medium placeholder-gray-400 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                required
                autoComplete="new-password"
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
             </div>
          </div>

          <div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                id="confirmPassword"
                className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 font-medium placeholder-gray-400 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                required
                autoComplete="new-password"
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex="-1"
              >
                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold shadow-xl shadow-slate-900/20 hover:bg-black hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
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
              "Sign Up"
            )}
          </button>
          
           <div className="relative flex py-3 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">Or continue with</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <OAuth />
        </form>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium text-center flex items-center justify-center gap-2">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 font-medium">Already have an account?</p>
          <Link to="/signin">
             <span className="text-primary-600 font-black hover:text-primary-700 transition-colors">Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
