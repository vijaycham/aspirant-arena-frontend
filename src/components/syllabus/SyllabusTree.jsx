import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiChevronRight, FiChevronDown, FiPlus, FiBook, 
  FiClock, FiCheckCircle, FiCircle, FiExternalLink, FiMoreVertical 
} from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { updateNode } from '../../redux/slice/arenaSlice';
import { addTask } from '../../redux/slice/taskSlice';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const SyllabusNode = ({ node, nodeMap, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(depth < 2); 
  const dispatch = useDispatch();
  
  // O(1) Lookup instead of O(N) filter
  const children = nodeMap[node._id] || [];
  const hasChildren = children.length > 0;

  const handleStatusToggle = (e) => {
    e.stopPropagation();
    const nextStatus = node.status === 'completed' ? 'pending' : 'completed';
    dispatch(updateNode({ 
      nodeId: node._id, 
      updates: { status: nextStatus } 
    }));
  };

  const statusIcons = {
    pending: <FiCircle className="text-gray-300" />,
    'in-progress': <FiClock className="text-amber-500 animate-pulse" />,
    completed: <FiCheckCircle className="text-emerald-500" />
  };

  const typeStyles = {
    subject: "border-b border-primary-100 bg-primary-50/50 text-gray-900",
    topic: "bg-white hover:bg-gray-50 border-b border-gray-50 text-gray-800",
    subtopic: "text-sm text-gray-700 hover:bg-gray-50",
    'micro-topic': "text-xs italic text-gray-500 hover:bg-gray-50"
  };

  return (
    <div className={`select-none ${depth > 0 ? 'ml-6 border-l border-gray-200' : ''}`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center p-3 transition-all rounded-lg cursor-pointer ${typeStyles[node.type] || ''}`}
      >
        {/* Toggle Arrow */}
        <div className="w-6 flex items-center justify-center">
          {hasChildren && (
            <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
              <FiChevronRight className="text-gray-400 group-hover:text-primary-600" />
            </motion.div>
          )}
        </div>

        {/* Status Icon */}
        <div onClick={handleStatusToggle} className="mx-2 hover:scale-110 transition-transform">
          {statusIcons[node.status]}
        </div>

        {/* Title & Stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`truncate font-medium ${node.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              {node.title}
            </span>
            {node.timeSpent > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 font-mono">
                {node.timeSpent}m
              </span>
            )}
          </div>
          {node.description && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{node.description}</p>
          )}
        </div>

        {/* Actions (Promote to Task) */}
        <div className="flex items-center gap-2 mr-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {node.type !== 'subject' && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const res = await api.post("/tasks", {
                    text: node.title,
                    priority: 'medium',
                    arenaId: node.arenaId,
                    nodeId: node._id
                  });
                  dispatch(addTask(res.data.task));
                  toast.success("Added to Tasks! 📝");
                } catch (err) {
                  toast.error("Failed to add task");
                }
              }}
              className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
              title="Add to Daily Tasks"
            >
              <FiPlus size={14} />
            </button>
          )}
          {node.resources?.length > 0 && (
            <FiBook className="text-primary-500 h-4 w-4" title="Resources available" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {children.map(child => (
              <SyllabusNode 
                key={child._id} 
                node={child} 
                nodeMap={nodeMap}
                depth={depth + 1} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SyllabusTree = ({ nodes }) => {
  // Performance Optimization: Pre-compute parentId -> children map
  // This reduces rendering complexity from O(N^2) to O(N)
  const { rootNodes, nodeMap } = React.useMemo(() => {
    const map = {};
    const roots = [];
    
    nodes.forEach(node => {
      if (!node.parentId) {
        roots.push(node);
      } else {
        if (!map[node.parentId]) map[node.parentId] = [];
        map[node.parentId].push(node);
      }
    });

    return { rootNodes: roots, nodeMap: map };
  }, [nodes]);

  if (nodes.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-gray-200">
        <FiPlus className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-gray-900 font-medium">No Syllabus Found</h3>
        <p className="text-gray-500 text-sm">Initialize an Arena to start tracking.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rootNodes.map(node => (
        <SyllabusNode key={node._id} node={node} nodeMap={nodeMap} />
      ))}
    </div>
  );
};

export default SyllabusTree;
