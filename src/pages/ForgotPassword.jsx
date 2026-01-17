import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../utils/api";

const ForgotPassword = () => {
  const [emailId, setEmailId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailId) {
      toast.error("Please enter your email address");
      return;
    }
    
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(emailId)) {
      toast.error("Invalid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { emailId });
      setIsSent(true);
      toast.success("Reset link sent to your email!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-gray-50 relative overflow-hidden font-outfit">
      {/* Background Decor - consistent with SignIn */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[25%] w-[40%] h-[40%] rounded-full bg-primary-200/20 blur-[120px] opacity-60 mix-blend-multiply animate-blob"></div>
        <div className="absolute bottom-[20%] right-[25%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-[120px] opacity-60 mix-blend-multiply animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] p-8 md:p-10 border border-white/60">
        <div className="text-center mb-10 space-y-2">
           <div className="inline-block p-3 rounded-2xl bg-primary-50 text-primary-500 mb-4 shadow-sm">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 16.293a1 1 0 01-.175.243l-1.914 1.914a2 2 0 01-2.828 0l-.828-.828a2 2 0 010-2.828l.75-2.829a1 1 0 00-.083-1.03l-1.144-1.306a6 6 0 011.082-8.527 2 2 0 012.756-.398h-.001z" />
             </svg>
           </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Forgot Password?</h1>
          <p className="text-gray-500 font-medium text-sm">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <input
                id="emailId"
                type="email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                required
                className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 font-medium placeholder-gray-400 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                placeholder="Email Address"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold shadow-xl shadow-slate-900/20 hover:bg-black hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6 animate-fade-in">
             <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-4xl shadow-sm">
               ✉️
             </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Check your email</h3>
              <p className="text-sm text-gray-500">
                We&apos;ve sent a password reset link to your inbox. Please follow the link to continue.
              </p>
            </div>
            <button
              onClick={() => setIsSent(false)}
              className="text-primary-600 hover:text-primary-700 text-sm font-bold hover:underline"
            >
              Click here to try another email
            </button>
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/signin" className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors">
            <span>←</span> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
