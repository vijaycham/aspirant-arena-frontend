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
    const lowerCaseTask = task.toLowerCase();

    // 1. Arena Matches (always include if they match the task)
    const arenaMatches = arenas.filter(a =>
      a.title.toLowerCase().includes(lowerCaseTask)
    ).map(a => ({
      _id: a._id, // Use arena's ID as _id for consistency
      title: a.title,
      type: 'arena', // Special type to distinguish from topics
      arenaId: a._id // Arena ID is itself
    }));

    // 2. Topic Matches
    let topicMatches = [];
    if (selectedArenaId && syllabus[selectedArenaId]) {
      // Single Arena Search for topics
      topicMatches = Object.values(syllabus[selectedArenaId].byId)
        .filter(n => !['root', 'category', 'subject'].includes(n.type) && n.title.toLowerCase().includes(lowerCaseTask))
        .map(n => ({ ...n, arenaId: selectedArenaId }));
    } else {
      // Global Search for topics
      const allTopics = Object.entries(syllabus).flatMap(([arenaId, data]) =>
        Object.values(data.byId).map(n => ({ ...n, arenaId }))
      );

      topicMatches = allTopics.filter(n =>
        !['root', 'category', 'subject'].includes(n.type) &&
        n.title.toLowerCase().includes(lowerCaseTask)
      );
    }

    // Combine arena and topic matches, prioritizing arenas if desired, or just combining.
    sourceData = [...arenaMatches, ...topicMatches];

    return sourceData.slice(0, 5); // Limit total suggestions
  }, [task, syllabus, selectedArenaId, arenas]);

  React.useEffect(() => {
    if (arenas.length === 0) dispatch(fetchArenas());
  }, [arenas.length, dispatch]);

  React.useEffect(() => {
    if (selectedArenaId && !syllabus[selectedArenaId]) {
      dispatch(fetchSyllabus(selectedArenaId));
    }
  }, [selectedArenaId, dispatch, syllabus]);

  // REMOVED: Auto-selection of currentArenaId. Default to Global (No selection).
  // React.useEffect(() => {
  //   if (!selectedArenaId && currentArenaId) {
  //     setSelectedArenaId(currentArenaId);
  //   }
  // }, [currentArenaId, selectedArenaId, setSelectedArenaId]);

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
  // btnRef is no longer needed as we wrap the whole interactable area

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      // If we clicked outside the entire container (button + dropdown), close it
      if (
        showArenaDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
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
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
            Task Description
          </label>
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="What needs to be done?"
            onFocus={() => setShowSuggestions(true)}
            className="w-full p-4 bg-gray-50/50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-colors font-bold text-gray-700 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-sm"
          />

          {/* Type-Ahead Suggestions - Hide if already linked */}
          <AnimatePresence>
            {showSuggestions && task.length > 1 && !selectedNodeId && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-black/50 p-2 space-y-1 max-h-60 overflow-y-auto"
              >
                <div className="px-3 py-1.5 mb-1 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Link to Roadmap Topic?
                  </span>
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="text-gray-300 hover:text-black dark:hover:text-white"
                  >
                    &times;
                  </button>
                </div>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion._id}
                    onClick={() => {
                      setSelectedArenaId(suggestion.arenaId);
                      setSelectedNodeId(suggestion._id);
                      // Don't auto-complete text, just link it.
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group flex items-center justify-between"
                  >
                    <div>
                      <p className="text-[8px] text-gray-400 uppercase font-black tracking-tighter">
                        {arenas.find((a) => a._id === suggestion.arenaId)?.title} • {suggestion.type}
                      </p>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {suggestion.title}
                      </p>
                    </div>
                    <FiPlus className="text-gray-300 group-hover:text-primary-400 transition-all" />
                  </button>
                ))}

                {suggestions.length === 0 && (
                  <div className="p-3 text-center">
                    <p className="text-[9px] text-gray-400 italic mb-2">
                      {selectedArenaId ? "No matching topics found." : "Select an Arena to link topics."}
                    </p>
                    {/* Fallback Action */}
                    <button
                      className="w-full py-2 bg-gray-50 dark:bg-slate-800 rounded-xl text-[9px] font-black uppercase text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      onClick={() => setShowSuggestions(false)}
                    >
                      Use as General Task
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Linked Context Badge (Interactable for simple switching) */}
          <div ref={dropdownRef} className="relative flex flex-wrap gap-2 mt-4 mb-2">
            {!selectedNodeId && !selectedArenaId && (
              <button
                onClick={() => setShowArenaDropdown(!showArenaDropdown)}
                className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2 transition-all hover:bg-white hover:shadow-md hover:scale-105 active:scale-95 group"
                title="Click to switch Arena context"
              >
                <FiLayers size={10} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                General Study (Global)
              </button>
            )}

            {selectedArenaId && !selectedNodeId && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowArenaDropdown(!showArenaDropdown)}
                  className="px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-500/20 text-[9px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 flex items-center gap-2 shadow-sm transition-all hover:shadow-md hover:scale-105 active:scale-95"
                >
                  <FiLayers size={10} />
                  {arenas.find((a) => a._id === selectedArenaId)?.title || "Arena"}
                </button>
                <button
                  onClick={() => setSelectedArenaId("")}
                  className="p-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-rose-500 transition-all"
                >
                  <FiX size={12} />
                </button>
              </div>
            )}

            {selectedNodeId && (
              <div className="flex items-center gap-1 group">
                <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-2 shadow-sm">
                  <FiTarget size={10} className="animate-pulse" />{" "}
                  {selectedNode?.title || "Linked Topic"}
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

            {/* Mini Context Switcher Dropdown */}
            <AnimatePresence>
              {showArenaDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute top-full left-0 mt-2 z-50 w-48 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-black/50 p-1 flex flex-col gap-1 overflow-hidden"
                >
                  <p className="px-3 py-2 text-[8px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-50 dark:border-white/5 mb-1">Select Context</p>

                  <button
                    onClick={() => {
                      setSelectedArenaId("");
                      setShowArenaDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold transition-colors flex items-center gap-2 ${!selectedArenaId ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                  >
                    <FiLayers size={10} /> Global (No Arena)
                  </button>

                  {arenas.map(arena => (
                    <button
                      key={arena._id}
                      onClick={() => {
                        setSelectedArenaId(arena._id);
                        setShowArenaDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold transition-colors flex items-center gap-2 ${selectedArenaId === arena._id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                      <span className="truncate">{arena.title}</span> {arena.isPrimary && '⭐'}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-6">
          <div className="flex flex-col lg:flex-row gap-4 flex-1 w-full">
            <div className="space-y-1 w-full md:w-32 flex-none">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                Priority
              </label>
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
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                Due Date & Time
              </label>
              <div className="flex flex-wrap sm:flex-nowrap gap-4">
                <input
                  type="date"
                  value={dueDate ? toLocalDateTimeInput(dueDate).split("T")[0] : ""}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    if (!newDate) {
                      setDueDate(null);
                      return;
                    }
                    const currentLocal = dueDate
                      ? toLocalDateTimeInput(dueDate)
                      : "";
                    const currentTime = currentLocal
                      ? currentLocal.split("T")[1]
                      : "09:00";
                    setDueDate(fromLocalDateTimeInput(`${newDate}T${currentTime}`));
                  }}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="flex-1 min-w-[140px] p-3 bg-gray-50/50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl outline-none transition-colors font-bold text-gray-700 dark:text-gray-200 text-sm shadow-sm placeholder-gray-400"
                />
                <input
                  type="time"
                  value={dueDate ? toLocalDateTimeInput(dueDate).split("T")[1] : "09:00"}
                  onChange={(e) => {
                    const newTime = e.target.value;
                    const currentLocal = dueDate
                      ? toLocalDateTimeInput(dueDate)
                      : "";
                    const currentDate = currentLocal
                      ? currentLocal.split("T")[0]
                      : new Date().toISOString().split("T")[0];
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
