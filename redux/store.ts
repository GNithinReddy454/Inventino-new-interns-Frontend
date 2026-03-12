import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

import accountReducer from "./accountslice";
import notificationsReducer from "./notificationslice";
import securityReducer from "./securityslice";
import appearanceReducer from "./appearanceslice";
import authReducer from "./authslice"; // ← new
import adminReducer from "./adminSlice";
import contactReducer from "./contactslice";
import wishlistReducer from "./wishlistslice";
import cartReducer from "./cartslice";
import orderReducer from "./orderslice";
import addressReducer from "./addressslice";

export const store = configureStore({
  reducer: {
    account: accountReducer,
    notifications: notificationsReducer,
    security: securityReducer,
    appearance: appearanceReducer,
    auth: authReducer, // ← new
    admin: adminReducer,
    contact: contactReducer,
    wishlist: wishlistReducer,
    cart: cartReducer,
    order: orderReducer,
    address: addressReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks — use these everywhere instead of plain useDispatch/useSelector
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector = useSelector.withTypes<RootState>();
