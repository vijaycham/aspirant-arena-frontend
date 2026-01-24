import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { FiLink, FiAlertCircle, FiCheckCircle, FiChevronRight, FiLoader } from 'react-icons/fi';

const LegacyLinker = ({ arenas }) => {
    const [loading, setLoading] = useState(false);
    const [unlinkedData, setUnlinkedData] = useState({ tests: [], sessions: [] });
    const [selectedArena, setSelectedArena] = useState('');
    const [linking, setLinking] = useState(false);

    const fetchUnlinked = async () => {
        setLoading(true);
        try {
            const res = await api.get('/arenas/legacy-unlinked');
            setUnlinkedData(res.data);
        } catch (err) {
            console.error('Failed to fetch unlinked data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnlinked();
    }, []);

    const handleLink = async () => {
        if (!selectedArena) {
            toast.error('Please select a target Arena');
            return;
        }

        setLinking(true);
        try {
            await api.post('/arenas/legacy-link', {
                arenaId: selectedArena,
                testIds: unlinkedData.tests.map(t => t._id),
                sessionIds: unlinkedData.sessions.map(s => s._id)
            });
            toast.success('Legacy data linked successfully! 🎉');
            setUnlinkedData({ tests: [], sessions: [] });
        } catch (err) {
            toast.error('Linking failed');
        } finally {
            setLinking(false);
        }
    };

    const totalItems = unlinkedData.tests.length + unlinkedData.sessions.length;

    if (loading) return (
        <div className="p-8 flex items-center justify-center text-gray-400">
            <FiLoader className="animate-spin mr-2" /> Scanning for legacy data...
        </div>
    );

    if (totalItems === 0) return null;

    return (
        <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-500/20 rounded-[2rem] p-6 mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                        <FiAlertCircle size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-amber-900 dark:text-amber-400 uppercase tracking-tight">Legacy Data Detected</h4>
                        <p className="text-xs font-bold text-amber-700/70 dark:text-amber-500/60 leading-relaxed max-w-sm">
                            You have {unlinkedData.tests.length} mock tests and {unlinkedData.sessions.length} sessions that aren't linked to an Arena. Link them now to fix your analytics.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <select
                        value={selectedArena}
                        onChange={(e) => setSelectedArena(e.target.value)}
                        className="w-full sm:w-48 p-3 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-500/30 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                        <option value="">Select Target Arena</option>
                        {arenas.map(a => (
                            <option key={a._id} value={a._id}>{a.title}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleLink}
                        disabled={linking || !selectedArena}
                        className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-200 dark:shadow-none"
                    >
                        {linking ? <FiLoader className="animate-spin" /> : <FiLink />}
                        Link All Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LegacyLinker;
