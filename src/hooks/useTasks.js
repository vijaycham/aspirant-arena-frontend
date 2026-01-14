import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../utils/api";
import {
  setTasks,
  setArchivedTasks,
  addTask as addTaskAction,
  removeTask as removeTaskAction,
  toggleTask as toggleTaskAction,
  updateTask,
  clearArchived,
} from "../redux/slice/taskSlice";
import toast from "react-hot-toast";
import { sortTasks } from "../utils/tasks/taskHelpers";
import { hasAccess } from "../utils/auth/verifyHelpers";

export const useTasks = () => {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.task.tasks || []);
  const archivedTasks = useSelector((state) => state.task.archivedTasks || []);
  const user = useSelector((state) => state.user.currentUser);
  const loading = useSelector((state) => state.user.loading);

  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [selectedArenaId, setSelectedArenaId] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const [activeRes, archivedRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/tasks/archived")
      ]);
      if (activeRes.data?.tasks) dispatch(setTasks(activeRes.data.tasks));
      if (archivedRes.data?.tasks) dispatch(setArchivedTasks(archivedRes.data.tasks));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks.");
    }
  }, [dispatch]);

  useEffect(() => {
    // 🛡️ Guard: Only fetch if user has access (verified or within grace period)
    if (user && !loading && hasAccess(user)) {
      fetchTasks();
    }
  }, [user, loading, fetchTasks]);

  const addTask = async () => {
    const trimmedTask = task.trim();
    if (!trimmedTask) return;
    try {
      if (editingTask) {
        const res = await api.patch(`/tasks/${editingTask._id}`, {
          text: trimmedTask,
          priority,
          dueDate: dueDate || undefined,
          arenaId: selectedArenaId || undefined,
          nodeId: selectedNodeId || undefined,
        });
        dispatch(updateTask(res.data.task));
        toast.success("Task updated!");
        setEditingTask(null);
      } else {
        const res = await api.post("/tasks", {
          text: trimmedTask,
          priority,
          dueDate: dueDate || undefined,
          arenaId: selectedArenaId || undefined,
          nodeId: selectedNodeId || undefined,
        });
        dispatch(addTaskAction(res.data.task));
        toast.success("Task added!");
      }
      setTask("");
      setPriority("medium");
      setDueDate("");
      setSelectedArenaId("");
      setSelectedNodeId("");
    } catch {
      toast.error("Operation failed.");
    }
  };

  const startEditing = (taskItem) => {
    setEditingTask(taskItem);
    setTask(taskItem.text);
    setPriority(taskItem.priority);
    setDueDate(taskItem.dueDate || null);
    setSelectedArenaId(taskItem.arenaId || "");
    setSelectedNodeId(taskItem.nodeId || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setTask("");
    setPriority("medium");
    setDueDate("");
    setSelectedArenaId("");
    setSelectedNodeId("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTask();
    }
  };

  const toggleTask = async (id, currentStatus) => {
    try {
      const res = await api.patch(`/tasks/${id}`, {
        completed: !currentStatus,
        isArchived: false, // Always ensure task is visible (unarchived) on toggle
      });
      dispatch(toggleTaskAction(res.data.task));
      toast.success(!currentStatus ? "Task completed! 🎯" : "Task restored!");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const archiveTask = async (id) => {
    try {
      await api.patch(`/tasks/${id}`, { isArchived: true });
      dispatch(removeTaskAction(id)); // Remove from active list
      // Optionally fetch archived tasks to update that list immediately, implies network call though
      const archivedRes = await api.get("/tasks/archived");
      if (archivedRes.data?.tasks) dispatch(setArchivedTasks(archivedRes.data.tasks));

      toast.success("Task archived! 📦");
    } catch (error) {
      console.error("Archive error:", error);
      toast.error("Failed to archive task.");
    }
  };

  const removeTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      dispatch(removeTaskAction(id));
      toast.success("Task removed!");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error(error.response?.data?.message || "Failed to delete task.");
    }
  };

  const confirmClearArchive = async () => {
    try {
      await api.delete("/tasks/archived");
      dispatch(clearArchived());
      toast.success("Archive cleared!");
      setShowDeleteModal(false);
    } catch {
      toast.error("Failed to clear archive.");
      setShowDeleteModal(false);
    }
  };

  const clearAllArchived = () => {
    setShowDeleteModal(true);
  };

  const sortedTasks = sortTasks(tasks);

  return {
    tasks,
    archivedTasks,
    loading,
    task,
    setTask,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    editingTask,
    showArchived,
    setShowArchived,
    showDeleteModal,
    setShowDeleteModal,
    addTask,
    startEditing,
    cancelEditing,
    handleKeyDown,
    toggleTask,
    archiveTask,
    removeTask,
    confirmClearArchive,
    clearAllArchived,
    sortedTasks,
    selectedArenaId,
    setSelectedArenaId,
    selectedNodeId,
    setSelectedNodeId,
  };
};
