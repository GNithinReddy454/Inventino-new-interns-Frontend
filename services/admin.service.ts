import axios from "axios";
import { apiMethods } from "@/lib/api";

// ─── Response Types ───────────────────────────────────────────────────────────

export interface DashboardData {
    totalRevenue: number;
    revenueTrend: number;
    totalOrders: number;
    ordersTrend: number;
    totalProducts: number;
    activeUsers: number;
}

export interface AnalyticsData {
    revenue: { current: number; trend: number };
    orders: { current: number; trend: number };
    conversionRate: { current: number; trend: number };
    visitors: { current: number; trend: number };
}

export interface AdminProduct {
    _id: string;
    name: string;
    price: number;
    category: string;
    stock: number;
    totalSales: number;
    totalRevenue: number;
}

export interface AdminOrder {
    _id: string;
    totalAmount: number;
    status: string;
    trackingNumber: string;
}

export interface AdminCustomer {
    _id: string;
    name: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
    customerType: string;
}

export interface AdminReview {
    _id: string;
    customerName: string;
    rating: number;
    productName: string;
    title: string;
    comment: string;
    status: string;
}

export interface CMSData {
    offerBar: {
        text: string;
        isActive: boolean;
    };
    heroBanner: {
        image: string;
        heading: string;
        text: string;
    };
}

export interface SettingsData {
    storeInfo: { currency: string };
    notifications: { orderNotifications: boolean };
    paymentRules: { freeShippingThreshold: number };
    security: { twoFactorEnabled: boolean };
}

export interface Banner {
    _id: string;
    title: string;
    image: string;
    link: string;
    position: number;
    isActive: boolean;
    startAt: string | null;
    endAt: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface Category {
    categoryId: string;
    name: string;
    slug: string;
    description?: string;
    image?: { id?: string; url?: string };
    isActive: boolean;
    displayOrder: number;
    createdAt?: string;
    updatedAt?: string;
    productCount?: number;
}

export interface CategoryListResponse {
    items: Category[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

// ─── API Response Wrapper ─────────────────────────────────────────────────────

interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

// ─── Helper: Graceful fetch — returns null on 404/any error ──────────────────

/**
 * Wraps an API call and returns null if the endpoint is not found (404)
 * or if any network/server error occurs. This prevents console errors
 * when the backend hasn't implemented an endpoint yet.
 */
async function gracefulFetch<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
        return await fn();
    } catch (err) {
        if (axios.isAxiosError(err)) {
            const status = err.response?.status;
            if (status === 404) {
                // Endpoint not implemented yet — fail silently
                return null;
            }
            if (status === 401) {
                // Already handled by the global interceptor in lib/api.ts
                return null;
            }
            // Other HTTP errors (500, 400, etc.) — log but don't rethrow
            console.warn(
                `[admin.service] API error ${status ?? "network"}: ${err.config?.url}`
            );
            return null;
        }
        console.warn("[admin.service] Unexpected error:", err);
        return null;
    }
}

// ─── Admin Service Functions ──────────────────────────────────────────────────

/**
 * GET /api/admin/dashboard
 * Fetch dashboard KPI stats: revenue, orders, products, activeUsers.
 */
export const getDashboard = (): Promise<DashboardData | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<DashboardData>>(
            "/admin/dashboard"
        );
        return res.data;
    });

/**
 * GET /api/admin/analytics?period=<period>
 * Fetch analytics data for charts. period e.g. "7d", "30d", "90d", "1y"
 */
export const getAnalytics = (period: string = "30d"): Promise<AnalyticsData | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<AnalyticsData>>(
            `/admin/analytics?period=${period}`
        );
        return res.data;
    });

/**
 * GET /api/admin/products
 * Fetch all products with sales statistics.
 */
export const getAdminProducts = (): Promise<AdminProduct[] | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<AdminProduct[]>>(
            "/admin/products"
        );
        return res.data;
    });

/**
 * GET /api/admin/orders
 * Fetch all orders for order management.
 */
export const getAdminOrders = (): Promise<AdminOrder[] | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<AdminOrder[]>>(
            "/admin/orders"
        );
        return res.data;
    });

/**
 * GET /api/admin/customers
 * Fetch all registered customers with order stats.
 */
export const getAdminCustomers = (): Promise<AdminCustomer[] | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<AdminCustomer[]>>(
            "/admin/customers"
        );
        return res.data;
    });

/**
 * GET /api/admin/reviews
 * Fetch all product reviews for moderation.
 */
export const getAdminReviews = (): Promise<AdminReview[] | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<AdminReview[]>>(
            "/admin/reviews"
        );
        return res.data;
    });

/**
 * GET /api/admin/cms
 * Fetch CMS configuration for homepage content.
 */
export const getCMSData = (): Promise<CMSData | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<CMSData>>("/admin/cms");
        return res.data;
    });

/**
 * PUT /api/admin/cms
 * Update CMS homepage content.
 */
export const updateCMSData = (data: Partial<CMSData>): Promise<{ message: string } | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.put<{ statusCode: number; message: string }>(
            "/admin/cms",
            data
        );
        return res;
    });

/**
 * GET /api/admin/settings
 * Fetch store configuration settings.
 */
export const getAdminSettings = (): Promise<SettingsData | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<SettingsData>>(
            "/admin/settings"
        );
        return res.data;
    });

/**
 * PUT /api/admin/settings
 * Update store settings.
 */
export const updateAdminSettings = (data: Partial<SettingsData>): Promise<{ message: string } | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.put<{ statusCode: number; message: string }>(
            "/admin/settings",
            data
        );
        return res;
    });

/**
 * GET /api/banners
 * Fetch active banners (public).
 */
export const getActiveBanners = (): Promise<Banner[] | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<Banner[]>>("/banners");
        return res.data;
    });

/**
 * POST /api/banners
 * Create a banner (admin).
 */
export const createBanner = (formData: FormData): Promise<Banner | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.post<ApiResponse<Banner>>("/banners", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    });

/**
 * PATCH /api/banners/:id
 * Update a banner (admin).
 */
export const updateBanner = (id: string, formData: FormData): Promise<Banner | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.patch<ApiResponse<Banner>>(`/banners/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    });

/**
 * DELETE /api/banners/:id
 * Delete a banner (admin).
 */
export const deleteBanner = (id: string): Promise<null> =>
    gracefulFetch(async () => {
        await apiMethods.delete(`/banners/${id}`);
        return null;
    });

// ─── Category Service Functions ───────────────────────────────────────────────

/**
 * GET /api/categories
 * Fetch all active categories (public).
 */
export const getCategories = (): Promise<CategoryListResponse | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<CategoryListResponse>>("/categories?limit=100");
        return res.data;
    });

/**
 * GET /api/categories/admin/all
 * Fetch all categories including inactive (admin).
 */
export const getAdminCategories = (): Promise<CategoryListResponse | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<CategoryListResponse>>("/categories/admin/all?limit=100");
        return res.data;
    });

/**
 * POST /api/categories
 * Create a category (admin).
 */
export const createCategory = (data: { name: string; description?: string; isActive?: boolean; displayOrder?: number }): Promise<Category | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.post<ApiResponse<Category>>("/categories", data);
        return res.data;
    });

/**
 * PATCH /api/categories/:id
 * Update a category (admin).
 */
export const updateCategory = (id: string, data: { name?: string; description?: string; isActive?: boolean; displayOrder?: number }): Promise<Category | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.patch<ApiResponse<Category>>(`/categories/${id}`, data);
        return res.data;
    });

/**
 * DELETE /api/categories/:id
 * Soft-delete a category (admin).
 */
export const deleteCategory = (id: string): Promise<null> =>
    gracefulFetch(async () => {
        await apiMethods.delete(`/categories/${id}`);
        return null;
    });

