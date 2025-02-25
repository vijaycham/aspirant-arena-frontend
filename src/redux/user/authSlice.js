import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: JSON.parse(localStorage.getItem("user")) || null, // Load from localStorage
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
    },
    signInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
      localStorage.setItem("user", JSON.stringify(action.payload)); // Store user in localStorage
    },
    signInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    signOut: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("user"); // Remove user from localStorage on logout
      localStorage.removeItem("token"); // Remove token (if stored)
    },
  },
});

export const { signInStart, signInSuccess, signInFailure, signOut } =
  userSlice.actions;
export default userSlice.reducer;
