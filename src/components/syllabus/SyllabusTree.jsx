import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiChevronRight, FiPlus, FiBook, FiEdit2,
  FiClock, FiCheckCircle, FiCircle, FiCornerDownRight, FiTrash2, FiList, FiLayers
} from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { updateNode, createCustomNode, deleteNode } from '../../redux/slice/arenaSlice';
import { addTask } from '../../redux/slice/taskSlice';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { getChildType } from '../../domain/syllabusRules';
import { FiX } from 'react-icons/fi';

const SyllabusNode = React.memo(function SyllabusNode({
  node, byId, childrenMap, arenaId, depth = 0,
  activeManageNodeId, setActiveManageNodeId,
  activeAddNodeId, setActiveAddNodeId
}) {
  // 📂 Auto-expand to Topic level (Depth 2: root=0, category=1, subject=2)
  // Let's set it to depth <= 1 so root and categories are open, topics (at depth 2) are visible.
  const [isOpen, setIsOpen] = useState(depth <= 1);
  const dispatch = useDispatch();

  const [newChildTitle, setNewChildTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node?.title || "");
  const showManage = activeManageNodeId === node._id;
  const setShowManage = (val) => {
    setActiveManageNodeId(val ? node._id : null);
    if (val) setActiveAddNodeId(null); // Close add form if opening manage
  };
  const isAddingChild = activeAddNodeId === node._id;
  const setIsAddingChild = (val) => {
    setActiveAddNodeId(val ? node._id : null);
    if (val) setActiveManageNodeId(null); // Close manage if opening add form
  };
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!node) return null;

  const childIds = childrenMap[node._id] || [];
  const hasChildren = childIds.length > 0;
  const childType = getChildType(node.type);
  const canHaveChildren = childType !== null;
  const isExpandable = canHaveChildren && hasChildren;

  // Toggling is allowed for leaves or if manually overriding
  // We disable toggling for root, category, and subject to maintain hierarchy integrity
  const isManuallyCompletable = !['root', 'category', 'subject'].includes(node.type);

  const handleStatusToggle = (e) => {
    e.stopPropagation();
    if (!isManuallyCompletable) return;
    const nextStatus = {
      'pending': 'in-progress',
      'in-progress': 'completed',
      'completed': 'pending'
    };
    dispatch(updateNode({
      arenaId,
      nodeId: node._id,
      status: nextStatus[node.status] || 'in-progress'
    }));
  };

  const handleRename = async () => {
    if (!editTitle.trim() || editTitle === node.title) {
      setIsEditing(false);
      return;
    }
    await dispatch(updateNode({
      arenaId,
      nodeId: node._id,
      title: editTitle
    }));
    setIsEditing(false);
  };

  const handleAddChild = async () => {
    if (!newChildTitle.trim()) return;
    await dispatch(createCustomNode({
      arenaId,
      parentId: node._id,
      title: newChildTitle,
      type: childType
    }));
    setNewChildTitle("");
    setIsAddingChild(false);
    setIsOpen(true);
  };

  const handleDelete = () => {
    dispatch(deleteNode({ arenaId, nodeId: node._id }));
    setShowDeleteConfirm(false);
  };

  const statusIcons = {
    pending: <FiCircle className="text-gray-300" />,
    'in-progress': <FiClock className="text-amber-500" />,
    completed: <FiCheckCircle className="text-emerald-500" />
  };

  const typeStyles = {
    root: "p-4 border-b-2 border-primary-500 bg-primary-100/30 dark:bg-primary-900/40 text-gray-900 dark:text-white text-lg font-black uppercase tracking-widest",
    category: "p-3.5 border-b border-primary-200 bg-primary-50/80 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 font-bold",
    subject: "p-3 border-b border-primary-100 dark:border-white/10 bg-primary-50/50 dark:bg-primary-900/20 text-gray-900 dark:text-gray-100",
    topic: "px-4 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-b border-gray-50 dark:border-white/5 text-gray-800 dark:text-gray-200",
    subtopic: "px-4 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5",
    'micro-topic': "px-4 py-1 text-xs italic text-gray-500 dark:text-gray-500 hover:bg-transparent cursor-text"
  };

  const depthColors = [
    'border-primary-500',   // Root
    'border-indigo-500',    // Category
    'border-amber-500',     // Subject
    'border-emerald-500',   // Topic
    'border-slate-400',     // Subtopic
    'border-slate-300'      // Micro-topic
  ];

  return (
    <div className={`select-none 
      ${depth > 0 ? `border-l-2 ${depthColors[depth] || 'border-gray-300'}` : ''} 
      ${depth > 0 ? (depth === 1 ? 'ml-2 md:ml-6' : 'ml-1 md:ml-6') : ''}
    `}>
      <div
        onClick={() => isExpandable && setIsOpen(!isOpen)}
        className={`group flex items-center transition-all rounded-lg py-2 ${isExpandable ? 'cursor-pointer' : ''} active:scale-[0.98] md:active:scale-100 ${typeStyles[node.type] || ''}`}
      >
        {/* 1️⃣ Expand/Indent Pillar (Left-most) */}
        <div className="w-6 shrink-0 flex items-center justify-center">
          {canHaveChildren ? (
            <div
              onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
              className="p-1 rounded hover:bg-black/5 cursor-pointer transition-colors"
            >
              <FiChevronRight className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
            </div>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-white/10" />
          )}
        </div>

        {/* 2️⃣ Status Pillar (Fixed alignment for scannability - Slimmer on mobile) */}
        <div
          onClick={handleStatusToggle}
          className={`w-8 md:w-10 shrink-0 flex items-center justify-center ${isManuallyCompletable ? 'cursor-pointer hover:scale-110 active:scale-90 transition-all' : 'opacity-40 cursor-not-allowed'}`}
          title={isManuallyCompletable ? "Toggle Status" : "Parent status is automatic"}
        >
          <div className="text-lg">
            {statusIcons[node.status] || statusIcons.pending}
          </div>
        </div>

        {/* Title & Stats */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              autoFocus
              className="w-full bg-white dark:bg-slate-700 border-2 border-primary-500 rounded px-2 py-0.5 font-medium text-gray-900 dark:text-white outline-none"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') { setEditTitle(node.title); setIsEditing(false); }
              }}
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className={`font-medium leading-snug md:leading-tight ${node.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-gray-200'}`}>
                {node.title}
              </span>
              {node.timeSpent > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-mono font-bold">
                  {node.timeSpent}m
                </span>
              )}
              {node.resources?.length > 0 && (
                <FiBook className="text-primary-500 h-3 w-3" title="Resources available" />
              )}
            </div>
          )}
        </div>

        {/* Actions (Tap-safe on mobile, hover-based on desktop) */}
        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity pr-2">
          {/* Manage Toggle (Mobile Only - Contains ALL secondary actions for space) */}
          <div className="md:hidden relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowManage(!showManage); }}
              className={`p-2 rounded-lg transition-all ${showManage ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-slate-800 text-gray-400'}`}
              aria-label="Manage node"
            >
              <FiEdit2 size={16} />
            </button>
            <AnimatePresence>
              {showManage && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 min-w-[140px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 p-1.5 rounded-2xl shadow-2xl z-20 origin-top-right overflow-hidden"
                >
                  {node.type !== 'subject' && node.type !== 'root' && node.type !== 'category' && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const res = await api.post("/tasks", { text: node.title, arenaId, nodeId: node._id });
                        dispatch(addTask(res.data.task));
                        toast.success("Added to Tasks!");
                        setShowManage(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-colors text-sm font-bold"
                    >
                      <FiList size={16} /> Add to Tasks
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowManage(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-colors text-sm font-bold"
                  >
                    <FiEdit2 size={16} /> Rename
                  </button>
                  {canHaveChildren && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsAddingChild(true); setShowManage(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors text-sm font-bold"
                    >
                      <FiCornerDownRight size={16} /> Add Topic
                    </button>
                  )}
                  <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); setShowManage(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors text-sm font-bold"
                  >
                    <FiTrash2 size={16} /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Only Actions (Full set, always scannable) */}
          <div className="hidden md:flex items-center gap-1.5">
            {canHaveChildren && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsAddingChild(true); }}
                className="p-1.5 hover:text-primary-600 transition-colors"
                title="Add Child Topic"
              >
                <FiCornerDownRight size={14} />
              </button>
            )}
            {node.type !== 'root' && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                className="p-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-500 hover:bg-primary-600 hover:text-white transition-all outline-none"
                title="Rename"
              >
                <FiEdit2 size={12} />
              </button>
            )}
            {node.type !== 'subject' && node.type !== 'root' && node.type !== 'category' && (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const res = await api.post("/tasks", { text: node.title, arenaId, nodeId: node._id });
                  dispatch(addTask(res.data.task));
                  toast.success("Added to Tasks!");
                }}
                className="p-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-500 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                title="Add to Daily Tasks"
              >
                <FiList size={14} />
              </button>
            )}
            {node.type !== 'root' && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                title="Delete"
              >
                <FiTrash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {isAddingChild && (
        <div className="pl-4 md:pl-9 py-2 flex gap-2">
          <input
            autoFocus
            className="border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded px-2 py-1 text-sm flex-1 outline-none focus:border-primary-500"
            placeholder={`Add ${childType?.charAt(0).toUpperCase() + childType?.slice(1)}...`}
            value={newChildTitle}
            onChange={(e) => setNewChildTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddChild()}
          />
          <button onClick={handleAddChild} className="text-primary-600"><FiPlus /></button>
          <button onClick={() => setIsAddingChild(false)}>&times;</button>
        </div>
      )}

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className=""
          >
            {childIds.map(id => (
              <SyllabusNode
                key={id}
                node={byId[id]}
                byId={byId}
                childrenMap={childrenMap}
                arenaId={arenaId}
                depth={depth + 1}
                activeManageNodeId={activeManageNodeId}
                setActiveManageNodeId={setActiveManageNodeId}
                activeAddNodeId={activeAddNodeId}
                setActiveAddNodeId={setActiveAddNodeId}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal / Bottom Sheet */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 z-[110] flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 p-6 pb-10 md:p-8 w-full max-w-none md:max-w-sm rounded-t-[2.5rem] rounded-b-none md:rounded-[2.5rem] shadow-[0_-20px_50px_-10px_rgba(0,0,0,0.3)] border-t border-x border-gray-100 dark:border-white/5 md:border text-center"
            >
              {/* Native-style Grab Handle */}
              <div className="w-12 h-1 bg-gray-200 dark:bg-white/20 rounded-full mx-auto mb-8 md:hidden" />

              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 scale-90 md:scale-100">
                <FiTrash2 />
              </div>

              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Delete Topic?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed px-2">
                Are you sure you want to delete <span className="text-rose-600 dark:text-rose-400 font-bold italic">&quot;{node.title}&quot;</span>? <br />
                All sub-topics and progress tracking will be permanently removed.
              </p>

              <div className="flex flex-col md:flex-row gap-3">
                <button
                  onClick={handleDelete}
                  className="order-1 md:order-2 flex-1 py-4 bg-rose-500 text-white font-black rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 uppercase tracking-widest text-[10px]"
                >
                  Delete Topic
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="order-2 md:order-1 flex-1 py-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold transition-all uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});
const SyllabusTree = ({ syllabusData, arenaId, isLoading }) => {
  const [activeManageNodeId, setActiveManageNodeId] = React.useState(null);
  const [activeAddNodeId, setActiveAddNodeId] = React.useState(null);
  const [isAddingFirst, setIsAddingFirst] = React.useState(false);
  const [firstTitle, setFirstTitle] = React.useState("");
  const dispatch = useDispatch();
  const treeRef = React.useRef(null);

  const { byId, childrenMap } = syllabusData || { byId: {}, childrenMap: {} };
  const rootIds = syllabusData?.rootIds || [];



  const handleCreateFirst = async () => {
    if (!firstTitle.trim()) return;
    try {
      await dispatch(createCustomNode({
        arenaId,
        parentId: null, // Root level
        title: firstTitle,
        type: 'category' // Default first level
      }));
      setFirstTitle("");
      setIsAddingFirst(false);
      toast.success("First goal created! 🎯");
    } catch (err) {
      toast.error("Failed to create goal");
    }
  };

  // Close menu/form on click outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (treeRef.current && !treeRef.current.contains(e.target)) {
        setActiveManageNodeId(null);
        setActiveAddNodeId(null);
      }
    };
    if (activeManageNodeId || activeAddNodeId) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [activeManageNodeId, activeAddNodeId]);

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading syllabus...</div>;
  }

  if (rootIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50/50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-white/5 transition-all">
        <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-gray-300 dark:text-gray-600 mb-6 group-hover:scale-110 transition-transform">
          <FiLayers size={40} className="opacity-50" />
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Build Your Path</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[280px] mb-8 font-medium leading-relaxed">
          This arena is empty. Start by adding your first subject or category.
        </p>

        {isAddingFirst ? (
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <input
              autoFocus
              className="w-full bg-white dark:bg-slate-800 border-2 border-primary-500 rounded-2xl px-4 py-3 font-bold text-gray-900 dark:text-white outline-none shadow-lg"
              placeholder="e.g. Preliminary Phase..."
              value={firstTitle}
              onChange={(e) => setFirstTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFirst();
                if (e.key === 'Escape') setIsAddingFirst(false);
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateFirst}
                className="flex-1 py-3 bg-primary-600 text-white font-black rounded-xl shadow-lg active:scale-95 transition-all text-xs uppercase"
              >
                Create Goal
              </button>
              <button
                onClick={() => setIsAddingFirst(false)}
                className="px-4 py-3 text-gray-400 font-bold hover:text-gray-600 dark:hover:text-gray-200 transition-all"
              >
                <FiX />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingFirst(true)}
            className="group flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-primary-500/20 active:scale-95"
          >
            <FiPlus className="group-hover:rotate-90 transition-transform" />
            Add First Goal
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4" ref={treeRef}>
      {rootIds.map(id => (
        <SyllabusNode
          key={id}
          node={byId[id]}
          byId={byId}
          childrenMap={childrenMap}
          arenaId={arenaId}
          depth={0}
          activeManageNodeId={activeManageNodeId}
          setActiveManageNodeId={setActiveManageNodeId}
          activeAddNodeId={activeAddNodeId}
          setActiveAddNodeId={setActiveAddNodeId}
        />
      ))}
    </div>
  );
};

export default SyllabusTree;
