import {configureStore, combineReducers} from '@reduxjs/toolkit';
import userReducer from './user/userSlice';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';     



const persistConfig = {
  key: "root", // Key for localStorage 
  version: 1, // Version
  storage, // Where to store data
  whitelist: ["user"], // Persist only user state (exclude other state if needed)
};

const rootReducer = combineReducers({
  user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  }),
});

export const persistor = persistStore(store);