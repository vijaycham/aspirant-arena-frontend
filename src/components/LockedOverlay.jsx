import { HiLockClosed, HiShieldCheck } from "react-icons/hi";
import { motion } from "framer-motion";

const LockedOverlay = ({ message }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`absolute inset-0 z-20 backdrop-blur-[6px] bg-white/40 flex items-center justify-center rounded-[3rem] border border-white/50 overflow-hidden`}
    >
      <div className="text-center p-8 space-y-4 max-w-[280px]">
        <div className="inline-flex p-4 bg-amber-100 rounded-[2rem] text-amber-600 shadow-inner">
          <HiLockClosed className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-black text-gray-900 leading-tight">
          Verification Required
        </h3>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
          {message || "Please verify your email to unlock all strategy tools and task analytics."}
        </p>
        <div className="pt-2">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-amber-200 uppercase tracking-wider">
             <HiShieldCheck className="h-4 w-4" />
             Security Locked
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LockedOverlay;
