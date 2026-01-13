import React from "react";

const DeleteConfirmModal = ({ confirmDeleteData, setConfirmDeleteData, handleDelete }) => {
  if (!confirmDeleteData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-2xl dark:shadow-slate-950/50 max-w-sm w-full border border-gray-100 dark:border-white/10 scale-100 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 rounded-2xl md:rounded-3xl flex items-center justify-center text-2xl md:text-3xl mx-auto mb-6">
          🗑️
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white text-center mb-2">Delete Record?</h3>
        <p className="text-[10px] text-gray-400 font-bold text-center mb-8 uppercase tracking-widest leading-relaxed px-4">
          Removing <br />{" "}
          <span className="text-gray-900 dark:text-white font-black">
            {confirmDeleteData.subject && `${confirmDeleteData.subject}: `} {confirmDeleteData.name}
          </span>{" "}
          <br />
          This action is permanent.
        </p>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <button
            onClick={() => setConfirmDeleteData(null)}
            className="py-3 md:py-4 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-black rounded-xl md:rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all uppercase tracking-widest text-[9px] md:text-[10px]"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="py-3 md:py-4 bg-rose-600 text-white font-black rounded-xl md:rounded-2xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 uppercase tracking-widest text-[9px] md:text-[10px]"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
