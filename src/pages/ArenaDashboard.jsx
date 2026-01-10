import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchArenas, fetchSyllabus, setCurrentArena, createArena, deleteArena } from '../redux/slice/arenaSlice';
import SyllabusTree from '../components/syllabus/SyllabusTree';
import { motion } from 'framer-motion';
import { FiPlus, FiSettings, FiRefreshCcw, FiLayers, FiTarget, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const ArenaDashboard = () => {
  const dispatch = useDispatch();
  const { arenas, currentArenaId, syllabus, loading } = useSelector(state => state.arena);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    dispatch(fetchArenas());
  }, [dispatch]);

  useEffect(() => {
    if (currentArenaId && !syllabus[currentArenaId]) {
      dispatch(fetchSyllabus(currentArenaId));
    }
  }, [currentArenaId, dispatch, syllabus]);

  const currentArena = arenas.find(a => a._id === currentArenaId);

  const handleCreateArena = async () => {
    // Simplified for now, just creates a UPSC one if none exists
    const title = prompt("Enter Arena Title (e.g., UPSC CSE 2026):", "UPSC CSE");
    if (!title) return;
    
    dispatch(createArena({ title, templateId: 'upsc-gs', isPrimary: true }));
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure? This will wipe your study progress for this Arena and reset it to the master blueprint.")) return;
    
    try {
      await api.post(`/arenas/${currentArenaId}/reset`);
      dispatch(fetchSyllabus(currentArenaId));
      toast.success("Arena reset to Master Blueprint 🔄");
    } catch (err) {
      toast.error("Reset failed");
    }
  };

  const handleDelete = async () => {
    const confirmation = prompt("WARNING: This will permanently DELETE this Arena and all your progress. Type 'DELETE' to confirm.");
    if (confirmation !== 'DELETE') return;
    
    dispatch(deleteArena(currentArenaId));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-primary-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-secondary-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-primary-400 mb-2">
              <FiLayers />
              <span className="text-sm font-bold tracking-widest uppercase">Your Command Center</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2">
              The <span className="bg-gradient-to-r from-primary-400 to-indigo-500 bg-clip-text text-transparent underline decoration-primary-500/30">Arena</span>
            </h1>
            <p className="text-gray-400 max-w-lg">
              Recursive syllabus tracking for elite aspirants. Master your roadmap, one micro-topic at a time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleCreateArena}
              className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary-900/20"
            >
              <FiPlus /> New Arena
            </button>
            <button 
              onClick={handleReset}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-gray-400"
              title="Reset to Master"
            >
              <FiRefreshCcw />
            </button>
            <button 
              onClick={handleDelete}
              disabled={!currentArenaId}
              className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all text-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">Active Tracks</h2>
            {arenas.map(arena => (
              <motion.div
                key={arena._id}
                whileHover={{ x: 4 }}
                onClick={() => dispatch(setCurrentArena(arena._id))}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  currentArenaId === arena._id 
                  ? 'bg-primary-600/10 border-primary-500/50 shadow-inner ring-1 ring-primary-500/20' 
                  : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-bold truncate ${currentArenaId === arena._id ? 'text-primary-400' : 'text-gray-300'}`}>
                    {arena.title}
                  </h3>
                  {arena.isPrimary && <FiTarget className="text-primary-500 text-xs" />}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                  Template: {arena.templateId}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main - Syllabus Tracker */}
          <div className="lg:col-span-9">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden min-h-[600px]">
              <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {currentArena?.title?.[0] || 'A'}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{currentArena?.title || 'Select an Arena'}</h2>
                    <p className="text-xs text-gray-500">Recursive Roadmap • {syllabus[currentArenaId]?.length || 0} Nodes</p>
                  </div>
                </div>
                
                {/* Progress Mini-Chart (Placeholder) */}
                <div className="hidden sm:flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Progress</p>
                    <p className="font-mono text-primary-400 font-bold">
                      {Math.round((syllabus[currentArenaId]?.filter(n => n.status === 'completed').length / syllabus[currentArenaId]?.length) * 100) || 0}%
                    </p>
                  </div>
                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(syllabus[currentArenaId]?.filter(n => n.status === 'completed').length / syllabus[currentArenaId]?.length) * 100 || 0}%` }}
                      className="h-full bg-primary-500" 
                    />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {currentArenaId ? (
                  <SyllabusTree nodes={syllabus[currentArenaId] || []} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[500px] text-center px-6">
                    <div className="w-20 h-20 rounded-3xl bg-primary-500/10 flex items-center justify-center text-primary-400 mb-6">
                      <FiLayers className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Welcome to your Arena</h3>
                    <p className="text-gray-500 max-w-sm mb-8">
                      You haven't initialized a syllabus track yet. Choose a template to begin your strategic preparation.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <button 
                        onClick={() => dispatch(createArena({ title: 'UPSC CSE', templateId: 'upsc-gs', isPrimary: true }))}
                        className="px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-100 transition-all"
                      >
                        UPSC GS Master
                      </button>
                      <button 
                         onClick={() => dispatch(createArena({ title: 'My Goals', templateId: 'general', isPrimary: true }))}
                        className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
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
    </div>
  );
};

export default ArenaDashboard;
