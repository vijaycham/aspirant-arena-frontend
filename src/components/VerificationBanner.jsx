import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { HiOutlineMail, HiInformationCircle } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import toast from "react-hot-toast";

const VerificationBanner = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);

  // Hidden if not logged in or already verified
  if (!currentUser || currentUser.isEmailVerified) return null;

  const handleResend = async () => {
    if (loading) return; // Prevent double clicks
    
    try {
      setLoading(true);
      const res = await api.post("/auth/resend-verification");
      toast.success(res.message || "Verification link sent to your email!");
    } catch (error) {
      // Detailed error logging
      console.error("Resend Error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to resend link.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-amber-50 border-b border-amber-100 overflow-hidden font-outfit"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <HiOutlineMail className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-amber-800">
              Your email <span className="font-semibold underline">{currentUser.emailId}</span> is not verified. 
            </p>
          </div>
          
          <button
            onClick={handleResend}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 text-white text-xs font-black uppercase tracking-wider hover:bg-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-200"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <HiInformationCircle className="h-4 w-4" />
            )}
            {loading ? "Sending..." : "Resend Verification Link"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VerificationBanner;
