import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiCheckCircle, HiXCircle, HiRefresh } from "react-icons/hi";
import api from "../utils/api";
import { useDispatch } from "react-redux";
import { updateProfile } from "../redux/user/authSlice";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await api.get(`/auth/verify/${token}`);
        setStatus("success");
        setMessage(res.message || "Email verified successfully!");
        // Update local Redux state so the UI knows user is verified
        dispatch(updateProfile({ isEmailVerified: true }));
        toast.success("Email verified successfully!");
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message || "Verification failed. Token may be invalid or expired."
        );
      }
    };
    verifyToken();
  }, [token, dispatch]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 font-outfit">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-10 text-center border border-gray-100"
      >
        {status === "verifying" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <HiRefresh className="h-16 w-16 text-primary-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Verifying Email</h2>
            <p className="text-gray-500 font-medium">Please wait while we confirm your email address...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <HiCheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Email Verified!</h2>
            <p className="text-gray-500 font-medium">{message}</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center w-full px-8 py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <HiXCircle className="h-16 w-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Verification Failed</h2>
            <p className="text-gray-500 font-medium">{message}</p>
            <div className="space-y-3">
               <Link
                to="/"
                className="inline-flex items-center justify-center w-full px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
              >
                Go Home
              </Link>
              <p className="text-xs text-gray-400">
                You can try resending the verification email from your profile.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
