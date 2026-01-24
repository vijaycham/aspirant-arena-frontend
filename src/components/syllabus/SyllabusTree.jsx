import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiChevronRight, FiPlus, FiBook, FiEdit2,
  FiClock, FiCheckCircle, FiCircle, FiCornerDownRight, FiTrash2, FiList
} from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { updateNode, createCustomNode, deleteNode } from '../../redux/slice/arenaSlice';
import { addTask } from '../../redux/slice/taskSlice';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { getChildType } from '../../domain/syllabusRules';

const SyllabusNode = React.memo(function SyllabusNode({ node, byId, childrenMap, arenaId, depth = 0 }) {
  // 📂 Auto-expand to Topic level (Depth 2: root=0, category=1, subject=2)
  // Let's set it to depth <= 1 so root and categories are open, topics (at depth 2) are visible.
  const [isOpen, setIsOpen] = useState(depth <= 1);
  const dispatch = useDispatch();

  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChildTitle, setNewChildTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title || "");

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
    if (window.confirm(`Delete "${node.title}" and its children?`)) {
      dispatch(deleteNode({ arenaId, nodeId: node._id }));
    }
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

  return (
    <div className={`select-none ${depth > 0 ? 'ml-6 border-l border-dashed border-gray-300/50' : ''}`}>
      <div
        onClick={() => isExpandable && setIsOpen(!isOpen)}
        className={`group flex items-center transition-all rounded-lg ${isExpandable ? 'cursor-pointer' : ''} ${typeStyles[node.type] || ''}`}
      >
        {/* Toggle Arrow */}
        {canHaveChildren ? (
          <div
            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
            className="mr-2 p-1 rounded hover:bg-black/5 cursor-pointer"
          >
            <FiChevronRight className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          </div>
        ) : <div className="w-6 mr-2" />}

        {/* Status Icon */}
        <div
          onClick={handleStatusToggle}
          className={`mr-3 ${isManuallyCompletable ? 'cursor-pointer hover:scale-110 transition-transform' : 'opacity-40 cursor-not-allowed'}`}
        >
          {statusIcons[node.status] || statusIcons.pending}
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
              <span className={`truncate font-medium ${node.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-gray-200'}`}>
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

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {canHaveChildren && (
            <button onClick={(e) => { e.stopPropagation(); setIsAddingChild(true); }} className="p-1 hover:text-primary-600">
              <FiCornerDownRight size={14} />
            </button>
          )}
          {node.type !== 'root' && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-500 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
              title="Rename Topic"
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
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-500 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
              title="Add to Daily Tasks"
            >
              <FiList size={14} />
            </button>
          )}
          {node.type !== 'root' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
              title="Delete Topic"
            >
              <FiTrash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {isAddingChild && (
        <div className="pl-9 py-2 flex gap-2">
          <input
            autoFocus
            className="border rounded px-2 py-1 text-sm flex-1"
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
            className="overflow-hidden"
          >
            {childIds.map(id => (
              <SyllabusNode
                key={id}
                node={byId[id]}
                byId={byId}
                childrenMap={childrenMap}
                arenaId={arenaId}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const SyllabusTree = ({ syllabusData, arenaId, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading syllabus...</div>;
  }

  if (!syllabusData?.rootIds?.length) {
    return (
      <div className="text-center py-12 bg-white/5 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
        <FiPlus className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-gray-900 dark:text-white font-medium">No Syllabus Found</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Initialize an Arena to start tracking.</p>
      </div>
    );
  }

  const { byId, childrenMap, rootIds } = syllabusData;

  return (
    <div className="space-y-4">
      {rootIds.map(id => (
        <SyllabusNode
          key={id}
          node={byId[id]}
          byId={byId}
          childrenMap={childrenMap}
          arenaId={arenaId}
        />
      ))}
    </div>
  );
};

export default SyllabusTree;
