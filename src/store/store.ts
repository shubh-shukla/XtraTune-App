import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import playerReducer from "./player-slice";
import likesReducer from "./likes-slice";
import settingsReducer from "./settings-slice";

const rootReducer = combineReducers({
  player: playerReducer,
  likes: likesReducer,
  settings: settingsReducer,
});

const persistConfig = {
  key: "xtratune",
  version: 1,
  storage: AsyncStorage,
  whitelist: ["likes", "settings"], // player state is ephemeral
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
