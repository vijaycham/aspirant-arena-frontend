import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTimer } from '../hooks/useTimer';
import { fetchArenas, fetchSyllabus, setCurrentArena, createArena, deleteArena, togglePrimaryArena, updateArenaTitle } from '../redux/slice/arenaSlice';
import SyllabusTree from '../components/syllabus/SyllabusTree';
import ArenaModal from '../components/arena/ArenaModal';
import ExamCountdown from '../components/arena/ExamCountdown';
import LegacyLinker from '../components/arena/LegacyLinker';
import { motion } from 'framer-motion';
import { FiPlus, FiRefreshCcw, FiLayers, FiTrash2, FiStar, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const ArenaDashboard = () => {
  const dispatch = useDispatch();
  const { isActive: isTimerActive } = useTimer();
  const { arenas, currentArenaId, syllabus, syllabusLoading } = useSelector(state => state.arena);
  const [modalType, setModalType] = useState(null); // 'create' | 'delete' | 'reset'
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState("");

  const currentArena = arenas.find(a => a._id === currentArenaId);

  const startHeaderEdit = () => {
    if (currentArena) {
      setEditTitleValue(currentArena.title);
      setIsEditingTitle(true);
    }
  };

  const submitHeaderEdit = async () => {
    if (editTitleValue.trim() && currentArena) {
      await dispatch(updateArenaTitle({ arenaId: currentArenaId, title: editTitleValue }));
      setIsEditingTitle(false);
    }
  };

  const cancelHeaderEdit = () => {
    setIsEditingTitle(false);
  };
  useEffect(() => {
    dispatch(fetchArenas());
  }, [dispatch]);

  useEffect(() => {
    if (currentArenaId && !syllabus[currentArenaId]) {
      dispatch(fetchSyllabus(currentArenaId));
    }
  }, [currentArenaId, dispatch, syllabus]);

  const handleCreateConfirm = ({ title, templateId }) => {
    dispatch(createArena({ title, templateId, isPrimary: true }));
    setModalType(null);
  };

  const handleDeleteConfirm = () => {
    dispatch(deleteArena(currentArenaId));
    setModalType(null);
  };

  const handleResetConfirm = async () => {
    try {
      await api.post(`/arenas/${currentArenaId}/reset`);
      dispatch(fetchSyllabus(currentArenaId));
      toast.success("Arena reset to Master Blueprint 🔄");
    } catch {
      // ignore
      toast.error("Reset failed");
    }
    setModalType(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200 text-gray-900 pt-14 pb-12 px-4 sm:px-6 lg:px-8 font-outfit relative">
      {/* Background Decor (Matching Home.jsx) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary-200/30 dark:bg-primary-900/10 blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary-200/30 dark:bg-secondary-900/10 blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-200/30 dark:bg-purple-900/10 blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <FiLayers className="text-primary-600" />
              <span className="text-[10px] bg-primary-50 text-primary-700 px-2 py-1 rounded-full font-black tracking-widest uppercase border border-primary-100">Your Command Center</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2 text-gray-900 dark:text-white">
              The <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent underline decoration-primary-200">Arena</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg font-medium text-lg leading-relaxed">
              Recursive syllabus tracking for elite aspirants. Master your roadmap, one micro-topic at a time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalType('create')}
              className="px-6 py-3 rounded-2xl bg-gray-900 hover:bg-black text-white font-black transition-transform flex items-center gap-2 shadow-2xl shadow-gray-200 dark:shadow-none hover:scale-[1.02] active:scale-95"
            >
              <FiPlus /> New Arena
            </button>
            <button
              onClick={() => setModalType('reset')}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-200 transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-sm"
              title="Reset to Master"
            >
              <FiRefreshCcw />
            </button>
            <button
              onClick={() => setModalType('delete')}
              disabled={!currentArenaId}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-100 transition-all text-gray-400 hover:text-rose-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              title="Delete Track"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>

        <LegacyLinker arenas={arenas} />

        {/* Dash Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Sidebar - Arena List & Widgets */}
          <div className="lg:col-span-3 space-y-6">
            <ExamCountdown />

            <div className="space-y-4">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Active Tracks</h2>
              {arenas.map(arena => (
                <motion.div
                  key={arena._id}
                  whileHover={{ x: 4 }}
                  onClick={() => dispatch(setCurrentArena(arena._id))}
                  className={`p-5 rounded-[1.5rem] border cursor-pointer transition-all ${currentArenaId === arena._id
                    ? 'bg-white dark:bg-slate-800 border-primary-200 dark:border-primary-500/30 shadow-xl shadow-primary-100/50 dark:shadow-primary-900/20 ring-2 ring-primary-100 dark:ring-primary-500/20'
                    : 'bg-white/50 dark:bg-slate-900/50 border-white dark:border-white/5 hover:bg-white dark:hover:bg-slate-800 hover:border-gray-200 dark:hover:border-white/10 hover:shadow-lg hover:shadow-gray-100 dark:hover:shadow-black/50'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-black truncate text-sm ${currentArenaId === arena._id ? 'text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {arena.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isTimerActive) {
                          toast.error("Finish your session before changing primary goals! ⏳", { id: 'timer-lock' });
                          return;
                        }
                        dispatch(togglePrimaryArena(arena._id));
                      }}
                      className="transition-transform hover:scale-125 p-1"
                    >
                      {arena.isPrimary ? (
                        <FiStar className="text-amber-500 fill-amber-500 text-xs" title="Primary Arena" />
                      ) : (
                        <FiStar className="text-gray-300 hover:text-amber-400 text-xs" title="Set as Primary" />
                      )}
                    </button>
                  </div>
                  <div className={`text-[9px] uppercase tracking-wider font-bold ${currentArenaId === arena._id ? 'text-primary-400' : 'text-gray-400'}`}>
                    Template: {arena.templateId}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Main - Syllabus Tracker */}
          <div className="lg:col-span-9">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white dark:border-white/10 shadow-2xl shadow-gray-200/50 dark:shadow-black/50 rounded-[2.5rem] overflow-hidden min-h-[600px]">
              <div className="p-8 border-b border-gray-100 dark:border-white/5 bg-white/40 dark:bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg">
                    {currentArena?.title?.[0] || 'A'}
                  </div>
                  <div className="flex-1">
                    {isEditingTitle ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={editTitleValue}
                          onChange={(e) => setEditTitleValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') submitHeaderEdit();
                            if (e.key === 'Escape') cancelHeaderEdit();
                          }}
                          className="font-black text-xl text-gray-900 dark:text-white bg-transparent border-b-2 border-primary-500 focus:outline-none w-full max-w-[300px]"
                        />
                        <button onClick={submitHeaderEdit} className="p-1 hover:bg-green-100 rounded-full text-green-600">
                          <FiCheck />
                        </button>
                        <button onClick={cancelHeaderEdit} className="p-1 hover:bg-red-100 rounded-full text-red-500">
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <h2 className="font-black text-xl text-gray-900 dark:text-white">{currentArena?.title || 'Select an Arena'}</h2>
                        {currentArena && (
                          <button
                            onClick={startHeaderEdit}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 hover:text-primary-600"
                          >
                            <FiEdit2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Recursive Roadmap • {Object.keys(syllabus[currentArenaId]?.byId || {}).length} Nodes
                    </p>
                  </div>
                </div>

                {/* Progress Mini-Chart */}
                <div className="hidden sm:flex items-center gap-4 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Progress</p>
                    <p className="font-mono text-primary-600 font-black text-lg">
                      {currentArenaId && syllabus[currentArenaId] ?
                        Math.round((Object.values(syllabus[currentArenaId].byId).filter(n => n.status === 'completed').length / Object.keys(syllabus[currentArenaId].byId).length) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="w-24 h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${currentArenaId && syllabus[currentArenaId] ?
                          (Object.values(syllabus[currentArenaId].byId).filter(n => n.status === 'completed').length / Object.keys(syllabus[currentArenaId].byId).length) * 100
                          : 0}%`
                      }}
                      className="h-full bg-gradient-to-r from-primary-500 to-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8">
                {currentArenaId ? (
                  <SyllabusTree
                    syllabusData={syllabus[currentArenaId]}
                    arenaId={currentArenaId}
                    isLoading={syllabusLoading}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[500px] text-center px-6">
                    <div className="w-24 h-24 rounded-3xl bg-gray-50 dark:bg-slate-800 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-300 dark:text-gray-600 mb-6">
                      <FiLayers className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Welcome to your Arena</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8 font-medium">
                      You haven&apos;t initialized a syllabus track yet. Choose a template to begin your strategic preparation.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <button
                        onClick={() => setModalType('create')}
                        className="px-8 py-3.5 rounded-2xl bg-gray-900 text-white font-black hover:bg-black hover:scale-[1.03] transition-all shadow-xl shadow-gray-200 text-sm uppercase tracking-wider"
                      >
                        UPSC GS Master
                      </button>
                      <button
                        onClick={() => setModalType('create')}
                        className="px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-white font-black hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 hover:border-gray-200 transition-all text-sm uppercase tracking-wider"
                      >
                        Custom / General
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ArenaModal
        isOpen={!!modalType}
        type={modalType}
        arenaData={currentArena}
        onClose={() => setModalType(null)}
        onConfirm={
          modalType === 'delete' ? handleDeleteConfirm :
            modalType === 'reset' ? handleResetConfirm :
              handleCreateConfirm
        }
      />
    </div>
  );
};

export default ArenaDashboard;
