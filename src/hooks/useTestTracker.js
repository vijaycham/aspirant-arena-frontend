import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const useTestTracker = () => {
  const [tests, setTests] = useState([]);
  const [stats, setStats] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showAdvance, setShowAdvance] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteData, setConfirmDeleteData] = useState(null);
  const [viewingReflection, setViewingReflection] = useState(null);
  const [page, setPage] = useState(1);

  const [formData, setFormData] = useState({
    subject: "",
    testName: "",
    marksObtained: "",
    totalMarks: 100,
    date: new Date().toISOString().split("T")[0],
    remarks: "",
    conceptualErrors: 0,
    sillyMistakes: 0,
    timeErrors: 0,
    unattendedQuestions: 0,
    targetPercentage: 70,
    difficulty: "Medium",
    reflection: "",
    timeTaken: "",
    startTime: ""
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [testsRes, statsRes, subjectsRes] = await Promise.all([
        api.get("/test"),
        api.get("/test/stats"),
        api.get("/test/subjects"),
      ]);
      setTests(testsRes.data.tests || []);
      setStats(statsRes.data.stats || []);
      setSubjects(subjectsRes.data.subjects || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load performance data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = useCallback(() => {
    setFormData({
      subject: "",
      testName: "",
      marksObtained: "",
      totalMarks: 100,
      date: new Date().toISOString().split("T")[0],
      remarks: "",
      conceptualErrors: 0,
      sillyMistakes: 0,
      timeErrors: 0,
      unattendedQuestions: 0,
      targetPercentage: 70,
      difficulty: "Medium",
      reflection: "",
      timeTaken: "",
      startTime: ""
    });
    setEditingId(null);
    setShowAdvance(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      marksObtained: Number(formData.marksObtained),
      totalMarks: Number(formData.totalMarks),
      conceptualErrors: Number(formData.conceptualErrors),
      sillyMistakes: Number(formData.sillyMistakes),
      timeErrors: Number(formData.timeErrors),
      unattendedQuestions: Number(formData.unattendedQuestions),
      targetPercentage: Number(formData.targetPercentage),
      timeTaken: formData.timeTaken ? Number(formData.timeTaken) : undefined,
    };

    try {
      if (editingId) {
        await api.put(`/test/${editingId}`, payload);
        toast.success("Test record updated! ✨");
      } else {
        await api.post("/test", payload);
        if (payload.conceptualErrors > 0) {
          try {
            // Smart Consolidation Logic
            const tasksRes = await api.get("/tasks");
            const existingTasks = tasksRes.data.tasks || [];
            
            const existingRevision = existingTasks.find(t => 
              !t.completed && t.text.startsWith(`Revise conceptual errors: ${payload.subject}`)
            );

            if (existingRevision) {
              // Update existing task text to include new test
              const newText = existingRevision.text.includes(payload.testName) 
                ? existingRevision.text 
                : `${existingRevision.text}, ${payload.testName}`;
              
              await api.put(`/tasks/${existingRevision._id}`, { text: newText });
              toast.success(`Updated ${payload.subject} revision task! 📚`);
            } else {
              // Create new task if none exists
              await api.post("/tasks", {
                text: `Revise conceptual errors: ${payload.subject} (${payload.testName})`,
                priority: "high",
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              });
              toast.success("Added revision task! 📚");
            }
          } catch (err) { 
            console.error("Revision Loop Error:", err);
          }
        }
        toast.success("Test logged! Data updated.");
      }
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = useCallback((test) => {
    setFormData({
      subject: test.subject,
      testName: test.testName,
      marksObtained: test.marksObtained,
      totalMarks: test.totalMarks,
      date: new Date(test.date).toISOString().split("T")[0],
      remarks: test.remarks || "",
      conceptualErrors: test.conceptualErrors || 0,
      sillyMistakes: test.sillyMistakes || 0,
      timeErrors: test.timeErrors || 0,
      unattendedQuestions: test.unattendedQuestions || 0,
      targetPercentage: test.targetPercentage || 70,
      difficulty: test.difficulty || "Medium",
      reflection: test.reflection || "",
      timeTaken: test.timeTaken || "",
      startTime: test.startTime || ""
    });
    setEditingId(test._id);
    setShowAdvance(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleDelete = async () => {
    if (!confirmDeleteData) return;
    try {
      await api.delete(`/test/${confirmDeleteData.id}`);
      toast.success("Record removed.");
      setConfirmDeleteData(null);
      fetchData();
    } catch {
      toast.error("Failed to delete record");
    }
  };

  const marksLost = useMemo(() => {
    const total = Number(formData.totalMarks) || 0;
    const obtained = Number(formData.marksObtained) || 0;
    return Math.max(0, total - obtained);
  }, [formData.totalMarks, formData.marksObtained]);

  const accountedMarks = useMemo(() => {
    return (
      Number(formData.conceptualErrors) +
      Number(formData.sillyMistakes) +
      Number(formData.timeErrors) +
      Number(formData.unattendedQuestions)
    );
  }, [formData.conceptualErrors, formData.sillyMistakes, formData.timeErrors, formData.unattendedQuestions]);

  const quickStats = useMemo(() => {
    if (tests.length === 0) return null;
    const pool = selectedSubject === "All" ? tests : tests.filter(t => t.subject === selectedSubject);
    if (pool.length === 0) return null;

    const sorted = [...pool].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA - dateB !== 0) return dateA - dateB;
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });

    const latestTest = sorted[sorted.length - 1];
    const prevTest = sorted.length > 1 ? sorted[sorted.length - 2] : null;
    const currentAcc = (latestTest.marksObtained / (latestTest.totalMarks || 1)) * 100;
    const prevAcc = prevTest ? (prevTest.marksObtained / (prevTest.totalMarks || 1)) * 100 : null;
    const diffAcc = prevAcc !== null ? currentAcc - prevAcc : 0;

    const avgAccuracy = pool.reduce((acc, t) => acc + (t.marksObtained / (t.totalMarks || 1)), 0) / pool.length;
    
    // Calculate Average Speed (Marks per Min)
    const sessionsWithTime = pool.filter(t => t.timeTaken && t.timeTaken > 0);
    const avgSpeed = sessionsWithTime.length > 0 
      ? sessionsWithTime.reduce((acc, t) => acc + (t.marksObtained / t.timeTaken), 0) / sessionsWithTime.length
      : 0;

    const totalMistakes = pool.reduce((acc, t) => acc + (t.conceptualErrors || 0) + (t.sillyMistakes || 0) + (t.timeErrors || 0) + (t.unattendedQuestions || 0), 0);
    const avgMistakes = pool.length > 0 ? (totalMistakes / pool.length).toFixed(1) : 0;

    const bestSubject = stats.length > 0 ? stats[0]._id : "N/A";

    return {
      total: pool.length,
      accuracy: Math.round(avgAccuracy * 100),
      avgSpeed: avgSpeed.toFixed(2),
      best: bestSubject,
      avgMistakes,
      lastChange: Math.round(diffAcc)
    };
  }, [tests, stats, selectedSubject]);

  const filteredTests = useMemo(() => {
     return selectedSubject === "All" ? tests : tests.filter(t => t.subject === selectedSubject);
  }, [tests, selectedSubject]);

  const chartData = useMemo(() => {
    return filteredTests
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((t) => ({
        name: t.testName,
        score: (t.marksObtained / (t.totalMarks || 1)) * 100,
        subject: t.subject,
      }));
  }, [filteredTests]);

  const mistakeData = useMemo(() => {
    if (selectedSubject === "All") {
      return tests.reduce((acc, t) => {
        acc[0].value += (t.conceptualErrors || 0);
        acc[1].value += (t.sillyMistakes || 0);
        acc[2].value += (t.timeErrors || 0);
        acc[3].value += (t.unattendedQuestions || 0);
        return acc;
      }, [{ name: "Conceptual", value: 0 }, { name: "Silly", value: 0 }, { name: "Time", value: 0 }, { name: "Unattended", value: 0 }]);
    } else {
      const subjStat = stats.find(s => s._id === selectedSubject);
      if (!subjStat) return [];
      return [
        { name: "Conceptual", value: subjStat.totalConceptual || 0 },
        { name: "Silly", value: subjStat.totalSilly || 0 },
        { name: "Time", value: subjStat.totalTime || 0 },
        { name: "Unattended", value: subjStat.totalUnattended || 0 },
      ];
    }
  }, [tests, stats, selectedSubject]);

  const currentTarget = useMemo(() => {
    if (selectedSubject === "All") return 70;
    const subjStat = stats.find(s => s._id === selectedSubject);
    return subjStat ? Math.round(subjStat.avgTarget) : 70;
  }, [stats, selectedSubject]);

  return {
    tests,
    stats,
    subjects,
    selectedSubject,
    setSelectedSubject,
    loading,
    showAdvance,
    setShowAdvance,
    editingId,
    confirmDeleteData,
    setConfirmDeleteData,
    viewingReflection,
    setViewingReflection,
    page,
    setPage,
    formData,
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    marksLost,
    accountedMarks,
    quickStats,
    filteredTests,
    chartData,
    mistakeData,
    currentTarget
  };
};

export default useTestTracker;
