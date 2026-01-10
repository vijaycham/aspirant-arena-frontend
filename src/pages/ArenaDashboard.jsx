import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchArenas, fetchSyllabus, setCurrentArena, createArena, deleteArena } from '../redux/slice/arenaSlice';
import SyllabusTree from '../components/syllabus/SyllabusTree';
import ArenaModal from '../components/arena/ArenaModal';
import { motion } from 'framer-motion';
import { FiPlus, FiSettings, FiRefreshCcw, FiLayers, FiTarget, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const ArenaDashboard = () => {
  const dispatch = useDispatch();
  const { arenas, currentArenaId, syllabus, loading } = useSelector(state => state.arena);
  const [modalType, setModalType] = useState(null); // 'create' | 'delete' | 'reset'

  useEffect(() => {
    dispatch(fetchArenas());
  }, [dispatch]);

  useEffect(() => {
    if (currentArenaId && !syllabus[currentArenaId]) {
      dispatch(fetchSyllabus(currentArenaId));
    }
  }, [currentArenaId, dispatch, syllabus]);

  const currentArena = arenas.find(a => a._id === currentArenaId);

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
    } catch (err) {
      toast.error("Reset failed");
    }
    setModalType(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-14 pb-12 px-4 sm:px-6 lg:px-8 font-outfit relative">
      {/* Background Decor (Matching Home.jsx) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary-200/30 blur-3xl opacity-60 mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary-200/30 blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-200/30 blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <FiLayers className="text-primary-600" />
              <span className="text-[10px] bg-primary-50 text-primary-700 px-2 py-1 rounded-full font-black tracking-widest uppercase border border-primary-100">Your Command Center</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2 text-gray-900">
              The <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent underline decoration-primary-200">Arena</span>
            </h1>
            <p className="text-gray-500 max-w-lg font-medium text-lg leading-relaxed">
              Recursive syllabus tracking for elite aspirants. Master your roadmap, one micro-topic at a time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setModalType('create')}
              className="px-6 py-3 rounded-2xl bg-gray-900 hover:bg-black text-white font-black transition-all flex items-center gap-2 shadow-2xl shadow-gray-200 hover:scale-[1.02] active:scale-95"
            >
              <FiPlus /> New Arena
            </button>
            <button 
              onClick={() => setModalType('reset')}
              className="p-3.5 rounded-2xl bg-white border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all text-gray-400 hover:text-gray-900 shadow-sm"
              title="Reset to Master"
            >
              <FiRefreshCcw />
            </button>
            <button 
              onClick={() => setModalType('delete')}
              disabled={!currentArenaId}
              className="p-3.5 rounded-2xl bg-white border border-gray-100 hover:bg-rose-50 hover:border-rose-100 transition-all text-gray-400 hover:text-rose-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              title="Delete Track"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>

        {/* Dash Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar - Arena List */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Active Tracks</h2>
            {arenas.map(arena => (
              <motion.div
                key={arena._id}
                whileHover={{ x: 4 }}
                onClick={() => dispatch(setCurrentArena(arena._id))}
                className={`p-5 rounded-[1.5rem] border cursor-pointer transition-all ${
                  currentArenaId === arena._id 
                  ? 'bg-white border-primary-200 shadow-xl shadow-primary-100/50 ring-2 ring-primary-100' 
                  : 'bg-white/50 border-white hover:bg-white hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-black truncate text-sm ${currentArenaId === arena._id ? 'text-primary-700' : 'text-gray-700'}`}>
                    {arena.title}
                  </h3>
                  {arena.isPrimary && <FiTarget className="text-primary-500 text-xs animate-pulse" />}
                </div>
                <div className={`text-[9px] uppercase tracking-wider font-bold ${currentArenaId === arena._id ? 'text-primary-400' : 'text-gray-400'}`}>
                  Template: {arena.templateId}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main - Syllabus Tracker */}
          <div className="lg:col-span-9">
            <div className="bg-white/60 backdrop-blur-xl border border-white shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden min-h-[600px]">
              <div className="p-8 border-b border-gray-100 bg-white/40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-200">
                    {currentArena?.title?.[0] || 'A'}
                  </div>
                  <div>
                    <h2 className="font-black text-xl text-gray-900">{currentArena?.title || 'Select an Arena'}</h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Recursive Roadmap • {syllabus[currentArenaId]?.length || 0} Nodes</p>
                  </div>
                </div>
                
                {/* Progress Mini-Chart */}
                <div className="hidden sm:flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Progress</p>
                    <p className="font-mono text-primary-600 font-black text-lg">
                      {Math.round((syllabus[currentArenaId]?.filter(n => n.status === 'completed').length / syllabus[currentArenaId]?.length) * 100) || 0}%
                    </p>
                  </div>
                  <div className="w-24 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(syllabus[currentArenaId]?.filter(n => n.status === 'completed').length / syllabus[currentArenaId]?.length) * 100 || 0}%` }}
                      className="h-full bg-gradient-to-r from-primary-500 to-indigo-500" 
                    />
                  </div>
                </div>
              </div>

              <div className="p-8">
                {currentArenaId ? (
                  <SyllabusTree nodes={syllabus[currentArenaId] || []} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[500px] text-center px-6">
                    <div className="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center text-gray-300 mb-6">
                      <FiLayers className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Welcome to your Arena</h3>
                    <p className="text-gray-500 max-w-sm mb-8 font-medium">
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
                        className="px-8 py-3.5 rounded-2xl bg-white border-2 border-gray-100 text-gray-600 font-black hover:bg-gray-50 hover:text-gray-900 hover:border-gray-200 transition-all text-sm uppercase tracking-wider"
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
