import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./user/authSlice";
import todoReducer from "./slice/todoSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

const persistConfig = {
  key: "root", // Key for localStorage
  version: 1, // Version
  storage, // Where to store data
  whitelist: ["user", "todo"], // Persist user & todo
};

// Root Reducer
const appReducer = combineReducers({
  user: authReducer,
  todo: todoReducer,
});

// 🔹 Reset Redux State on Logout
const rootReducer = (state, action) => {
  if (action.type === "auth/signOut") {
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
