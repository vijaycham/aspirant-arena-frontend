import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiLayers, FiTarget, FiSearch, FiChevronRight, FiPlus } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { fetchArenas, fetchSyllabus } from "../../redux/slice/arenaSlice";

const TaskInput = ({ 
  task, 
  setTask, 
  priority, 
  setPriority, 
  dueDate, 
  setDueDate, 
  onAdd, 
  onCancel, 
  isEditing, 
  onKeyDown,
  selectedArenaId,
  setSelectedArenaId,
  selectedNodeId,
  setSelectedNodeId
}) => {
  const { arenas, syllabus } = useSelector(state => state.arena);
  const dispatch = useDispatch();
  const [showArenaDropdown, setShowArenaDropdown] = useState(false);
  const [nodeSearch, setNodeSearch] = useState("");
  const [currentParentId, setCurrentParentId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Auto-suggestions based on what the user is typing in the task input
  const suggestions = React.useMemo(() => {
    if (!task || task.length < 2 || selectedNodeId) return [];
    
    // Use local static syllabus if available (faster), else fallback to Redux
    const sourceData = localSyllabus.length > 0 ? localSyllabus : Object.values(syllabus).flat();

    const matches = sourceData.filter(n => 
      n.type !== 'subject' && 
      n.type !== 'root' &&
      n.type !== 'category' &&
      n.title.toLowerCase().includes(task.toLowerCase())
    ).map(n => ({ ...n, arenaId: selectedArenaId || 'upsc-gs' }));
    
    return matches.slice(0, 5); 
  }, [task, syllabus, selectedNodeId, localSyllabus]);

  // Client-Side Optimization: Load deeply nested syllabus from static JSON
  // This avoids massive DB calls for what is essentially "Read-Only Master Data"
  const [localSyllabus, setLocalSyllabus] = useState([]);

  React.useEffect(() => {
    const loadStaticSyllabus = async () => {
       try {
         // Dynamic Import (Code Splitting)
         const module = await import("../../data/syllabus/upsc-gs.json");
         const staticData = module.default;
         
         const flatten = (node, pid) => {
             let res = [];
             const flat = {
                 ...node,
                 parentId: pid,
                 _id: node.title.replace(/\s+/g, '-').toLowerCase()
             };
             res.push(flat);
             if (node.children) {
                 node.children.forEach(c => res.push(...flatten(c, flat._id)));
             }
             return res;
         }
         // Flatten root for easy searching
         if (staticData.root) {
             setLocalSyllabus(flatten(staticData.root, null));
         }
       } catch (e) {
           console.error("Syllabus lazy load failed", e);
       }
    };
    if (showSuggestions && localSyllabus.length === 0) {
        loadStaticSyllabus();
    }
  }, [showSuggestions]);

  // Reset navigation when arena changes
  React.useEffect(() => {
    setCurrentParentId(null);
    setNodeSearch("");
  }, [selectedArenaId]);

  React.useEffect(() => {
    if (arenas.length === 0) dispatch(fetchArenas());
  }, [arenas.length, dispatch]);

  React.useEffect(() => {
    if (selectedArenaId && !syllabus[selectedArenaId]) {
      dispatch(fetchSyllabus(selectedArenaId));
    }
  }, [selectedArenaId, dispatch, syllabus]);

  const selectedNode = selectedNodeId && selectedArenaId && syllabus[selectedArenaId]?.find(n => n._id === selectedNodeId);

  // Get children of current parent or top-level subjects
  const currentLevelNodes = React.useMemo(() => {
    if (!selectedArenaId || !syllabus[selectedArenaId]) return [];
    const allNodes = syllabus[selectedArenaId];
    
    if (nodeSearch) {
      return allNodes.filter(n => 
        n.type !== 'subject' && 
        n.title.toLowerCase().includes(nodeSearch.toLowerCase())
      ).slice(0, 15);
    }
    
    return allNodes.filter(n => n.parentId === currentParentId);
  }, [selectedArenaId, syllabus, currentParentId, nodeSearch]);

  // Build breadcrumbs for navigation
  const breadcrumbs = React.useMemo(() => {
    if (!selectedArenaId || !currentParentId || !syllabus[selectedArenaId]) return [];
    const trail = [];
    let current = syllabus[selectedArenaId].find(n => n._id === currentParentId);
    while (current) {
      trail.unshift(current);
      current = syllabus[selectedArenaId].find(n => n._id === current.parentId);
    }
    return trail;
  }, [selectedArenaId, currentParentId, syllabus]);

  return (
    <div className="glass-card p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-white">
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Task Description</label>
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="What needs to be done?"
            onFocus={() => setShowSuggestions(true)}
            className="w-full p-4 bg-gray-50/50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300 shadow-sm"
          />

          {/* Type-Ahead Suggestions */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 space-y-1"
              >
                <div className="px-3 py-1.5 mb-1 border-b border-gray-50 flex items-center justify-between">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Link to Roadmap Topic?</span>
                  <button onClick={() => setShowSuggestions(false)} className="text-gray-300 hover:text-black">&times;</button>
                </div>
                {suggestions.map(suggestion => (
                  <button
                    key={suggestion._id}
                    onClick={() => {
                      setSelectedArenaId(suggestion.arenaId);
                      setSelectedNodeId(suggestion._id);
                      setTask(suggestion.title);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-primary-50 transition-all group flex items-center justify-between"
                  >
                    <div>
                      <p className="text-[8px] text-gray-400 uppercase font-black tracking-tighter">
                        {arenas.find(a => a._id === suggestion.arenaId)?.title} • {suggestion.type}
                      </p>
                      <p className="text-xs font-bold text-gray-700 group-hover:text-primary-600">
                        {suggestion.title}
                      </p>
                    </div>
                    <FiPlus className="text-gray-300 group-hover:text-primary-400 transition-all" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {!selectedNodeId ? (
              <button
                onClick={() => {
                  if (arenas.length === 1) {
                    setSelectedArenaId(arenas[0]._id);
                    setShowArenaDropdown(true);
                  } else {
                    setShowArenaDropdown(true);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-white/50 border border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-primary-600 hover:bg-white transition-all flex items-center gap-2"
              >
                <FiLayers size={10} /> Link Roadmap Topic
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowArenaDropdown(true)}
                  className="px-3 py-1.5 rounded-xl bg-primary-50 border border-primary-100 text-[9px] font-black uppercase tracking-widest text-primary-600 transition-all flex items-center gap-2 shadow-sm"
                >
                  <FiTarget size={10} className="animate-pulse" /> {selectedNode?.title || 'Linked Topic'}
                </button>
                <button 
                  onClick={() => {
                    setSelectedNodeId("");
                    setSelectedArenaId("");
                  }}
                  className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-rose-500 transition-all"
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          {/* Arena Dropdown Menu (Inline version for TaskInput) */}
          <AnimatePresence>
            {showArenaDropdown && (
              <div className="relative">
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowArenaDropdown(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-4 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-50 p-6 max-h-[350px] overflow-hidden flex flex-col"
                >
                   <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Master Roadmap Link</h3>
                      <button onClick={() => setShowArenaDropdown(false)} className="text-gray-400 hover:text-black">&times;</button>
                    </div>

                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                      {arenas.map(a => (
                        <button
                          key={a._id}
                          onClick={() => setSelectedArenaId(a._id)}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight border whitespace-nowrap transition-all ${
                            selectedArenaId === a._id 
                              ? 'bg-primary-600 border-primary-600 text-white shadow-lg' 
                              : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                          }`}
                        >
                          {a.title}
                        </button>
                      ))}
                    </div>

                    <div className="relative mb-4">
                      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="Search topics..."
                        value={nodeSearch}
                        onChange={(e) => setNodeSearch(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 ring-primary-500/10 transition-all"
                      />
                    </div>

                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide min-h-[32px] items-center">
                       <button 
                         onClick={() => setCurrentParentId(null)}
                         className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-all ${!currentParentId ? 'text-primary-600 bg-primary-50' : 'text-gray-400 hover:text-gray-600'}`}
                       >
                         Root
                       </button>
                       {breadcrumbs.map((bc, idx) => (
                         <React.Fragment key={bc._id}>
                           <FiChevronRight size={10} className="text-gray-300" />
                           <button 
                             onClick={() => setCurrentParentId(bc._id)}
                             className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-all whitespace-nowrap ${idx === breadcrumbs.length - 1 ? 'text-primary-600 bg-primary-50' : 'text-gray-400 hover:text-gray-600'}`}
                           >
                             {bc.title}
                           </button>
                         </React.Fragment>
                       ))}
                    </div>

                    <div className="overflow-y-auto flex-1 space-y-1 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                      {!selectedArenaId ? (
                        <p className="text-center text-gray-400 text-[10px] py-10 uppercase font-black opacity-50">Select an Arena first</p>
                      ) : currentLevelNodes.length === 0 ? (
                        <p className="text-center text-gray-400 text-[10px] py-10 uppercase font-black opacity-50">No topics found</p>
                      ) : currentLevelNodes.map(node => (
                        <button
                          key={node._id}
                          onClick={() => {
                            if (node.type === 'subject' || node.type === 'topic') {
                              setCurrentParentId(node._id);
                            } else {
                              setSelectedNodeId(node._id);
                              setShowArenaDropdown(false);
                              if (!task.trim()) setTask(node.title);
                            }
                          }}
                          className="w-full text-left p-3 rounded-xl bg-white border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all group flex items-center justify-between"
                        >
                          <div>
                            <p className="text-[8px] text-gray-400 mt-1 uppercase font-black tracking-tighter">
                              {node.type}
                            </p>
                            <p className="text-xs font-bold text-gray-700 group-hover:text-primary-600 transition-colors uppercase tracking-tight">
                              {node.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                             {(node.type === 'subject' || node.type === 'topic') ? (
                               <FiChevronRight className="text-gray-300 group-hover:text-primary-400 transition-all" />
                             ) : (
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setSelectedNodeId(node._id);
                                   setShowArenaDropdown(false);
                                   if (!task.trim()) setTask(node.title);
                                 }}
                                 className="opacity-0 group-hover:opacity-100 p-1.5 bg-primary-600 text-white rounded-lg transition-all shadow-lg shadow-primary-200"
                               >
                                 <FiPlus size={12} />
                               </button>
                             )}
                          </div>
                        </button>
                      ))}
                    </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex flex-col md:flex-row items-end gap-6">
          <div className="grid grid-cols-2 gap-4 flex-1 w-full">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-3 bg-gray-50/50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-gray-700 text-sm appearance-none shadow-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-3 bg-gray-50/50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-gray-700 text-sm shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={onAdd}
              className="px-10 py-3.5 bg-gray-900 text-white font-black rounded-2xl hover:bg-black hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-gray-200 uppercase tracking-widest text-xs"
            >
              {isEditing ? "Update Task" : "Add Task"}
            </button>
            {isEditing && (
              <button
                onClick={onCancel}
                className="px-10 py-3.5 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskInput;
