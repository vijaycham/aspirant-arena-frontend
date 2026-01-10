import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./user/authSlice";
import taskReducer from "./slice/taskSlice";
import arenaReducer from "./slice/arenaSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["user", "task", "arena"], // Restored 'task' (singular) to match existing useTasks hook
};

const appReducer = combineReducers({
  user: authReducer,
  task: taskReducer, // Restored 'task' key to match existing code
  arena: arenaReducer,
});

const rootReducer = (state, action) => {
  if (action.type === "auth/signOut") {
    storage.removeItem("persist:root");
    return appReducer(undefined, action);
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
