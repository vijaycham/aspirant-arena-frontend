import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser:null, 
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
      console.log("Sign-in successful", action.payload);
      state.currentUser = action.payload;
      localStorage.setItem("currentUser", JSON.stringify(action.payload)); 
      state.loading = false;
      state.error = null;
     
    },
    signInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    signOut: (state) => {
      state.currentUser = null;
      localStorage.removeItem("currentUser");
      state.loading = false;
      state.error = null;
    },
  },
});

export const { signInStart, signInSuccess, signInFailure, signOut } =
  userSlice.actions;
export default userSlice.reducer;
