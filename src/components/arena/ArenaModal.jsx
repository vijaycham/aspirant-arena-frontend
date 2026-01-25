import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertTriangle, FiPlus, FiTrash2 } from 'react-icons/fi';

const ArenaModal = ({ isOpen, onClose, type = 'create', onConfirm, arenaData }) => {
  const [inputValue, setInputValue] = React.useState('');
  const [selectedTemplate, setSelectedTemplate] = React.useState('upsc-gs'); // Default

  if (!isOpen) return null;

  const isDelete = type === 'delete';
  const isReset = type === 'reset';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isDelete) {
      const expected = (arenaData?.title || '').trim().toLowerCase();
      if (inputValue.trim().toLowerCase() === expected) {
        onConfirm();
        onClose();
      }
    } else if (isReset) {
      onConfirm();
      onClose();
    } else {
      if (inputValue.trim()) {
        // Pass both title and template
        onConfirm({ title: inputValue, templateId: selectedTemplate });
        onClose();
      }
    }
    setInputValue('');
    setSelectedTemplate('upsc-gs'); // Reset to default
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-8 max-w-md w-full overflow-hidden border border-gray-100 dark:border-white/5"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
          >
            <FiX size={20} />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 ${isDelete ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' : isReset ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
              }`}>
              {isDelete ? <FiTrash2 size={28} /> : isReset ? <FiAlertTriangle size={28} /> : <FiPlus size={28} />}
            </div>

            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              {isDelete ? 'Delete Arena?' : isReset ? 'Reset Arena?' : 'New Arena'}
            </h3>

            <p className="text-gray-500 dark:text-gray-400 font-medium mb-6 leading-relaxed text-sm">
              {isDelete
                ? `You are about to delete "${arenaData?.title || 'this arena'}". This action cannot be undone. All syllabus progress and linked data will be removed.`
                : isReset
                  ? "This will wipe your study progress for this Arena and reset it to the master blueprint."
                  : "Create a new strategic tracking space. Choose a blueprint to start."}
            </p>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {/* Template Selection for Create Mode */}
              {!isDelete && !isReset && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div
                    onClick={() => setSelectedTemplate('upsc-gs')}
                    className={`cursor-pointer p-3 rounded-2xl border-2 text-left transition-all ${selectedTemplate === 'upsc-gs'
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 ring-1 ring-primary-200 dark:ring-primary-800'
                      : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'
                      }`}
                  >
                    <div className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-1">UPSC CSE</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight">Complete GS Pre+Mains Roadmap</div>
                  </div>

                  <div
                    onClick={() => setSelectedTemplate('general')}
                    className={`cursor-pointer p-3 rounded-2xl border-2 text-left transition-all ${selectedTemplate === 'general'
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 ring-1 ring-primary-200 dark:ring-primary-800'
                      : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'
                      }`}
                  >
                    <div className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-1">Custom</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight">Empty canvas (Manual Editing)</div>
                  </div>

                  {/* Coming Soon Options */}
                  <div className="col-span-2 p-2 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-dashed border-gray-200 dark:border-white/10 text-center">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">More Blueprints Coming Soon</span>
                  </div>
                </div>
              )}

              {isDelete && (
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Confirm by typing Arena name</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder={`Type "${arenaData?.title}" to confirm`}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full p-4 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-rose-100 dark:focus:border-rose-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none font-bold text-gray-900 dark:text-white text-center transition-all"
                  />
                </div>
              )}

              {!isDelete && !isReset && (
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Arena Title</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder={selectedTemplate === 'upsc-gs' ? "e.g. UPSC CSE 2026" : "e.g. My Learning Path"}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full p-4 bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary-100 dark:focus:border-primary-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none font-bold text-gray-900 dark:text-white transition-all shadow-sm"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-black text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDelete && inputValue.trim().toLowerCase() !== (arenaData?.title || '').trim().toLowerCase()}
                  className={`flex-1 py-4 rounded-2xl text-white font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs ${isDelete
                    ? 'bg-rose-500 shadow-rose-200 dark:shadow-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed'
                    : isReset
                      ? 'bg-amber-500 shadow-amber-200 dark:shadow-amber-900/20'
                      : 'bg-gray-900 dark:bg-white dark:text-gray-900 shadow-gray-200 dark:shadow-none hover:bg-black dark:hover:bg-gray-200'
                    }`}
                >
                  {isDelete ? 'Delete' : isReset ? 'Reset' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ArenaModal;
