import { createSlice } from "@reduxjs/toolkit";

const initialState = { tasks: [], archivedTasks: [] };

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
      const { _id, isArchived } = action.payload;
      
      // Remove from everywhere first to avoid duplicates
      state.tasks = state.tasks.filter(t => t._id !== _id);
      state.archivedTasks = state.archivedTasks.filter(t => t._id !== _id);
      
      // Add to appropriate list
      if (isArchived) {
        state.archivedTasks.unshift(action.payload);
      } else {
        state.tasks.push(action.payload);
      }
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) state.tasks[index] = action.payload;
    },
    setArchivedTasks: (state, action) => {
      state.archivedTasks = Array.isArray(action.payload) ? action.payload : [];
    },
    archiveTask: (state, action) => {
      state.tasks = state.tasks.filter((t) => t._id !== action.payload._id);
      state.archivedTasks.unshift(action.payload);
    },
    clearArchived: (state) => {
      state.archivedTasks = [];
    },
  },
});

export const { 
  setTasks, 
  setArchivedTasks, 
  addTask, 
  removeTask, 
  toggleTask, 
  updateTask,
  archiveTask,
  clearArchived 
} = taskSlice.actions;
export default taskSlice.reducer;
