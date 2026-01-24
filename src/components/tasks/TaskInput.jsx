import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiLayers, FiTarget, FiSearch, FiPlus, FiX } from "react-icons/fi";
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
  const { arenas, syllabus, currentArenaId } = useSelector(state => state.arena);
  const dispatch = useDispatch();
  const [showArenaDropdown, setShowArenaDropdown] = useState(false);
  const [nodeSearch, setNodeSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Auto-suggestions based on what the user is typing in the task input
  const suggestions = React.useMemo(() => {
    if (!task || task.length < 2) return [];

    let sourceData = [];
    if (selectedArenaId && syllabus[selectedArenaId]) {
      sourceData = Object.values(syllabus[selectedArenaId].byId);
    } else {
      sourceData = Object.values(syllabus).flatMap(s => Object.values(s.byId));
    }

    const matches = sourceData.filter(n =>
      !['root', 'category', 'subject'].includes(n.type) &&
      n.title.toLowerCase().includes(task.toLowerCase())
    ).map(n => ({ ...n, arenaId: n.arenaId || selectedArenaId }));

    return matches.slice(0, 5);
  }, [task, syllabus, selectedArenaId]);

  React.useEffect(() => {
    if (arenas.length === 0) dispatch(fetchArenas());
  }, [arenas.length, dispatch]);

  React.useEffect(() => {
    if (selectedArenaId && !syllabus[selectedArenaId]) {
      dispatch(fetchSyllabus(selectedArenaId));
    }
  }, [selectedArenaId, dispatch, syllabus]);

  // Set default arena if none selected
  React.useEffect(() => {
    if (!selectedArenaId && currentArenaId) {
      setSelectedArenaId(currentArenaId);
    }
  }, [currentArenaId, selectedArenaId, setSelectedArenaId]);

  const selectedNode = selectedNodeId && selectedArenaId && syllabus[selectedArenaId]?.byId[selectedNodeId];
  const selectedArena = arenas.find(a => a._id === selectedArenaId);

  // Search results for the dropdown
  const searchResults = React.useMemo(() => {
    if (!selectedArenaId || !syllabus[selectedArenaId]) return [];
    const allNodes = Object.values(syllabus[selectedArenaId].byId);

    const query = nodeSearch.toLowerCase().trim();
    if (!query) return allNodes.filter(n => !['root', 'category', 'subject'].includes(n.type)).slice(0, 10);

    return allNodes.filter(n =>
      !['root', 'category', 'subject'].includes(n.type) &&
      n.title.toLowerCase().includes(query)
    ).slice(0, 20);
  }, [selectedArenaId, syllabus, nodeSearch]);

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
        <div className="space-y-1 relative">
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
                      if (!task.trim()) setTask(suggestion.title);
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
            <button
              ref={btnRef}
              onClick={() => setShowArenaDropdown(!showArenaDropdown)}
              className={`px-3 py-1.5 rounded-xl transition-all border flex items-center gap-2 shadow-sm text-[9px] font-black uppercase tracking-widest ${selectedArenaId
                  ? 'bg-primary-50 border-primary-100 text-primary-600'
                  : 'bg-white/50 dark:bg-slate-800/50 border-gray-100 dark:border-white/10 text-gray-400 hover:text-primary-600'
                }`}
            >
              <FiLayers size={10} /> {selectedArena ? selectedArena.title : 'Link Roadmap'}
            </button>

            {selectedNodeId && (
              <div className="flex items-center gap-1 group">
                <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-2 shadow-sm">
                  <FiTarget size={10} className="animate-pulse" /> {selectedNode?.title || 'Linked Topic'}
                </div>
                <button
                  onClick={() => setSelectedNodeId("")}
                  className="p-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-rose-500 transition-all"
                  title="Unlink Topic"
                >
                  <FiX size={12} />
                </button>
              </div>
            )}

            {!selectedNodeId && selectedArenaId && (
              <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-500/10 text-[9px] font-black uppercase tracking-widest text-amber-600/60 dark:text-amber-400/60 italic">
                General Study in {selectedArena?.title}
              </span>
            )}
          </div>

          {/* New Simplified Linking Dropdown */}
          <AnimatePresence>
            {showArenaDropdown && (
              <div className="relative">
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-slate-900 border-2 border-gray-100/50 dark:border-slate-800 rounded-[2rem] shadow-2xl z-[70] p-6 max-h-[450px] overflow-hidden flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Your Session</h3>
                    <button onClick={() => setShowArenaDropdown(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full">&times;</button>
                  </div>

                  {/* Arena Selection Tabs */}
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                      onClick={() => setSelectedArenaId("")}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight border whitespace-nowrap transition-colors ${!selectedArenaId
                          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                          : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-400'
                        }`}
                    >
                      No Arena (Global)
                    </button>
                    {arenas.map(a => (
                      <button
                        key={a._id}
                        onClick={() => {
                          setSelectedArenaId(a._id);
                          setSelectedNodeId(""); // Reset node if switching arena
                        }}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight border whitespace-nowrap transition-colors ${selectedArenaId === a._id
                            ? 'bg-primary-600 border-primary-600 text-white shadow-lg'
                            : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-400'
                          }`}
                      >
                        {a.title} {a.isPrimary && "⭐"}
                      </button>
                    ))}
                  </div>

                  {selectedArenaId && (
                    <>
                      <div className="relative mb-4">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder={`Search topics in ${selectedArena?.title}...`}
                          value={nodeSearch}
                          onChange={(e) => setNodeSearch(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 ring-primary-500/10 dark:text-gray-200 transition-all"
                        />
                      </div>

                      <div className="overflow-y-auto flex-1 space-y-1 pr-2 scrollbar-thin">
                        {searchResults.length === 0 ? (
                          <div className="text-center py-10">
                            <p className="text-gray-400 text-[10px] uppercase font-black opacity-50">No matching topics found</p>
                            <p className="text-[9px] text-gray-400 mt-1 italic">Selecting the Arena alone will track this as "General Study"</p>
                          </div>
                        ) : searchResults.map(node => (
                          <button
                            key={node._id}
                            onClick={() => {
                              setSelectedNodeId(node._id);
                              setShowArenaDropdown(false);
                              if (!task.trim()) setTask(node.title);
                            }}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${selectedNodeId === node._id
                                ? 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-500/30'
                                : 'border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                              }`}
                          >
                            <div>
                              <p className="text-[8px] text-gray-400 uppercase font-black tracking-tighter opacity-70">
                                {node.type}
                              </p>
                              <p className={`text-xs font-bold transition-colors uppercase tracking-tight ${selectedNodeId === node._id ? 'text-indigo-600' : 'text-gray-700 dark:text-gray-200'
                                }`}>
                                {node.title}
                              </p>
                            </div>
                            <FiPlus className={`transition-all ${selectedNodeId === node._id ? 'text-indigo-400 rotate-45' : 'text-gray-300 group-hover:text-primary-400'}`} />
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {!selectedArenaId && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                      <FiTarget className="text-gray-300 h-8 w-8 mb-3" />
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Global Study Mode</p>
                      <p className="text-[9px] text-gray-400 mt-1 max-w-[200px]">Time will be tracked as "Self-Growth" without linking to any roadmap.</p>
                      <button
                        onClick={() => setShowArenaDropdown(false)}
                        className="mt-4 px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-black uppercase rounded-xl"
                      >
                        Keep Global
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-6">
          <div className="flex flex-col lg:flex-row gap-4 flex-1 w-full">
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
              <div className="flex flex-wrap sm:flex-nowrap gap-4">
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
                  className="flex-1 min-w-[140px] p-3 bg-gray-50/50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl outline-none transition-colors font-bold text-gray-700 dark:text-gray-200 text-sm shadow-sm placeholder-gray-400"
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
                  className="w-full sm:w-32 p-3 bg-gray-50/50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl outline-none transition-colors font-bold text-gray-700 dark:text-gray-200 text-sm shadow-sm placeholder-gray-400 dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={onAdd}
              className="w-full lg:w-auto px-10 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl hover:bg-black dark:hover:bg-gray-200 hover:scale-[1.03] active:scale-95 transition-transform dark:shadow-none uppercase tracking-widest text-xs flex justify-center"
            >
              {isEditing ? "Update Task" : "Add Task"}
            </button>
            {isEditing && (
              <button
                onClick={onCancel}
                className="w-full lg:w-auto px-7 py-5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-black rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors uppercase tracking-widest text-xs flex justify-center"
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
