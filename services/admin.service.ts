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
}

export interface AdminCustomerDetail extends AdminCustomer {
    addresses: {
        billing: Address;
        shipping: Address;
    };
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
    orderNumber: string;
    customer: string;
    email?: string;
    initials?: string;
    bg?: string;
    products?: Array<{ name: string; quantity: number; price: number }>;
    totalAmount: number;
    status: string;
    date: string;
    trackingNumber?: string;
    // Fields from actual API response
    total?: number;
    payment?: string;
}

export interface AdminOrderDetail {
    _id: string;
    orderNumber: string;
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
        sku?: string;
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
    // Raw API fields
    paymentMethod?: string;
    total?: number;
}

// Stats as returned by actual API: api/admin/orders-manage/stats
export interface OrderStats {
    total: number;
    created: number;
    confirmed: number;
    packed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    returned: number;
    // Legacy fields kept for backward compat with UI
    total_orders?: number;
    pending_orders?: number;
    processing_orders?: number;
    shipped_orders?: number;
    delivered_orders?: number;
    returned_orders?: number;
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
    offerBar: { text: string; isActive: boolean };
    heroBanner: { image: string; heading: string; text: string };
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

// ─── Helper: Graceful fetch ───────────────────────────────────────────────────

async function gracefulFetch<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
        return await fn();
    } catch (err) {
        if (axios.isAxiosError(err)) {
            const status = err.response?.status;
            if (status === 404 || status === 401) return null;
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

// ─── Products ─────────────────────────────────────────────────────────────────

export const getAdminProducts = (): Promise<AdminProduct[] | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<AdminProduct[]>>("/admin/products") as ApiResponse<AdminProduct[]>;
        return res.data;
    });

// ─── Customers ────────────────────────────────────────────────────────────────

export const getAdminCustomers = (params?: {
    page?: number; limit?: number; search?: string; type?: string; status?: string;
    registeredFrom?: string; registeredTo?: string; minOrders?: number; maxOrders?: number;
    minSpent?: number; maxSpent?: number; sortBy?: string; sortOrder?: string;
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

export const getAdminCustomerById = (id: string): Promise<AdminCustomerDetail | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<AdminCustomerDetail>>(`/admin/customers/${id}`) as ApiResponse<AdminCustomerDetail>;
        return res.data;
    });

export const getAdminCustomerOrders = (
    id: string,
    params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }
): Promise<PaginatedResponse<any> | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<PaginatedResponse<any>>>(`/admin/customers/${id}/orders`, { params }) as ApiResponse<PaginatedResponse<any>>;
        return res.data;
    });

export const updateAdminCustomer = (id: string, data: { customerType?: string; active?: boolean }): Promise<any | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.put<ApiResponse<any>>(`/admin/customers/${id}`, data) as ApiResponse<any>;
        return res.data;
    });

export const exportAdminCustomers = (filters: any): Promise<Blob | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.post("/admin/customers/export", filters, { responseType: "blob" }) as Blob;
        return res;
    });

// ─── Orders — ALL endpoints use /admin/orders-manage ─────────────────────────

/**
 * GET /admin/orders-manage
 * Supports: page, limit, search, status, from, to, sortBy, sortOrder
 */
export const getAdminOrders = (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    from?: string;
    to?: string;
    sortBy?: string;
    sortOrder?: string;
}): Promise<PaginatedResponse<AdminOrderListItem> | null> =>
    gracefulFetch(async () => {
        // apiMethods.get returns response.data directly
        // So res = { message: "Orders fetched", data: [...], total: 32 }
        const res = await apiMethods.get<any>("/admin/orders-manage", { params }) as any;

        const list: any[]  = Array.isArray(res?.data) ? res.data : [];
        const total: number = res?.total ?? list.length;

        const BG_COLORS = [
            "bg-purple-500","bg-blue-500","bg-green-500",
            "bg-pink-500","bg-yellow-500","bg-indigo-500",
        ];

        const items: AdminOrderListItem[] = list.map((o: any, idx: number) => ({
            _id: o._id ?? o.orderNumber,
            orderNumber: o.orderNumber ?? "",
            customer: typeof o.customer === "string" ? o.customer : (o.customer?.name ?? ""),
            email: o.email ?? (typeof o.customer === "object" ? o.customer?.email : "") ?? "",
            initials: (typeof o.customer === "string" ? o.customer : (o.customer?.name ?? "??"))
                .slice(0, 2).toUpperCase(),
            bg: BG_COLORS[idx % BG_COLORS.length],
            products: o.items?.map((i: any) => ({ name: i.name, quantity: i.quantity, price: i.price })) ?? [],
            totalAmount: o.total ?? 0,
            status: o.status ?? "",
            date: o.createdAt ?? o.date ?? new Date().toISOString(),
            trackingNumber: o.trackingNumber ?? "",
            payment: o.paymentMethod ?? o.payment ?? "",
        }));

        return {
            data: items,
            total,
            page: params?.page ?? 1,
            limit: params?.limit ?? 10,
            totalPages: Math.ceil(total / (params?.limit ?? 10)),
        };
    });

/**
 * GET /admin/orders-manage/stats
 * Returns: { total, created, confirmed, packed, shipped, delivered, cancelled, returned }
 */
export const getAdminOrderStats = (params?: { from?: string; to?: string }): Promise<OrderStats | null> =>
    gracefulFetch(async () => {
        // apiMethods.get returns response.data directly
        // Stats API: { statusCode, message, data: { total, created, ... }, error }
        const res = await apiMethods.get<any>("/admin/orders-manage/stats", { params }) as any;
        const raw = res?.data ?? res;  // res.data = { total, created, confirmed, ... }
        return {
            total: raw?.total ?? 0,
            created: raw?.created ?? 0,
            confirmed: raw?.confirmed ?? 0,
            packed: raw?.packed ?? 0,
            shipped: raw?.shipped ?? 0,
            delivered: raw?.delivered ?? 0,
            cancelled: raw?.cancelled ?? 0,
            returned: raw?.returned ?? 0,
            total_orders: raw?.total ?? 0,
            pending_orders: (raw?.created ?? 0) + (raw?.confirmed ?? 0),
            processing_orders: raw?.packed ?? 0,
            shipped_orders: raw?.shipped ?? 0,
            delivered_orders: raw?.delivered ?? 0,
            returned_orders: raw?.returned ?? 0,
        };
    });

/**
 * GET /admin/orders-manage/:id
 * Returns single order detail
 */
export const getAdminOrderById = (id: string): Promise<AdminOrderDetail | null> =>
    gracefulFetch(async () => {
        // apiMethods.get returns response.data directly
        // Single order API: { message: "Order fetched", data: { orderNumber, ... } }
        const res = await apiMethods.get<any>(`/admin/orders-manage/${id}`) as any;
        const o = res?.data ?? res;  // res.data = the order object

        // Normalise API response → AdminOrderDetail shape
        return {
            _id: o._id ?? id,
            orderNumber: o.orderNumber ?? "",
            customer: {
                name: o.customer?.name ?? o.customer ?? "",
                email: o.customer?.email ?? "",
                phone: o.customer?.phone ?? "",
                billingAddress: o.customer?.billingAddress ?? null,
                shippingAddress: o.customer?.shippingAddress ?? null,
            },
            payment: {
                method: o.paymentMethod ?? o.payment?.method ?? "",
                transactionId: o.payment?.transactionId ?? "",
                status: o.payment?.status ?? "pending",
                subtotal: o.payment?.subtotal ?? o.total ?? 0,
                shipping: o.payment?.shipping ?? 0,
                tax: o.payment?.tax ?? 0,
                discount: o.payment?.discount ?? 0,
                total: o.total ?? o.payment?.total ?? 0,
            },
            items: (o.items ?? []).map((i: any) => ({
                name: i.name ?? "",
                sku: i.sku ?? i.name ?? "",
                quantity: i.quantity ?? 1,
                price: i.price ?? 0,
                total: i.total ?? (i.price ?? 0) * (i.quantity ?? 1),
                image: i.image ?? "",
            })),
            status: o.status ?? "",
            allowedNextStatuses: o.allowedNextStatuses ?? [],
            trackingNumber: o.trackingNumber ?? "",
            trackingUpdates: o.trackingUpdates ?? [],
            notes: o.notes ?? [],
            createdAt: o.createdAt ?? new Date().toISOString(),
        };
    });

/**
 * PUT /admin/orders-manage/:id/status
 * Body: { status }
 */
export const updateOrderStatus = (id: string, status: string): Promise<{ orderId: string; newStatus: string } | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.put<ApiResponse<any>>(`/admin/orders-manage/${id}/status`, { status }) as ApiResponse<any>;
        return res.data;
    });

/**
 * PUT /admin/orders-manage/:id/tracking
 * Body: { trackingNumber }
 */
export const updateOrderTracking = (id: string, trackingNumber: string): Promise<{ orderId: string; trackingNumber: string } | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.put<ApiResponse<any>>(`/admin/orders-manage/${id}/tracking`, { trackingNumber }) as ApiResponse<any>;
        return res.data;
    });

/**
 * PATCH /admin/orders-manage/:id/cancel
 * Body: { reason }
 */
export const cancelOrder = (id: string, reason?: string): Promise<{ orderId: string; status: string } | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.patch<ApiResponse<any>>(`/admin/orders-manage/${id}/cancel`, {
            reason: reason ?? "Cancelled by admin",
        }) as ApiResponse<any>;
        return res.data;
    });

/**
 * POST /admin/orders-manage/:id/notes  (kept for internal notes feature)
 */
export const addOrderNote = (id: string, note: string): Promise<{ noteId: string; author: string; text: string; timestamp: string } | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.post<ApiResponse<any>>(`/admin/orders-manage/${id}/notes`, { note }) as ApiResponse<any>;
        return res.data;
    });

/**
 * GET /admin/orders-manage/:id/invoice
 */
export const downloadOrderInvoice = (id: string): Promise<Blob | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get(`/admin/orders-manage/${id}/invoice`, { responseType: "blob" }) as Blob;
        return res;
    });

/**
 * POST /admin/orders-manage/export
 * Body: { status?, search? }
 */
export const exportAdminOrders = (filters: { status?: string; search?: string }): Promise<Blob | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.post("/admin/orders-manage/export", filters, { responseType: "blob" }) as Blob;
        return res;
    });

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const getAdminReviews = (): Promise<AdminReview[] | null> =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<ApiResponse<AdminReview[]>>("/admin/reviews") as ApiResponse<AdminReview[]>;
        return res.data;
    });

// ─── CMS ──────────────────────────────────────────────────────────────────────

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

// ─── Settings ─────────────────────────────────────────────────────────────────

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

// ─── Banners ──────────────────────────────────────────────────────────────────

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

// ─── Categories ───────────────────────────────────────────────────────────────

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