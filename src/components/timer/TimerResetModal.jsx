import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCalendarDay } from "react-icons/fa";

const TimerResetModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 border border-white z-10 text-center"
          >
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCalendarDay className="text-rose-500 text-2xl" />
            </div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-2">Reset Analytics?</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 px-4 leading-relaxed">
              This will clear your focus minutes and sessions for today. Historical data is safe. Proceed?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={onConfirm}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-black transition-all"
              >
                Yes, Reset Day
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 text-[9px] font-black uppercase text-gray-400 tracking-widest"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TimerResetModal;
