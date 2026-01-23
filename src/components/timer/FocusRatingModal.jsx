import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaRegStar, FaTimes } from "react-icons/fa";

const FocusRatingModal = ({ isOpen, onClose, onComplete, sessionData }) => {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(null);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(rating, notes);
  };

  const getRatingText = (val) => {
    switch (val) {
      case 1: return "Highly Distracted 📵";
      case 2: return "Partially Focused 🔍";
      case 3: return "Good Progress 📚";
      case 4: return "In the Zone 🔥";
      case 5: return "Legendary Focus 👑";
      default: return "Rate your focus";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            // onClick={onClose} // Removed background click as per user request
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl z-10 p-6 md:p-8 border border-white dark:border-white/10 font-outfit"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 md:top-8 md:right-8 text-gray-400 hover:text-rose-500 transition-colors z-20"
            >
              <FaTimes size={18} />
            </button>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-primary-600 dark:text-primary-400">🎯</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Mission Accomplished!</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 px-6 leading-relaxed">
                You just crushed a {sessionData?.seconds ? Math.floor(sessionData.seconds / 60) : 0}-minute session. How was the intensity?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(null)}
                      className="text-4xl transition-all duration-200 transform hover:scale-125 active:scale-95"
                    >
                      {star <= (hover || rating) ? (
                        <FaStar className="text-amber-400 drop-shadow-sm" />
                       ) : (
                        <FaRegStar className="text-gray-200" />
                      )}
                    </button>
                  ))}
                </div>
                <motion.p
                  key={hover || rating}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-black text-primary-600 uppercase tracking-wider h-4"
                >
                  {getRatingText(hover || rating)}
                </motion.p>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Notes & Insights (Optional)</label>
                <textarea
                  placeholder="What was the core takeaway? Any distractions?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 text-sm font-medium outline-none text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-primary-200 dark:focus:border-primary-600 focus:ring-4 focus:ring-primary-500/5 transition-all min-h-[100px] resize-none"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary-500/20 hover:bg-primary-700 active:scale-[0.98] transition-all"
                >
                  Log Session Data
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 text-[10px] font-black uppercase text-gray-400 tracking-widest hover:text-rose-500"
                >
                  Skip Rating (Auto-Save 3★)
                </button>
                <p className="text-[9px] text-gray-400 text-center font-medium mt-[-4px]">
                  Closing will save this session as &ldquo;Average Focus&rdquo;.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FocusRatingModal;
