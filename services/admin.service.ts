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

// ─── Customer Types ───────────────────────────────────────────────────────────

export interface AdminCustomer {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    totalOrders: number;
    totalSpent: number;
    customerType: string;
    registeredAt?: string;
    active?: boolean;
    // Add custom customer ID if exists
    customerId?: string; // For CUST-001 style IDs
}

export interface AdminCustomerDetail extends AdminCustomer {
    addresses: {
        billing: Address;
        shipping: Address;
    };
    // Add custom customer ID if exists
    customerId?: string; // For CUST-001 style IDs
}

export interface Address {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface CustomerStats {
    total_customers: number;
    new_customers: number;
    regular_customers: number;
    vip_customers: number;
}

// ─── Order Types ──────────────────────────────────────────────────────────────

export interface AdminOrderListItem {
    _id: string;
    orderNumber: string; // This is the custom ID like ORD-001
    customer: string;
    email: string;
    initials?: string;
    bg?: string;
    products: Array<{ name: string; quantity: number; price: number }>;
    totalAmount: number;
    status: string;
    date: string;
    trackingNumber?: string;
}

export interface AdminOrderDetail {
    _id: string;
    orderNumber: string; // This is the custom ID like ORD-001
    customer: {
        name: string;
        email: string;
        phone?: string;
        billingAddress: Address | null;
        shippingAddress: Address | null;
    };
    payment: {
        method: string;
        transactionId?: string;
        status: string;
        subtotal: number;
        shipping: number;
        tax: number;
        discount: number;
        total: number;
    };
    items: Array<{
        name: string;
        sku: string;
        quantity: number;
        price: number;
        total: number;
        image?: string;
    }>;
    status: string;
    allowedNextStatuses: string[];
    trackingNumber?: string;
    trackingUpdates: Array<{
        status: string;
        timestamp: string;
        location: string;
        note?: string;
    }>;
    notes: Array<{
        author: string;
        text: string;
        timestamp: string;
    }>;
    createdAt: string;
}

export interface OrderStats {
    total_orders: number;
    pending_orders: number;
    processing_orders: number;
    shipped_orders: number;
    delivered_orders: number;
    returned_orders: number;
}

// ─── Other Existing Types ─────────────────────────────────────────────────────

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

// ─── Paginated Response Wrapper ───────────────────────────────────────────────

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ─── API Response Wrapper ─────────────────────────────────────────────────────

interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

// ─── Helper: Graceful fetch — returns null on 404/any error ──────────────────

async function gracefulFetch<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
        return await fn();
    } catch (err) {
        if (axios.isAxiosError(err)) {
            const status = err.response?.status;
            if (status === 404) {
                return null;
            }
            if (status === 401) {
                return null;
            }
            console.warn(`[admin.service] API error ${status ?? "network"}: ${err.config?.url}`);
            return null;
        }
        console.warn("[admin.service] Unexpected error:", err);
        return null;
    }
}

// ─── Dashboard & Analytics ────────────────────────────────────────────────────

export const getDashboard = (): Promise<DashboardData | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<DashboardData>>("/admin/dashboard") as ApiResponse<DashboardData>;
        return res.data;
    });

export const getAnalytics = (period: string = "30d"): Promise<AnalyticsData | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<AnalyticsData>>(`/admin/analytics?period=${period}`) as ApiResponse<AnalyticsData>;
        return res.data;
    });

// ─── Products ──────────────────────────────────────────────────────────────────

export const getAdminProducts = (): Promise<AdminProduct[] | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<AdminProduct[]>>("/admin/products") as ApiResponse<AdminProduct[]>;
        return res.data;
    });

// ─── Customers ─────────────────────────────────────────────────────────────────

export const getAdminCustomers = (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    registeredFrom?: string;
    registeredTo?: string;
    minOrders?: number;
    maxOrders?: number;
    minSpent?: number;
    maxSpent?: number;
    sortBy?: string;
    sortOrder?: string;
}): Promise<PaginatedResponse<AdminCustomer> | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<PaginatedResponse<AdminCustomer>>>("/admin/customers", { params }) as ApiResponse<PaginatedResponse<AdminCustomer>>;
        return res.data;
    });

export const getAdminCustomerStats = (params?: { from?: string; to?: string }): Promise<CustomerStats | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<CustomerStats>>("/admin/customers/stats", { params }) as ApiResponse<CustomerStats>;
        return res.data;
    });

// UPDATED: Support both MongoDB ID and custom customer ID
export const getAdminCustomerById = (id: string): Promise<AdminCustomerDetail | null> =>
    gracefulFetch(async () => {
        // The backend now accepts both MongoDB IDs and custom IDs (CUST-001)
        const res = await apiMethods.get<ApiResponse<AdminCustomerDetail>>(`/admin/customers/${id}`) as ApiResponse<AdminCustomerDetail>;
        return res.data;
    });

// UPDATED: Support both MongoDB ID and custom customer ID for orders
export const getAdminCustomerOrders = (
    id: string,
    params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }
): Promise<PaginatedResponse<{ _id: string; orderNumber: string; date: string; status: string; total: number; paymentMethod: string }> | null> =>
    gracefulFetch(async () => {
        // The backend now accepts both MongoDB IDs and custom IDs (CUST-001)
        const res = await apiMethods.get<ApiResponse<PaginatedResponse<any>>>(`/admin/customers/${id}/orders`, { params }) as ApiResponse<PaginatedResponse<any>>;
        return res.data;
    });

export const updateAdminCustomer = (id: string, data: { customerType?: string; active?: boolean }): Promise<{ _id: string; customerType?: string; active?: boolean } | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.put<ApiResponse<any>>(`/admin/customers/${id}`, data) as ApiResponse<any>;
        return res.data;
    });

export const exportAdminCustomers = (filters: any): Promise<Blob | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.post("/admin/customers/export", filters, {
            responseType: "blob",
        }) as Blob;
        return res;
    });

// ─── Orders ────────────────────────────────────────────────────────────────────

export const getAdminOrders = (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    paymentStatus?: string;
    from?: string;
    to?: string;
    minAmount?: number;
    maxAmount?: number;
    customerId?: string;
    sortBy?: string;
    sortOrder?: string;
}): Promise<PaginatedResponse<AdminOrderListItem> | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<PaginatedResponse<AdminOrderListItem>>>("/admin/orders", { params }) as ApiResponse<PaginatedResponse<AdminOrderListItem>>;
        return res.data;
    });

export const getAdminOrderStats = (params?: { from?: string; to?: string }): Promise<OrderStats | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<OrderStats>>("/admin/orders/stats", { params }) as ApiResponse<OrderStats>;
        return res.data;
    });

// UPDATED: Support both MongoDB ID and custom order ID (ORD-001)
export const getAdminOrderById = (id: string): Promise<AdminOrderDetail | null> =>
    gracefulFetch(async () => {
        // The backend now accepts both MongoDB IDs and custom IDs (ORD-001)
        const res = await apiMethods.get<ApiResponse<AdminOrderDetail>>(`/admin/orders/${id}`) as ApiResponse<AdminOrderDetail>;
        return res.data;
    });

// UPDATED: Support both MongoDB ID and custom order ID (ORD-001)
export const updateOrderStatus = (id: string, status: string): Promise<{ orderId: string; newStatus: string } | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.put<ApiResponse<any>>(`/admin/orders/${id}/status`, { status }) as ApiResponse<any>;
        return res.data;
    });

// UPDATED: Support both MongoDB ID and custom order ID (ORD-001)
export const updateOrderTracking = (id: string, trackingNumber: string): Promise<{ orderId: string; trackingNumber: string } | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.put<ApiResponse<any>>(`/admin/orders/${id}/tracking`, { trackingNumber }) as ApiResponse<any>;
        return res.data;
    });

// UPDATED: Support both MongoDB ID and custom order ID (ORD-001)
export const cancelOrder = (id: string, reason?: string): Promise<{ orderId: string; status: string } | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.patch<ApiResponse<any>>(`/admin/orders/${id}/cancel`, { reason }) as ApiResponse<any>;
        return res.data;
    });

// UPDATED: Support both MongoDB ID and custom order ID (ORD-001)
export const addOrderNote = (id: string, note: string): Promise<{ noteId: string; author: string; text: string; timestamp: string } | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.post<ApiResponse<any>>(`/admin/orders/${id}/notes`, { note }) as ApiResponse<any>;
        return res.data;
    });

// UPDATED: Support both MongoDB ID and custom order ID (ORD-001)
export const downloadOrderInvoice = (id: string): Promise<Blob | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get(`/admin/orders/${id}/invoice`, {
            responseType: "blob",
        }) as Blob;
        return res;
    });

export const exportAdminOrders = (filters: any): Promise<Blob | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.post("/admin/orders/export", filters, {
            responseType: "blob",
        }) as Blob;
        return res;
    });

// ─── Reviews ───────────────────────────────────────────────────────────────────

export const getAdminReviews = (): Promise<AdminReview[] | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<AdminReview[]>>("/admin/reviews") as ApiResponse<AdminReview[]>;
        return res.data;
    });

// ─── CMS ───────────────────────────────────────────────────────────────────────

export const getCMSData = (): Promise<CMSData | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<CMSData>>("/admin/cms") as ApiResponse<CMSData>;
        return res.data;
    });

export const updateCMSData = (data: Partial<CMSData>): Promise<{ message: string } | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.put<{ statusCode: number; message: string }>("/admin/cms", data) as { statusCode: number; message: string };
        return res;
    });

// ─── Settings ──────────────────────────────────────────────────────────────────

export const getAdminSettings = (): Promise<SettingsData | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<SettingsData>>("/admin/settings") as ApiResponse<SettingsData>;
        return res.data;
    });

export const updateAdminSettings = (data: Partial<SettingsData>): Promise<{ message: string } | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.put<{ statusCode: number; message: string }>("/admin/settings", data) as { statusCode: number; message: string };
        return res;
    });

// ─── Banners ───────────────────────────────────────────────────────────────────

export const getActiveBanners = (): Promise<Banner[] | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<Banner[]>>("/banners") as ApiResponse<Banner[]>;
        return res.data;
    });

export const createBanner = (formData: FormData): Promise<Banner | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.post<ApiResponse<Banner>>("/banners", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }) as ApiResponse<Banner>;
        return res.data;
    });

export const updateBanner = (id: string, formData: FormData): Promise<Banner | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.patch<ApiResponse<Banner>>(`/banners/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }) as ApiResponse<Banner>;
        return res.data;
    });

export const deleteBanner = (id: string): Promise<null> =>
    gracefulFetch(async () => {
        await apiMethods.delete(`/banners/${id}`);
        return null;
    });

// ─── Categories ─────────────────────────────────────────────────────────────────

export const getCategories = (): Promise<CategoryListResponse | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<CategoryListResponse>>("/categories?limit=100") as ApiResponse<CategoryListResponse>;
        return res.data;
    });

export const getAdminCategories = (): Promise<CategoryListResponse | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<CategoryListResponse>>("/categories/admin/all?limit=100") as ApiResponse<CategoryListResponse>;
        return res.data;
    });

export const createCategory = async (data: { name: string; description?: string; isActive?: boolean; displayOrder?: number }): Promise<Category> => {
    const res = await apiMethods.post<ApiResponse<Category>>("/categories", data) as ApiResponse<Category>;
    return res.data;
};

export const updateCategory = async (id: string, data: { name?: string; description?: string; isActive?: boolean; displayOrder?: number }): Promise<Category> => {
    const res = await apiMethods.patch<ApiResponse<Category>>(`/categories/${id}`, data) as ApiResponse<Category>;
    return res.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
    await apiMethods.delete(`/categories/${id}`);
};