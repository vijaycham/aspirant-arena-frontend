import { createSlice } from "@reduxjs/toolkit";

const initialState = { todos: [] };

const todoSlice = createSlice({
  name: "todo",
  initialState,
  reducers: {
    setTodos: (state, action) => {
      state.todos = action.payload;
    },
    addTodo: (state, action) => {
      state.todos.push(action.payload);
    },
    removeTodo: (state, action) => {
      state.todos = state.todos.filter((todo) => todo._id !== action.payload);
    },
    toggleTodo: (state, action) => {
      const index = state.todos.findIndex(
        (todo) => todo._id === action.payload._id
      );
      if (index !== -1) state.todos[index] = action.payload; // ✅ Use updated todo from backend
    },
  },
});

export const { setTodos, addTodo, removeTodo, toggleTodo } = todoSlice.actions;
export default todoSlice.reducer;
