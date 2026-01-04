import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { HiOutlineMail, HiInformationCircle, HiCheckCircle } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import toast from "react-hot-toast";
import { getRemainingGraceHours } from "../utils/auth/verifyHelpers";

const VerificationBanner = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Persistence Key
  const storageKey = `resend_cooldown_${currentUser?._id}`;

  // Initialize countdown from localStorage on mount
  useEffect(() => {
    const savedExpiry = localStorage.getItem(storageKey);
    if (savedExpiry) {
      const remaining = Math.ceil((parseInt(savedExpiry) - Date.now()) / 1000);
      if (remaining > 0) {
        setCountdown(remaining);
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  }, [currentUser?._id, storageKey]);

  // Handle countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            localStorage.removeItem(storageKey);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown, storageKey]);

  // Hidden if not logged in or already verified
  if (!currentUser || currentUser.isEmailVerified) return null;

  const handleResend = async () => {
    if (loading || countdown > 0) return; // Prevent double clicks and respect cooldown
    
    try {
      setLoading(true);
      const res = await api.post("/auth/resend-verification");
      toast.success(res.message || "Verification link sent to your email!");
      
      const expiry = Date.now() + 60000;
      localStorage.setItem(storageKey, expiry.toString());
      setCountdown(60); // 60 seconds cooldown
    } catch (error) {
      // Detailed error logging
      console.error("Resend Error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to resend link.";
      toast.error(errorMsg);
      
      // If the error is "Too many requests", still trigger some cooldown
      if (error.response?.status === 429) {
        setCountdown(30);
        localStorage.setItem(storageKey, (Date.now() + 30000).toString());
      }
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
              Please <span className="font-bold uppercase tracking-tight text-amber-900">check your inbox</span> at <span className="font-semibold underline">{currentUser.emailId}</span> for the verification link. 
              {getRemainingGraceHours(currentUser) > 0 ? (
                <span> You have <span className="font-bold underline">{getRemainingGraceHours(currentUser)} hours</span> left to verify before features are locked.</span>
              ) : (
                <span className="text-rose-600 font-bold"> Grace period expired! Features are locked.</span>
              )} 
              <span className="block text-[10px] opacity-70 italic font-bold uppercase tracking-wider mt-1">
                (Don't forget to check your Spam folder! 📥)
              </span>
            </p>
          </div>
          
          <button
            onClick={handleResend}
            disabled={loading || countdown > 0}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg ${
              countdown > 0 
                ? "bg-emerald-600 shadow-emerald-200" 
                : "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
            }`}
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : countdown > 0 ? (
              <HiCheckCircle className="h-4 w-4" />
            ) : (
              <HiInformationCircle className="h-4 w-4" />
            )}
            {loading 
              ? "Sending..." 
              : countdown > 0 
                ? `Email Sent (${countdown}s)` 
                : "Resend Verification Link"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VerificationBanner;
