import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../utils/api";
import { toast } from "react-hot-toast";

import GlassCard from "../components/ui/GlassCard";

const Leaderboard = () => {
  const [range, setRange] = useState("daily");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const offset = new Date().getTimezoneOffset();
        const res = await api.get(`/leaderboard?range=${range}&offset=${offset}`);
        // Interceptor unwraps response, so res is the body. 
        // Backend returns { data: [...] }, so res.data is the array.
        setLeaderboard(Array.isArray(res.data) ? res.data : []);
      } catch {
        toast.error("Failed to load rankings");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [range]);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const getAvatar = (user) => user.photoUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user._id}`;
  const getHandle = (name, id) => `${name} #${id ? id.toString().slice(-4) : "????"}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-20 px-4 pb-20 font-outfit">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
           <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                Arena <span className="text-primary-600">Leaderboard</span> 🏆
              </h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                Top Performers • {range} Focus
              </p>
           </div>

           <div className="p-1 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center shadow-sm">
              {['daily', 'weekly', 'monthly'].map((r) => (
                 <button
                   key={r}
                   onClick={() => setRange(r)}
                   className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                     range === r 
                       ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg" 
                       : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                   }`}
                 >
                   {r}
                 </button>
              ))}
           </div>
        </div>

        {loading ? (
           <div className="h-96 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Calculating Ranks...</p>
           </div>
        ) : (
           <>
             {/* Podium (Top 3) */}
             {top3.length > 0 && (
                <div className="grid grid-cols-3 gap-2 md:gap-4 items-end justify-center min-h-[300px] py-8">
                   {/* Silver (2nd) */}
                   {top3[1] && <PodiumStep user={top3[1]} rank={2} getAvatar={getAvatar} getHandle={getHandle} delay={0.2} />}
                   
                   {/* Gold (1st) */}
                   {top3[0] && <PodiumStep user={top3[0]} rank={1} getAvatar={getAvatar} getHandle={getHandle} delay={0} isCenter />}
                   
                   {/* Bronze (3rd) */}
                   {top3[2] && <PodiumStep user={top3[2]} rank={3} getAvatar={getAvatar} getHandle={getHandle} delay={0.4} />}
                </div>
             )}

             {/* List (4-50) */}
             {rest.length > 0 && (
                <GlassCard delay={0.6}>
                   <div className="overflow-x-auto">
                      <table className="w-full min-w-[500px]">
                         <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-[10px] uppercase font-black text-gray-400 tracking-widest border-b border-gray-100 dark:border-slate-800">
                            <tr>
                               <th className="px-6 py-4 text-left w-16">#</th>
                               <th className="px-6 py-4 text-left">Aspirant</th>
                               <th className="px-6 py-4 text-right">Minutes</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {rest.map((user, idx) => (
                               <tr key={user._id} className="group hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                  <td className="px-6 py-5 text-sm font-bold text-gray-400 font-mono">
                                     {(idx + 4).toString().padStart(2, '0')}
                                  </td>
                                  <td className="px-6 py-5">
                                     <div className="flex items-center gap-4">
                                        <img 
                                           src={getAvatar(user)} 
                                           alt="Avatar" 
                                           className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 object-cover"
                                           onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${user._id}`;
                                           }}
                                        />
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-primary-600 transition-colors">
                                           {getHandle(user.name, user._id)}
                                        </span>
                                     </div>
                                  </td>
                                  <td className="px-6 py-5 text-right">
                                     <span className="text-sm font-black text-gray-900 dark:text-white font-mono">
                                        {user.score} <span className="text-[10px] text-gray-400 uppercase ml-1">min</span>
                                     </span>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </GlassCard>
             )}
             
             {leaderboard.length === 0 && (
                <GlassCard className="text-center py-20 border-dashed">
                   <span className="text-4xl filter grayscale opacity-50">🦗</span>
                   <p className="mt-4 text-gray-400 font-bold text-sm uppercase tracking-widest">No one has focused yet!</p>
                   <p className="text-xs text-primary-500 font-bold mt-1">Be the first to break the silence.</p>
                </GlassCard>
             )}
           </>
        )}
      </div>
    </div>
  );
};

const PodiumStep = ({ user, rank, getAvatar, getHandle, delay, isCenter }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      className={`relative flex flex-col items-center justify-end ${isCenter ? 'z-10' : ''}`}
    >
       {/* Crown for #1 */}
       {rank === 1 && (
         <motion.div 
           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -20 }} transition={{ delay: 1 }}
           className="absolute -top-16 text-4xl animate-bounce"
         >
           👑
         </motion.div>
       )}

       {/* Avatar Card */}
       <div className={`relative p-1 rounded-full border-4 shadow-xl mb-4 bg-white dark:bg-slate-900 ${
          rank === 1 ? 'border-yellow-400 w-20 h-20 md:w-24 md:h-24' : 
          rank === 2 ? 'border-gray-300 w-16 h-16 md:w-20 md:h-20' : 
          'border-amber-700 w-16 h-16 md:w-20 md:h-20'
       }`}>
          <img 
             src={getAvatar(user)} 
             alt="Avatar" 
             className="w-full h-full rounded-full object-cover"
             onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${user._id}`;
             }}
          />
          <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black text-white shadow-lg uppercase tracking-widest ${
             rank === 1 ? 'bg-yellow-400 text-yellow-900' :
             rank === 2 ? 'bg-gray-300 text-gray-800' :
             'bg-amber-700'
          }`}>
             #{rank}
          </div>
       </div>

       {/* Score Card */}
       <div className={`w-full bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-2 md:p-4 text-center shadow-lg relative overflow-hidden group ${
          isCenter ? 'min-h-[140px] md:min-h-[160px] border-t-4 border-t-yellow-400' : 
          rank === 2 ? 'min-h-[110px] md:min-h-[130px] border-t-4 border-t-gray-300' : 
          'min-h-[110px] md:min-h-[130px] border-t-4 border-t-amber-700'
       }`}>
          <div className="relative z-10">
             <div className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-100 truncate w-full max-w-[80px] md:max-w-[128px] mx-auto">
               {getHandle(user.name, user._id)}
             </div>
             <div className="mt-2">
                <span className="text-2xl font-black text-gray-900 dark:text-white font-mono">{user.score}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Minutes</span>
             </div>
          </div>
          
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
       </div>
    </motion.div>
  );
};

export default Leaderboard;
