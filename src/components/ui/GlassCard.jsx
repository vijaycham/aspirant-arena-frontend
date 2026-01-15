import React from "react";
import { motion } from "framer-motion";

const GlassCard = ({ children, className = "", delay = 0, noAnimate = false }) => {
  const baseClasses = 
    "bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-xl shadow-gray-200/50 dark:shadow-black/20 rounded-[2rem] overflow-hidden";

  if (noAnimate) {
    return <div className={`${baseClasses} ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`${baseClasses} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
