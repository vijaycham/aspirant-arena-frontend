import { createSlice } from "@reduxjs/toolkit";

const initialState = { tasks: [] };

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = Array.isArray(action.payload) ? action.payload : [];
    },
    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },
    removeTask: (state, action) => {
      state.tasks = state.tasks.filter((task) => task._id !== action.payload);
    },
    toggleTask: (state, action) => {
      const index = state.tasks.findIndex(
        (task) => task._id === action.payload._id
      );
      if (index !== -1) state.tasks[index] = action.payload; // ✅ Use updated task from backend
    },
  },
});

export const { setTasks, addTask, removeTask, toggleTask } = taskSlice.actions;
export default taskSlice.reducer;
