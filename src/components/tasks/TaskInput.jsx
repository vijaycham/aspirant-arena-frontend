import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiLayers, FiTarget, FiSearch, FiChevronRight, FiPlus } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { fetchArenas, fetchSyllabus } from "../../redux/slice/arenaSlice";
import { toLocalDateTimeInput, fromLocalDateTimeInput } from "../../utils/tasks/taskHelpers";

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
    if (!task || task.length < 2) return [];
    
    // Search within selected arena or across all active arenas if none selected
    let sourceData = [];
    if (selectedArenaId && syllabus[selectedArenaId]) {
      sourceData = syllabus[selectedArenaId];
    } else {
      sourceData = Object.values(syllabus).flat();
    }

    const matches = sourceData.filter(n => 
      n.type !== 'subject' && 
      n.type !== 'root' &&
      n.type !== 'category' &&
      n.title.toLowerCase().includes(task.toLowerCase())
    ).map(n => ({ ...n, arenaId: n.arenaId || selectedArenaId }));
    
    return matches.slice(0, 5); 
  }, [task, syllabus, selectedArenaId]);

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
    
    return allNodes.filter(n => n.parentId === (currentParentId || null)); // Handle null explicitly for roots
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

  const dropdownRef = React.useRef(null);
  const btnRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showArenaDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        btnRef.current &&
        !btnRef.current.contains(event.target)
      ) {
        setShowArenaDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showArenaDropdown]);

  return (
    <div className="glass-card dark:border-white/10 p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 dark:shadow-black/50 border border-white relative z-50 transition-colors duration-200">
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
            className="w-full p-4 bg-gray-50/50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-colors font-bold text-gray-700 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-sm"
          />

          {/* Type-Ahead Suggestions */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-black/50 p-2 space-y-1"
              >
                <div className="px-3 py-1.5 mb-1 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Link to Roadmap Topic?</span>
                  <button onClick={() => setShowSuggestions(false)} className="text-gray-300 hover:text-black dark:hover:text-white">&times;</button>
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
                    className="w-full text-left p-3 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group flex items-center justify-between"
                  >
                    <div>
                      <p className="text-[8px] text-gray-400 uppercase font-black tracking-tighter">
                        {arenas.find(a => a._id === suggestion.arenaId)?.title} • {suggestion.type}
                      </p>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
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
                ref={btnRef}
                onClick={() => {
                  if (arenas.length === 1) {
                    setSelectedArenaId(arenas[0]._id);
                    setShowArenaDropdown(true);
                  } else {
                    setShowArenaDropdown(true);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <FiLayers size={10} /> Link Roadmap Topic
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  ref={btnRef}
                  onClick={() => setShowArenaDropdown(true)}
                  className="px-3 py-1.5 rounded-xl bg-primary-50 border border-primary-100 text-[9px] font-black uppercase tracking-widest text-primary-600 transition-colors flex items-center gap-2 shadow-sm"
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
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="absolute top-full left-0 right-0 mt-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-gray-100/50 dark:border-slate-800 rounded-[2rem] shadow-2xl shadow-gray-200/50 dark:shadow-black/80 z-[70] p-6 max-h-[400px] overflow-hidden flex flex-col ring-1 ring-black/5 dark:ring-white/5"
                >
                   <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-white/10 pb-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Master Roadmap Link</h3>
                      <button onClick={() => setShowArenaDropdown(false)} className="text-gray-400 hover:text-black dark:hover:text-white">&times;</button>
                    </div>

                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                      {arenas.map(a => (
                        <button
                          key={a._id}
                          onClick={() => setSelectedArenaId(a._id)}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight border whitespace-nowrap transition-colors ${
                            selectedArenaId === a._id 
                              ? 'bg-primary-600 border-primary-600 text-white shadow-lg' 
                              : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-400 hover:border-gray-200 dark:hover:border-slate-600'
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
                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 ring-primary-500/10 dark:text-gray-200 transition-all"
                      />
                    </div>

                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide min-h-[32px] items-center">
                       <button 
                         onClick={() => setCurrentParentId(null)}
                         className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-all ${!currentParentId ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                       >
                         Root
                       </button>
                       {breadcrumbs.map((bc, idx) => (
                         <React.Fragment key={bc._id}>
                           <FiChevronRight size={10} className="text-gray-300 dark:text-gray-600" />
                           <button 
                             onClick={() => setCurrentParentId(bc._id)}
                             className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-all whitespace-nowrap ${idx === breadcrumbs.length - 1 ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                           >
                             {bc.title}
                           </button>
                         </React.Fragment>
                       ))}
                    </div>

                    <div className="overflow-y-auto flex-1 space-y-1 pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700">
                      {!selectedArenaId ? (
                        <p className="text-center text-gray-400 text-[10px] py-10 uppercase font-black opacity-50">Select an Arena first</p>
                      ) : currentLevelNodes.length === 0 ? (
                        <p className="text-center text-gray-400 text-[10px] py-10 uppercase font-black opacity-50">No topics found</p>
                      ) : currentLevelNodes.map(node => (
                        <button
                          key={node._id}
                          onClick={() => {
                            if (node.type === 'subject' || node.type === 'topic' || node.type === 'category' || node.type === 'root') {
                              setCurrentParentId(node._id);
                            } else {
                              setSelectedNodeId(node._id);
                              setShowArenaDropdown(false);
                              if (!task.trim()) setTask(node.title);
                            }
                          }}
                          className="w-full text-left p-3 rounded-xl border border-transparent hover:bg-gray-50 dark:hover:bg-white/5 transition-all group flex items-center justify-between"
                        >
                          <div>
                            <p className="text-[8px] text-gray-400 mt-1 uppercase font-black tracking-tighter">
                              {node.type}
                            </p>
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors uppercase tracking-tight">
                              {node.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                             {(node.type === 'subject' || node.type === 'topic' || node.type === 'category' || node.type === 'root') ? (
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
          <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
            <div className="space-y-1 w-full md:w-32 flex-none">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-3 bg-gray-50/50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl outline-none transition-colors font-bold text-gray-700 dark:text-gray-200 text-sm appearance-none shadow-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-1 flex-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Due Date & Time</label>
              <div className="flex gap-4">
                <input
                  type="date"
                  value={dueDate ? toLocalDateTimeInput(dueDate).split('T')[0] : ""}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    if (!newDate) {
                      setDueDate(null);
                      return;
                    }
                    const currentLocal = dueDate ? toLocalDateTimeInput(dueDate) : "";
                    const currentTime = currentLocal ? currentLocal.split('T')[1] : "09:00";
                    setDueDate(fromLocalDateTimeInput(`${newDate}T${currentTime}`));
                  }}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="flex-1 p-3 bg-gray-50/50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl outline-none transition-colors font-bold text-gray-700 dark:text-gray-200 text-sm shadow-sm placeholder-gray-400 dark:[color-scheme:dark]"
                />
                <input
                  type="time"
                  value={dueDate ? toLocalDateTimeInput(dueDate).split('T')[1] : "09:00"}
                  onChange={(e) => {
                    const newTime = e.target.value;
                    const currentLocal = dueDate ? toLocalDateTimeInput(dueDate) : "";
                    const currentDate = currentLocal ? currentLocal.split('T')[0] : new Date().toISOString().split('T')[0];
                    setDueDate(fromLocalDateTimeInput(`${currentDate}T${newTime}`));
                  }}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="w-32 p-3 bg-gray-50/50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl outline-none transition-colors font-bold text-gray-700 dark:text-gray-200 text-sm shadow-sm placeholder-gray-400 dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={onAdd}
              className="px-10 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl hover:bg-black dark:hover:bg-gray-200 hover:scale-[1.03] active:scale-95 transition-transform shadow-xl shadow-gray-200 dark:shadow-none uppercase tracking-widest text-xs"
            >
              {isEditing ? "Update Task" : "Add Task"}
            </button>
            {isEditing && (
              <button
                onClick={onCancel}
                className="px-10 py-3.5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-black rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors uppercase tracking-widest text-xs"
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
