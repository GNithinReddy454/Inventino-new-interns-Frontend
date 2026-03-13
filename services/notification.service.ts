import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Axios instance — mirrors the pattern used in product.service.ts
const api = axios.create({
  baseURL: BASE_URL,
});

// Attach auth token on every request
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface NotificationData {
  orderId?: string;
  orderNumber?: string;
  status?: string;
  total?: number;
  discount?: number;
  originalOrderId?: string;
}

export interface Notification {
  _id: string;
  userId: string | { name: string; email: string; userId: string };
  title: string;
  message: string;
  type: string;
  data: NotificationData;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface NotificationsPagination {
  currentPage: number;
  totalPages: number;
  totalNotifications: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: NotificationsPagination;
}

export const notificationService = {
  /**
   * GET /api/notifications
   * Fetch all notifications for the logged-in user (paginated).
   */
  getNotifications(page = 1) {
    return api.get<{
      statusCode: number;
      message: string;
      data: NotificationsResponse;
      error: null | string;
    }>("/api/notifications", { params: { page } });
  },

  /**
   * GET /api/notifications/unread-count
   * Returns the current unread notification count.
   */
  getUnreadCount() {
    return api.get<{
      statusCode: number;
      message: string;
      data: { unreadCount: number };
      error: null | string;
    }>("/api/notifications/unread-count");
  },

  /**
   * PATCH /api/notifications/:id/read
   * Mark a single notification as read.
   */
  markAsRead(id: string) {
    return api.patch<{
      statusCode: number;
      message: string;
      data: Notification;
      error: null | string;
    }>(`/api/notifications/${id}/read`);
  },

  /**
   * PATCH /api/notifications/read-all
   * Mark all notifications as read.
   */
  markAllAsRead() {
    return api.patch<{
      statusCode: number;
      message: string;
      data: { modifiedCount: number };
      error: null | string;
    }>("/api/notifications/read-all");
  },

  /**
   * DELETE /api/notifications/:id
   * Delete a single notification.
   */
  deleteNotification(id: string) {
    return api.delete<{
      statusCode: number;
      message: string;
      data: Notification;
      error: null | string;
    }>(`/api/notifications/${id}`);
  },
};