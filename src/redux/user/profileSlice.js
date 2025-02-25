import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
};

const profileSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
    },
    updateProfile: (state, action) => {
      return {
        ...state,
        currentUser: { ...state.currentUser, ...action.payload },
      };
    },
  },
});

export const { setUser, updateProfile } = profileSlice.actions;
export default profileSlice.reducer;
