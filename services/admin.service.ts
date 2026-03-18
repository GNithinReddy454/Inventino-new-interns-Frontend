import axios from "axios";
import { apiMethods } from "@/lib/api";

// ─── Helper: Graceful fetch ───────────────────────────────────────────────────
async function gracefulFetch<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
        return await fn();
    } catch (err) {
        if (axios.isAxiosError(err)) {
            console.error("API ERROR:", {
                url: err.config?.url,
                status: err.response?.status,
                message: err.response?.data?.message,
                data: err.response?.data,
            });
        } else {
            console.error("UNKNOWN ERROR:", err);
        }
        return null;
    }
}

// ─── Response Types ──────────────────────────────────────────────────────────

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

export interface CMSData {
    offerBar?: {
        text: string;
        isActive: boolean;
    };
    heroBanner?: {
        image: string;
        heading: string;
        text: string;
    };
    [key: string]: any;
}

export interface Banner {
    _id?: string;
    title: string;
    description?: string;
    image: string;
    link?: string;
    isActive: boolean;
    displayOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Category {
    _id?: string;
    name: string;
    description?: string;
    icon?: string;
    isActive: boolean;
    displayOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface AdminSettings {
    storeName: string;
    storeEmail: string;
    storePhone: string;
    storeCurrency: string;
    storeAddress: string;
    [key: string]: any;
}

// ─── Customers ───────────────────────────────────────────────────────────────

export interface AdminCustomer {
    _id: string;
    name: string;
    email: string;
    phone: string;
    userId: string;
    isActive?: boolean;
    createdAt?: string;
}

export interface AdminCustomerDetail {
    _id?: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isEmailVerified: boolean;
    totalOrders: number;
    totalSpent: number;
    customerType?: string;
}

export interface CustomerStats {
    total: number;
    active: number;
    inactive: number;
}

export interface CustomerOrder {
    _id?: string;
    orderNumber: string;
    status: string;
    total: number;
    paymentMethod: string;
    date?: string;
    createdAt?: string;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface AdminOrderListItem {
    _id: string;
    orderNumber: string;
    customer: string;
    email?: string;
    total: number;
    status: string;
    payment: string;
    trackingNumber?: string;
    createdAt?: string;
    date?: string;
    products?: {
        name: string;
        quantity: number;
        price: number;
    }[];
}

export interface AdminOrderDetail {
    _id?: string;
    orderNumber: string;
    customer: {
        name: string;
        email: string;
    };
    items: {
        name: string;
        price: number;
        quantity: number;
    }[];
    total: number;
    status: string;
    paymentMethod: string;
    notes?: { text: string; createdAt: string }[];
    allowedNextStatuses?: string[];
    trackingUpdates?: { status: string; timestamp: string }[];
    trackingNumber?: string;
}

export interface OrderStats {
    total: number;
    created: number;
    confirmed: number;
    packed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    returned: number;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface AdminReview {
    _id: string;
    productId: string;
    productName: string;
    customerId: string;
    customerName: string;
    rating: number;
    comment: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
    updatedAt?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractBlob(response: any): Blob | null {
    if (!response) return null;
    if (response instanceof Blob) return response;
    if (response?.data instanceof Blob) return response.data;
    return null;
}

function normalizeTopLevelResponse(res: any) {
    return res?.data && !Array.isArray(res?.data) && typeof res?.data === "object" && "data" in res.data
        ? res.data
        : res;
}

// ─── Orders APIs ──────────────────────────────────────────────────────────────

// GET ORDERS LIST - /api/admin/orders-manage
export const getAdminOrders = (params?: any) =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/orders-manage", { params });
        const res = normalizeTopLevelResponse(raw);

        const list: any[] = Array.isArray(res?.data) ? res.data : [];

        return {
            data: list.map((o: any) => ({
                _id: o?._id ?? o?.id ?? o?.orderId ?? "",
                orderNumber: o?.orderNumber ?? "",
                customer: o?.user?.name ?? o?.customer?.name ?? o?.customer ?? "Unknown",
                email: o?.user?.email ?? o?.customer?.email ?? "",
                total: Number(o?.pricing?.total ?? o?.total ?? o?.totalAmount ?? 0),
                status: String(o?.status ?? "created").toLowerCase(),
                payment: o?.payment?.method ?? o?.paymentMethod ?? o?.payment ?? "",
                trackingNumber: o?.trackingNumber ?? "",
                createdAt: o?.createdAt ?? "",
                date: o?.createdAt ?? o?.date ?? "",
                products: Array.isArray(o?.items)
                    ? o.items.map((item: any) => ({
                          name: item?.name ?? "",
                          quantity: Number(item?.quantity ?? 0),
                          price: Number(item?.price ?? 0),
                      }))
                    : [],
            })) as AdminOrderListItem[],
            total: Number(res?.total ?? list.length),
            page: Number(res?.page ?? 1),
            limit: Number(res?.limit ?? params?.limit ?? 10),
            totalPages: Number(res?.totalPages ?? 1),
        };
    });

// GET ORDER STATS - /api/admin/orders-manage/stats
export const getAdminOrderStats = () =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/orders-manage/stats");
        const res = normalizeTopLevelResponse(raw);
        const stats = res?.data && !Array.isArray(res?.data) ? res.data : res ?? {};

        return {
            total: Number(stats?.total ?? 0),
            created: Number(stats?.created ?? 0),
            confirmed: Number(stats?.confirmed ?? 0),
            packed: Number(stats?.packed ?? 0),
            shipped: Number(stats?.shipped ?? 0),
            delivered: Number(stats?.delivered ?? 0),
            cancelled: Number(stats?.cancelled ?? 0),
            returned: Number(stats?.returned ?? 0),
        } as OrderStats;
    });

// GET ORDER DETAIL - /api/admin/orders-manage/:id
export const getAdminOrderById = (id: string) =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>(/admin/orders-manage/);
        const res = normalizeTopLevelResponse(raw);
        const order = res?.data && !Array.isArray(res?.data) ? res.data : res ?? {};

        return {
            _id: order?._id ?? id,
            orderNumber: order?.orderNumber ?? "",
            customer: {
                name: order?.user?.name ?? order?.customer?.name ?? "",
                email: order?.user?.email ?? order?.customer?.email ?? "",
            },
            items: Array.isArray(order?.items)
                ? order.items.map((item: any) => ({
                      name: item?.name ?? "",
                      price: Number(item?.price ?? 0),
                      quantity: Number(item?.quantity ?? 0),
                  }))
                : [],
            total: Number(order?.pricing?.total ?? order?.total ?? 0),
            status: String(order?.status ?? "").toLowerCase(),
            paymentMethod: order?.payment?.method ?? order?.paymentMethod ?? "",
            trackingNumber: order?.trackingNumber ?? "",
            notes: Array.isArray(order?.notes) ? order.notes : [],
            allowedNextStatuses: Array.isArray(order?.allowedNextStatuses) ? order.allowedNextStatuses : [],
            trackingUpdates: Array.isArray(order?.trackingUpdates) ? order.trackingUpdates : [],
        } as AdminOrderDetail;
    });

// UPDATE ORDER STATUS - /api/admin/orders-manage/:id/status
export const updateOrderStatus = (id: string, status: string) =>
    gracefulFetch(async () => {
        return await apiMethods.put(/admin/orders-manage//status, { status });
    });

// UPDATE TRACKING - /api/admin/orders-manage/:id/tracking
export const updateOrderTracking = (id: string, trackingNumber: string) =>
    gracefulFetch(async () => {
        return await apiMethods.put(/admin/orders-manage//tracking, { trackingNumber });
    });

// CANCEL ORDER - /api/admin/orders-manage/:id/cancel
export const cancelOrder = (id: string, reason?: string) =>
    gracefulFetch(async () => {
        return await apiMethods.patch(/admin/orders-manage//cancel, {
            reason: reason ?? "",
        });
    });

// ADD ORDER NOTE - /api/admin/orders-manage/:id/notes
export const addOrderNote = (id: string, note: string) =>
    gracefulFetch(async () => {
        return await apiMethods.post(/admin/orders-manage//notes, { note });
    });

// DOWNLOAD INVOICE - /api/admin/orders-manage/:id/invoice
export const downloadOrderInvoice = (id: string) =>
    gracefulFetch(async () => {
        const res = await apiMethods.get(/admin/orders-manage//invoice, {
            responseType: "blob",
        });
        return extractBlob(res);
    });

// EXPORT ORDERS - /api/admin/orders-manage/export
export const exportAdminOrders = (filters: any = {}) =>
    gracefulFetch(async () => {
        const res = await apiMethods.post(/admin/orders-manage/export, filters, {
            responseType: "blob",
        });
        return extractBlob(res);
    });

// ─── Customer APIs ───────────────────────────────────────────────────────────

// GET ALL CUSTOMERS - /api/admin/customers
export const getAdminCustomers = (params?: any) =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/customers", { params });
        const res = normalizeTopLevelResponse(raw);

        const list: any[] = Array.isArray(res?.data) ? res.data : [];

        return {
            data: list.map((c: any, idx: number) => ({
                _id: c?._id ?? c?.id ?? "",
                name: c?.name ?? "",
                email: c?.email ?? "",
                phone: c?.phone ?? "",
                userId: c?.userId ?? USR-,
                isActive: c?.isActive,
                createdAt: c?.createdAt,
            })) as AdminCustomer[],
            total: Number(res?.total ?? list.length),
            page: Number(res?.page ?? 1),
            limit: Number(res?.limit ?? params?.limit ?? 10),
            totalPages: Number(res?.totalPages ?? 1),
        };
    });

// GET CUSTOMER STATS - /api/admin/customers/stats
export const getAdminCustomerStats = () =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/customers/stats");
        const res = normalizeTopLevelResponse(raw);
        const stats = res?.data && !Array.isArray(res?.data) ? res.data : res ?? {};

        return {
            total: Number(stats?.total ?? 0),
            active: Number(stats?.active ?? 0),
            inactive: Number(stats?.inactive ?? 0),
        } as CustomerStats;
    });

// EXPORT CUSTOMERS - /api/admin/customers/export
export const exportAdminCustomers = (filters: any = { format: "csv" }) =>
    gracefulFetch(async () => {
        const res = await apiMethods.post(/admin/customers/export, filters, {
            responseType: "blob",
        });
        return extractBlob(res);
    });

// GET SINGLE CUSTOMER - /api/admin/customers/:id
export const getAdminCustomerById = (id: string) =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>(/admin/customers/);
        const res = normalizeTopLevelResponse(raw);
        const customer = res?.data && !Array.isArray(res?.data) ? res.data : res ?? {};

        return {
            _id: customer?._id ?? id,
            name: customer?.name ?? "",
            email: customer?.email ?? "",
            phone: customer?.phone ?? "",
            role: customer?.role ?? "user",
            isEmailVerified: Boolean(customer?.isEmailVerified),
            totalOrders: Number(customer?.totalOrders ?? 0),
            totalSpent: Number(customer?.totalSpent ?? 0),
        } as AdminCustomerDetail;
    });

// GET CUSTOMER ORDERS - /api/admin/customers/:id/orders
export const getAdminCustomerOrders = (id: string, params?: any) =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>(/admin/customers//orders, { params });
        const res = normalizeTopLevelResponse(raw);
        const list: any[] = Array.isArray(res?.data) ? res.data : [];

        return {
            data: list.map((o: any) => ({
                _id: o?._id ?? o?.orderId ?? o?.id ?? "",
                orderNumber: o?.orderNumber ?? "",
                status: String(o?.status ?? "").toLowerCase(),
                total: Number(o?.pricing?.total ?? o?.total ?? 0),
                paymentMethod: o?.payment?.method ?? o?.paymentMethod ?? "",
                date: o?.createdAt ?? o?.date ?? "",
                createdAt: o?.createdAt ?? "",
            })) as CustomerOrder[],
            total: Number(res?.total ?? list.length),
        };
    });

// UPDATE CUSTOMER - /api/admin/customers/:id
export const updateAdminCustomer = (id: string, data: any) =>
    gracefulFetch(async () => {
        return await apiMethods.put(/admin/customers/, data);
    });

// ─── Banners ──────────────────────────────────────────────────────────────────

export const getActiveBanners = () =>
    gracefulFetch(async () => {
        return await apiMethods.get<Banner[]>(/admin/banners);
    });

export const createBanner = (banner: Banner) =>
    gracefulFetch(async () => {
        return await apiMethods.post<Banner>(/admin/banners, banner);
    });

export const updateBanner = (id: string, banner: Partial<Banner>) =>
    gracefulFetch(async () => {
        return await apiMethods.put<Banner>(/admin/banners/, banner);
    });

export const deleteBanner = (id: string) =>
    gracefulFetch(async () => {
        return await apiMethods.delete(/admin/banners/);
    });

// ─── Categories ───────────────────────────────────────────────────────────────

export const getAdminCategories = () =>
    gracefulFetch(async () => {
        return await apiMethods.get<Category[]>(/admin/categories);
    });

export const getCategories = getAdminCategories;

export const createCategory = (category: Category) =>
    gracefulFetch(async () => {
        return await apiMethods.post<Category>(/admin/categories, category);
    });

export const updateCategory = (id: string, category: Partial<Category>) =>
    gracefulFetch(async () => {
        return await apiMethods.put<Category>(/admin/categories/, category);
    });

export const deleteCategory = (id: string) =>
    gracefulFetch(async () => {
        return await apiMethods.delete(/admin/categories/);
    });

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const getAdminReviews = (params?: any) =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/reviews", { params });
        const res = normalizeTopLevelResponse(raw);
        const list: AdminReview[] = Array.isArray(res?.data) ? res.data : [];
        return list;
    });

// ─── Settings ──────────────────────────────────────────────────────────────────

export const getAdminSettings = () =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/settings");
        const res = normalizeTopLevelResponse(raw);
        return res?.data ?? res ?? {};
    });

export const updateAdminSettings = (settings: any) =>
    gracefulFetch(async () => {
        return await apiMethods.put("/admin/settings", settings);
    });

// ─── Dashboard & Analytics ────────────────────────────────────────────────────

export const getDashboard = () =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/dashboard");
        const res = normalizeTopLevelResponse(raw);
        return res?.data ?? res ?? {};
    });

export const getAnalytics = (period: string = "30d") =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/analytics", {
            params: { period },
        });
        const res = normalizeTopLevelResponse(raw);
        return res?.data ?? res ?? {};
    });

// ─── CMS Data ──────────────────────────────────────────────────────────────────

export const getCMSData = () =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/cms");
        const res = normalizeTopLevelResponse(raw);
        return res?.data ?? res ?? {};
    });

export const updateCMSData = (data: CMSData) =>
    gracefulFetch(async () => {
        return await apiMethods.put("/admin/cms", data);
    });
