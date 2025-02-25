import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./user/authSlice";
import todoReducer from "./slice/toDoSlice";
import profileReducer from "./user/profileSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

const persistConfig = {
  key: "root", // Key for localStorage
  version: 1, // Version
  storage, // Where to store data
  whitelist: ["user", "todo", "profile"], // Persist user & todo
};

// Root Reducer
const appReducer = combineReducers({
  user: userReducer,
  todo: todoReducer,
  profile: profileReducer,
});

// 🔹 Reset Redux State on Logout
const rootReducer = (state, action) => {
  if (action.type === "USER_SIGN_OUT") {
    storage.removeItem("persist:root"); // Clear persisted state
    return appReducer(undefined, action); // Reset Redux state
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
