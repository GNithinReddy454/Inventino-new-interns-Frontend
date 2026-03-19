import axios from "axios";
import { apiMethods } from "@/lib/api";

// ───────────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────────

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

function unwrapResponse<T = any>(raw: any): T {
    if (!raw) return raw as T;

    const first = raw?.data ?? raw;

    if (
        first &&
        typeof first === "object" &&
        !Array.isArray(first) &&
        "data" in first
    ) {
        return first.data as T;
    }

    return first as T;
}

function unwrapMeta(raw: any) {
    const first = raw?.data ?? raw;

    if (
        first &&
        typeof first === "object" &&
        !Array.isArray(first) &&
        "data" in first
    ) {
        return {
            total: Number(first.total ?? 0),
            page: Number(first.page ?? 1),
            limit: Number(first.limit ?? 10),
            totalPages: Number(first.totalPages ?? 1),
        };
    }

    return {
        total: Number(raw?.total ?? 0),
        page: Number(raw?.page ?? 1),
        limit: Number(raw?.limit ?? 10),
        totalPages: Number(raw?.totalPages ?? 1),
    };
}

function extractBlob(response: any): Blob | null {
    if (!response) return null;
    if (response instanceof Blob) return response;
    if (response?.data instanceof Blob) return response.data;
    return null;
}

function getSafeOrderId(order: any, fallback = ""): string {
    return String(
        order?._id ??
            order?.id ??
            order?.orderId ??
            order?.orderNumber ??
            fallback
    );
}

// ───────────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────────

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
    categoryId?: string;
    name: string;
    description?: string;
    icon?: string;
    image?: {
        url?: string;
    };
    productCount?: number;
    isActive: boolean;
    displayOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface AdminSettings {
    storeName?: string;
    storeEmail?: string;
    storePhone?: string;
    storeCurrency?: string;
    storeAddress?: string;
    [key: string]: any;
}

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
    role?: string;
    isEmailVerified?: boolean;
    totalOrders: number;
    totalSpent: number;
    customerType?: string;
    active?: boolean;
    registeredAt?: string;
    customerId?: string;
    addresses?: {
        billing?: {
            line1?: string;
            city?: string;
            state?: string;
            postalCode?: string;
            country?: string;
        };
        shipping?: {
            line1?: string;
            city?: string;
            state?: string;
            postalCode?: string;
            country?: string;
        };
    };
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
        phone?: string;
        billingAddress?: any;
        shippingAddress?: any;
    };
    items: {
        name: string;
        sku?: string;
        quantity: number;
        price: number;
        total?: number;
        image?: string;
    }[];
    total: number;
    status: string;
    paymentMethod: string;
    notes?: {
        text: string;
        createdAt?: string;
        timestamp?: string;
        author?: string;
    }[];
    allowedNextStatuses?: string[];
    trackingUpdates?: {
        status: string;
        timestamp: string;
        location?: string;
        note?: string;
    }[];
    trackingNumber?: string;
    createdAt?: string;
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

export interface AdminReview {
    _id: string;
    productId?: string;
    productName: string;
    customerId?: string;
    customerName: string;
    rating: number;
    comment: string;
    status: "pending" | "approved" | "rejected";
    createdAt?: string;
    updatedAt?: string;
}

// ───────────────────────────────────────────────────────────────────────────────
// Orders
// ───────────────────────────────────────────────────────────────────────────────

export const getAdminOrders = (params?: any) =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/orders-manage", { params });
        const list = unwrapResponse<any[]>(raw);
        const meta = unwrapMeta(raw);
        const safeList = Array.isArray(list) ? list : [];

        return {
            data: safeList.map((o: any) => {
                const orderId = getSafeOrderId(o, "");

                return {
                    _id: orderId,
                    orderNumber: String(o?.orderNumber ?? ""),
                    customer:
                        o?.user?.name ??
                        o?.customer?.name ??
                        o?.customer ??
                        "Unknown",
                    email: o?.user?.email ?? o?.customer?.email ?? "",
                    total: Number(
                        o?.pricing?.total ?? o?.total ?? o?.totalAmount ?? 0
                    ),
                    status: String(o?.status ?? "created").toLowerCase(),
                    payment:
                        o?.payment?.method ??
                        o?.paymentMethod ??
                        o?.payment ??
                        "",
                    trackingNumber: o?.trackingNumber ?? "",
                    createdAt: o?.createdAt ?? "",
                    date: o?.createdAt ?? o?.date ?? "",
                    products: Array.isArray(o?.items)
                        ? o.items.map((item: any) => ({
                              name: item?.name ?? item?.productName ?? "",
                              quantity: Number(item?.quantity ?? 0),
                              price: Number(item?.price ?? 0),
                          }))
                        : Array.isArray(o?.products)
                        ? o.products.map((item: any) => ({
                              name: item?.name ?? item?.productName ?? "",
                              quantity: Number(item?.quantity ?? 0),
                              price: Number(item?.price ?? 0),
                          }))
                        : [],
                } as AdminOrderListItem;
            }),
            total: meta.total || safeList.length,
            page: meta.page,
            limit: meta.limit,
            totalPages: meta.totalPages || 1,
        };
    });

export const getAdminOrderStats = () =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/orders-manage/stats");
        const stats = unwrapResponse<any>(raw) ?? {};

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

export const getAdminOrderById = (id: string) =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>(`/admin/orders-manage/${id}`);
        const order = unwrapResponse<any>(raw) ?? {};

        return {
            _id: getSafeOrderId(order, id),
            orderNumber: String(order?.orderNumber ?? ""),
            customer: {
                name:
                    order?.user?.name ??
                    order?.customer?.name ??
                    order?.customer ??
                    "",
                email: order?.user?.email ?? order?.customer?.email ?? "",
                phone:
                    order?.shippingAddress?.phone ??
                    order?.customer?.phone ??
                    "",
                billingAddress:
                    order?.billingAddress ??
                    order?.customer?.billingAddress ??
                    null,
                shippingAddress:
                    order?.shippingAddress ??
                    order?.customer?.shippingAddress ??
                    null,
            },
            items: Array.isArray(order?.items)
                ? order.items.map((item: any) => ({
                      name: item?.name ?? item?.productName ?? "",
                      sku: item?.sku ?? item?.productId ?? "",
                      quantity: Number(item?.quantity ?? 0),
                      price: Number(item?.price ?? 0),
                      total: Number(
                          item?.total ??
                              Number(item?.price ?? 0) * Number(item?.quantity ?? 0)
                      ),
                      image: item?.imageUrl ?? item?.image ?? "",
                  }))
                : [],
            total: Number(
                order?.pricing?.total ?? order?.total ?? order?.totalAmount ?? 0
            ),
            status: String(order?.status ?? "").toLowerCase(),
            paymentMethod:
                order?.payment?.method ??
                order?.paymentMethod ??
                order?.payment ??
                "",
            trackingNumber: order?.trackingNumber ?? "",
            notes: Array.isArray(order?.notes) ? order.notes : [],
            allowedNextStatuses: Array.isArray(order?.allowedNextStatuses)
                ? order.allowedNextStatuses
                : [],
            trackingUpdates: Array.isArray(order?.trackingUpdates)
                ? order.trackingUpdates
                : [],
            createdAt: order?.createdAt ?? "",
        } as AdminOrderDetail;
    });

export const updateOrderStatus = (id: string, status: string) =>
    gracefulFetch(async () => {
        return await apiMethods.put(`/admin/orders-manage/${id}/status`, { status });
    });

export const updateOrderTracking = (id: string, trackingNumber: string) =>
    gracefulFetch(async () => {
        return await apiMethods.put(`/admin/orders-manage/${id}/tracking`, {
            trackingNumber,
        });
    });

export const cancelOrder = (id: string, reason?: string) =>
    gracefulFetch(async () => {
        return await apiMethods.patch(`/admin/orders-manage/${id}/cancel`, {
            reason: reason ?? "Cancelled by admin",
        });
    });

export const addOrderNote = (id: string, note: string) =>
    gracefulFetch(async () => {
        return await apiMethods.post(`/admin/orders-manage/${id}/notes`, { note });
    });

export const downloadOrderInvoice = (id: string) =>
    gracefulFetch(async () => {
        const res = await apiMethods.get(`/admin/orders-manage/${id}/invoice`, {
            responseType: "blob",
        });
        return extractBlob(res);
    });

export const exportAdminOrders = (filters: any = {}) =>
    gracefulFetch(async () => {
        const res = await apiMethods.post(`/admin/orders-manage/export`, filters, {
            responseType: "blob",
        });
        return extractBlob(res);
    });

// ───────────────────────────────────────────────────────────────────────────────
// Customers
// ───────────────────────────────────────────────────────────────────────────────

export const getAdminCustomers = (params?: any) =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/customers", { params });
        const list = unwrapResponse<any[]>(raw);
        const meta = unwrapMeta(raw);
        const safeList = Array.isArray(list) ? list : [];

        return {
            data: safeList.map((c: any, idx: number) => ({
                _id: c?._id ?? c?.id ?? "",
                name: c?.name ?? "",
                email: c?.email ?? "",
                phone: c?.phone ?? "",
                userId: c?.userId ?? `USR-${idx + 1}`,
                isActive: c?.isActive,
                createdAt: c?.createdAt,
            })) as AdminCustomer[],
            total: meta.total || safeList.length,
            page: meta.page,
            limit: meta.limit,
            totalPages: meta.totalPages || 1,
        };
    });

export const getAdminCustomerStats = () =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/customers/stats");
        const stats = unwrapResponse<any>(raw) ?? {};

        return {
            total: Number(stats?.total ?? 0),
            active: Number(stats?.active ?? 0),
            inactive: Number(stats?.inactive ?? 0),
        } as CustomerStats;
    });

export const exportAdminCustomers = (filters: any = { format: "csv" }) =>
    gracefulFetch(async () => {
        const res = await apiMethods.post(`/admin/customers/export`, filters, {
            responseType: "blob",
        });
        return extractBlob(res);
    });

export const updateAdminCustomer = (id: string, data: any) =>
    gracefulFetch(async () => {
        return await apiMethods.put(`/admin/customers/${id}`, data);
    });

export const getAdminCustomerById = (id: string) =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>(`/admin/customers/${id}`);
        const customer = unwrapResponse<any>(raw) ?? {};

        return {
            _id: customer?._id ?? id,
            name: customer?.name ?? "",
            email: customer?.email ?? "",
            phone: customer?.phone ?? "",
            role: customer?.role ?? "user",
            isEmailVerified: Boolean(customer?.isEmailVerified),
            totalOrders: Number(customer?.totalOrders ?? 0),
            totalSpent: Number(customer?.totalSpent ?? 0),
            customerType: customer?.customerType,
            active: customer?.isActive ?? customer?.active ?? true,
            registeredAt: customer?.createdAt ?? customer?.registeredAt ?? "",
            customerId: customer?.userId ?? customer?.customerId ?? "",
            addresses: customer?.addresses ?? undefined,
        } as AdminCustomerDetail;
    });

export const getAdminCustomerOrders = (id: string, params?: any) =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>(`/admin/customers/${id}/orders`, {
            params,
        });
        const list = unwrapResponse<any[]>(raw);
        const meta = unwrapMeta(raw);
        const safeList = Array.isArray(list) ? list : [];

        return {
            data: safeList.map((o: any) => ({
                _id: getSafeOrderId(o, ""),
                orderNumber: o?.orderNumber ?? "",
                status: String(o?.status ?? "").toLowerCase(),
                total: Number(o?.pricing?.total ?? o?.total ?? 0),
                paymentMethod: o?.payment?.method ?? o?.paymentMethod ?? "",
                date: o?.createdAt ?? o?.date ?? "",
                createdAt: o?.createdAt ?? "",
            })) as CustomerOrder[],
            total: meta.total || safeList.length,
            page: meta.page,
            limit: meta.limit,
            totalPages: meta.totalPages || 1,
        };
    });

// ───────────────────────────────────────────────────────────────────────────────
// Reviews
// ───────────────────────────────────────────────────────────────────────────────

export const getAdminReviews = (params?: any) =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/reviews", { params });
        const list = unwrapResponse<any[]>(raw);
        return (Array.isArray(list) ? list : []) as AdminReview[];
    });

// ───────────────────────────────────────────────────────────────────────────────
// Dashboard / Analytics / Settings / CMS / Categories / Banners
// ───────────────────────────────────────────────────────────────────────────────

export const getDashboard = () =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/dashboard");
        return unwrapResponse<any>(raw) ?? {};
    });

export const getAnalytics = (period: string = "30d") =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/analytics", {
            params: { period },
        });
        return unwrapResponse<any>(raw) ?? {};
    });

export const getAdminSettings = () =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/settings");
        return unwrapResponse<any>(raw) ?? {};
    });

export const updateAdminSettings = (settings: any) =>
    gracefulFetch(async () => {
        return await apiMethods.put("/admin/settings", settings);
    });

export const getCMSData = () =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/cms");
        return unwrapResponse<any>(raw) ?? {};
    });

export const updateCMSData = (data: CMSData) =>
    gracefulFetch(async () => {
        return await apiMethods.put("/admin/cms", data);
    });

export const getActiveBanners = () =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/banners");
        return unwrapResponse<Banner[]>(raw) ?? [];
    });

export const createBanner = (banner: Banner | FormData) =>
    gracefulFetch(async () => {
        const isFormData =
            typeof FormData !== "undefined" && banner instanceof FormData;

        const raw = await apiMethods.post<any>("/admin/banners", banner, {
            headers: isFormData
                ? { "Content-Type": "multipart/form-data" }
                : undefined,
        });

        return unwrapResponse<Banner>(raw);
    });

export const updateBanner = (id: string, banner: Partial<Banner> | FormData) =>
    gracefulFetch(async () => {
        const isFormData =
            typeof FormData !== "undefined" && banner instanceof FormData;

        const raw = await apiMethods.put<any>(`/admin/banners/${id}`, banner, {
            headers: isFormData
                ? { "Content-Type": "multipart/form-data" }
                : undefined,
        });

        return unwrapResponse<Banner>(raw);
    });

export const deleteBanner = (id: string) =>
    gracefulFetch(async () => {
        return await apiMethods.delete(`/admin/banners/${id}`);
    });

export const getAdminCategories = () =>
    gracefulFetch(async () => {
        const raw = await apiMethods.get<any>("/admin/categories");
        const data = unwrapResponse<any>(raw);

        const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
            ? data.items
            : [];

        return {
            items: list.map((c: any) => ({
                _id: c?._id ?? c?.categoryId ?? "",
                categoryId: c?.categoryId ?? c?._id ?? "",
                name: c?.name ?? "",
                description: c?.description ?? "",
                icon: c?.icon ?? "",
                image: c?.image ?? (c?.icon ? { url: c.icon } : undefined),
                productCount: Number(c?.productCount ?? 0),
                isActive: Boolean(c?.isActive),
                displayOrder: c?.displayOrder,
                createdAt: c?.createdAt,
                updatedAt: c?.updatedAt,
            })) as Category[],
        };
    });

export const getCategories = getAdminCategories;

export const createCategory = (category: Partial<Category>) =>
    gracefulFetch(async () => {
        return await apiMethods.post<Category>("/admin/categories", category);
    });

export const updateCategory = (id: string, category: Partial<Category>) =>
    gracefulFetch(async () => {
        return await apiMethods.put<Category>(`/admin/categories/${id}`, category);
    });

export const deleteCategory = (id: string) =>
    gracefulFetch(async () => {
        return await apiMethods.delete(`/admin/categories/${id}`);
    });