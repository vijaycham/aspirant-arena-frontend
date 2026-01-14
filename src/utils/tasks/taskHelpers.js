const PRIORITY_STYLES = {
  high: "text-red-500 bg-red-50 border-red-100",
  medium: "text-amber-500 bg-amber-50 border-amber-100",
  low: "text-green-500 bg-green-50 border-green-100",
};

export const getPriorityColor = (priority = "low") => {
  return PRIORITY_STYLES[priority] ?? "text-gray-500 bg-gray-50 border-gray-100";
};

const PRIORITY_WEIGHT = {
  high: 1,
  medium: 2,
  low: 3,
};

const getTime = (date) => {
  const t = new Date(date).getTime();
  return Number.isFinite(t) ? t : Infinity;
};

export const sortTasks = (tasks = []) => {
  return [...tasks].sort((a, b) => {
    // 1️⃣ Due date (earliest first, missing/invalid at bottom)
    const dateA = getTime(a?.dueDate);
    const dateB = getTime(b?.dueDate);

    if (dateA !== dateB) {
      return dateA - dateB;
    }

    // 2️⃣ Priority (high → medium → low)
    const pA = PRIORITY_WEIGHT[a?.priority] ?? 99;
    const pB = PRIORITY_WEIGHT[b?.priority] ?? 99;

    return pA - pB;
  });
};

// ✅ Helper: Convert ISO (UTC) -> Local YYYY-MM-DDTHH:mm (for input value)
export const toLocalDateTimeInput = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  // Manual offset calculation to get local time in ISO format
  // new Date(iso).toISOString() gives UTC.
  // We want local time, formatted as ISO.
  // Trick: Shift time by timezone offset, then toISOString, then slice.
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

// ✅ Helper: Convert Local Input Value -> ISO (UTC) (for storage)
export const fromLocalDateTimeInput = (localValue) => {
  if (!localValue) return null;
  return new Date(localValue).toISOString();
};
