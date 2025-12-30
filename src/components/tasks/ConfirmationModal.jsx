import { motion, AnimatePresence } from "framer-motion";

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger" // danger or primary
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 text-center space-y-6"
          >
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-2xl ${
              type === "danger" ? "bg-rose-50" : "bg-primary-50"
            }`}>
              {type === "danger" ? "⚠️" : "ℹ️"}
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{title}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {message}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={onConfirm}
                className={`w-full py-4 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs ${
                  type === "danger" ? "bg-gray-900 hover:bg-black" : "bg-primary-600 hover:bg-primary-700"
                }`}
              >
                {confirmText}
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
              >
                {cancelText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
