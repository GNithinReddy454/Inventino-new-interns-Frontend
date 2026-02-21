import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  enabled: boolean;
}

export interface NotificationsState {
  items: NotificationItem[];
}

const initialState: NotificationsState = {
  items: [
    { id: 1, title: "Order Updates",       desc: "Get notified about your order status and delivery",       enabled: true  },
    { id: 2, title: "Promotions & Offers", desc: "Receive updates about sales, discounts and new arrivals", enabled: false },
    { id: 3, title: "Newsletter",          desc: "Weekly roundup of jewelry trends and styling tips",       enabled: true  },
    { id: 4, title: "Stock Alerts",        desc: "Notify when items in your wishlist are back in stock",    enabled: false },
  ],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    toggleNotification(state, action: PayloadAction<number>) {
      const item = state.items.find((n) => n.id === action.payload);
      if (item) item.enabled = !item.enabled;
    },
  },
});

export const { toggleNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;