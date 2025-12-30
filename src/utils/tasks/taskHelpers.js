export const getPriorityColor = (p) => {
  switch (p) {
    case "high": return "text-red-500 bg-red-50 border-red-100";
    case "medium": return "text-amber-500 bg-amber-50 border-amber-100";
    case "low": return "text-green-500 bg-green-50 border-green-100";
    default: return "text-gray-500 bg-gray-50 border-gray-100";
  }
};

export const sortTasks = (tasks) => {
  return [...tasks].sort((a, b) => {
    const pWeight = { high: 1, medium: 2, low: 3 };
    if (pWeight[a.priority] !== pWeight[b.priority]) {
      return pWeight[a.priority] - pWeight[b.priority];
    }
    return new Date(a.dueDate || "9999") - new Date(b.dueDate || "9999");
  });
};
