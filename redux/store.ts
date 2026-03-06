import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

import accountReducer from "./accountslice";
import notificationsReducer from "./notificationslice";
import securityReducer from "./securityslice";
import appearanceReducer from "./appearanceslice";
import authReducer from "./authslice"; // ← new
import adminReducer from "./adminSlice";

export const store = configureStore({
  reducer: {
    account: accountReducer,
    notifications: notificationsReducer,
    security: securityReducer,
    appearance: appearanceReducer,
    auth: authReducer, // ← new
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks — use these everywhere instead of plain useDispatch/useSelector
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector = useSelector.withTypes<RootState>();
