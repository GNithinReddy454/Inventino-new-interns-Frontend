import axios from "axios";
import { apiMethods } from "@/lib/api";

// ─── Helper: Graceful fetch ───────────────────────────────────────────────────
export interface AdminOrderDetail {
    _id: string;
    orderNumber: string;

    customer: {
        name: string;
        email: string;
        phone?: string;
        billingAddress?: any;
        shippingAddress?: any;
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

    items: {
        name: string;
        sku: string;
        quantity: number;
        price: number;
        total: number;
        image?: string;
    }[];

    status: string;
    allowedNextStatuses?: string[];
    trackingNumber?: string;

    trackingUpdates: {
        status: string;
        timestamp: string;
        location?: string;
        note?: string;
    }[];

    notes: {
        author?: string;
        text: string;
        timestamp: string;
    }[];

    createdAt: string;
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
    total_orders: number;
    pending_orders: number;
    processing_orders: number;
    shipped_orders: number;
    delivered_orders: number;
    returned_orders: number;
}

export interface AdminCustomer {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    totalOrders?: number;
    totalSpent?: number;
    customerType: string;
    registeredAt?: string;
    active?: boolean;
    customerId?: string;
}

export interface AdminCustomerDetail extends AdminCustomer {
    addresses: {
        billing: {
            line1: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        };
        shipping: {
            line1: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        };
    };
}

export interface AdminReview {
    _id: string;
    customerName: string;
    productName: string;
    rating: number;
    comment: string;
    status?: string;
}

export interface DashboardData {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    activeUsers: number;
    revenueTrend: number;
    ordersTrend: number;
}

export interface AnalyticsMetric {
    current: number;
    trend: number;
}

export interface AnalyticsData {
    revenue: AnalyticsMetric;
    orders: AnalyticsMetric;
    conversionRate: AnalyticsMetric;
    visitors: AnalyticsMetric;
}

export interface AdminSettings {
    storeInfo?: {
        currency: string;
    };
    notifications?: {
        orderNotifications: boolean;
    };
    paymentRules?: {
        freeShippingThreshold: number;
    };
    security?: {
        twoFactorEnabled: boolean;
    };
}

export interface CMSData {
    offerBar: {
        text: string;
        isActive: boolean;
    };
}

export interface Banner {
    _id: string;
    title?: string;
    link?: string;
    image?: string;
    isActive?: boolean;
    createdAt?: string;
}

export interface Category {
    _id?: string;
    categoryId: string;
    name: string;
    description?: string;
    isActive: boolean;
    image?: {
        url?: string;
    };
    productCount?: number;
}

const DEFAULT_ORDER_STATS: OrderStats = {
    total: 0,
    created: 0,
    confirmed: 0,
    packed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
    total_orders: 0,
    pending_orders: 0,
    processing_orders: 0,
    shipped_orders: 0,
    delivered_orders: 0,
    returned_orders: 0,
};

const DEFAULT_SETTINGS: AdminSettings = {
    storeInfo: { currency: "USD ($)" },
    notifications: { orderNotifications: true },
    paymentRules: { freeShippingThreshold: 50 },
    security: { twoFactorEnabled: false },
};

const DEFAULT_CMS_DATA: CMSData = {
    offerBar: {
        text: "",
        isActive: true,
    },
};

async function gracefulFetch<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
        return await fn();
    } catch (err) {
        if (axios.isAxiosError(err)) {
            console.error("API ERROR:", {
                url: err.config?.url,
                status: err.response?.status,
                data: err.response?.data,
            });
        } else {
            console.error("UNKNOWN ERROR:", err);
        }
        return null;
    }
}

function unwrapData<T = any>(payload: any): T {
    return (payload?.data ?? payload) as T;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

// GET ORDERS LIST
export const getAdminOrders = (params?: any) =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>("/admin/orders-manage", { params });

        const list: any[] = Array.isArray(res?.data) ? res.data : res ?? [];

        const BG_COLORS = [
            "bg-purple-500","bg-blue-500","bg-green-500",
            "bg-pink-500","bg-yellow-500","bg-indigo-500",
        ];

        return {
            data: list.map((o: any, idx: number) => {
                const name =
                    typeof o.customer === "string"
                        ? o.customer
                        : o.customer?.name ?? "";

                return {
                    _id: o._id ?? o.orderNumber,
                    orderNumber: o.orderNumber ?? "",
                    customer: name || "Unknown",
                    email:
                        o.email ??
                        (typeof o.customer === "object"
                            ? o.customer?.email
                            : "") ??
                        "",
                    initials: name ? name.slice(0, 2).toUpperCase() : "NA",
                    bg: BG_COLORS[idx % BG_COLORS.length],
                    products:
                        o.items?.map((i: any) => ({
                            name: i.name ?? "",
                            quantity: i.quantity ?? 1,
                            price: i.price ?? 0,
                        })) ?? [],
                    totalAmount: Number(o.total ?? 0),
                    status: o.status ?? "created",
                    date: o.createdAt ?? new Date().toISOString(),
                    trackingNumber: o.trackingNumber ?? "",
                    payment: o.paymentMethod ?? "",
                };
            }),
            total: res?.total ?? list.length,
            page: params?.page ?? 1,
            limit: params?.limit ?? 10,
            totalPages: Math.ceil((res?.total ?? list.length) / (params?.limit ?? 10)),
        };
    });

// GET ORDER DETAIL
export const getAdminOrderById = (id: string) =>
    gracefulFetch(async () => {
        const o = await apiMethods.get<any>(`/admin/orders-manage/${id}`);

        return {
            _id: o._id ?? id,
            orderNumber: o.orderNumber ?? "",

            customer: {
                name:
                    typeof o.customer === "string"
                        ? o.customer
                        : o.customer?.name ?? "",
                email: o.customer?.email ?? "",
                phone: o.customer?.phone ?? "",
                billingAddress: o.customer?.billingAddress ?? null,
                shippingAddress: o.customer?.shippingAddress ?? null,
            },

            payment: {
                method: o.paymentMethod ?? o.payment?.method ?? "",
                transactionId: o.payment?.transactionId ?? "",
                status: o.payment?.status ?? "pending",
                subtotal: Number(o.payment?.subtotal ?? 0),
                shipping: Number(o.payment?.shipping ?? 0),
                tax: Number(o.payment?.tax ?? 0),
                discount: Number(o.payment?.discount ?? 0),
                total: Number(o.payment?.total ?? o.total ?? 0),
            },

            items: (o.items ?? []).map((i: any) => ({
                name: i.name ?? "",
                sku: i.sku ?? i.name ?? "",
                quantity: Number(i.quantity ?? 1),
                price: Number(i.price ?? 0),
                total: Number(i.total ?? (i.price ?? 0) * (i.quantity ?? 1)),
                image: i.image ?? "",
            })),

            status: o.status ?? "created",
            allowedNextStatuses: o.allowedNextStatuses ?? [],
            trackingNumber: o.trackingNumber ?? "",

            trackingUpdates: (o.trackingUpdates ?? []).map((t: any) => ({
                status: t.status ?? "",
                timestamp: t.timestamp ?? new Date().toISOString(),
                location: t.location ?? "",
                note: t.note ?? "",
            })),

            notes: (o.notes ?? []).map((n: any) => ({
                author: n.author ?? "Admin",
                text: n.text ?? "",
                timestamp: n.timestamp ?? new Date().toISOString(),
            })),

            createdAt: o.createdAt ?? new Date().toISOString(),
        };
    });

// UPDATE STATUS
export const updateOrderStatus = (id: string, status: string) =>
    gracefulFetch(async () => {
        return await apiMethods.put(`/admin/orders-manage/${id}/status`, { status });
    });

// UPDATE TRACKING
export const updateOrderTracking = (id: string, trackingNumber: string) =>
    gracefulFetch(async () => {
        return await apiMethods.put(`/admin/orders-manage/${id}/tracking`, {
            trackingNumber,
        });
    });

// CANCEL ORDER
export const cancelOrder = (id: string, reason?: string) =>
    gracefulFetch(async () => {
        return await apiMethods.patch(`/admin/orders-manage/${id}/cancel`, {
            reason: reason ?? "Cancelled by admin",
        });
    });

// ADD NOTE
export const addOrderNote = (id: string, note: string) =>
    gracefulFetch(async () => {
        return await apiMethods.post(`/admin/orders-manage/${id}/notes`, {
            note,
        });
    });

// DOWNLOAD INVOICE
export const downloadOrderInvoice = (id: string) =>
    gracefulFetch(async () => {
        const res = await apiMethods.get(
            `/admin/orders-manage/${id}/invoice`,
            { responseType: "blob" }
        );
        return res as Blob;
    });

// EXPORT ORDERS
export const exportAdminOrders = (filters: any) =>
    gracefulFetch(async () => {
        const res = await apiMethods.post(
            "/admin/orders-manage/export",
            filters,
            { responseType: "blob" }
        );
        return res as Blob;
    });

// GET ORDER STATS
export const getAdminOrderStats = (params?: any) =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>("/admin/orders-manage/stats", { params });
        const stats = unwrapData<any>(res);

        return {
            ...DEFAULT_ORDER_STATS,
            ...(stats ?? {}),
        } as OrderStats;
    });

// ─── Customers ───────────────────────────────────────────────────────────────

export const getAdminCustomers = (params?: any) =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>("/admin/customers", { params });
        const data = unwrapData<any>(res);

        if (Array.isArray(data)) {
            return {
                data,
                total: data.length,
                page: params?.page ?? 1,
                limit: params?.limit ?? 10,
                totalPages: Math.ceil(data.length / (params?.limit ?? 10)),
            };
        }

        return {
            data: data?.items ?? data?.data ?? [],
            total: data?.total ?? 0,
            page: data?.page ?? params?.page ?? 1,
            limit: data?.limit ?? params?.limit ?? 10,
            totalPages: data?.totalPages ?? 1,
        };
    });

export const getAdminCustomerStats = () =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>("/admin/customers/stats");
        return unwrapData<any>(res);
    });

export const exportAdminCustomers = (filters: any) =>
    gracefulFetch(async () => {
        const res = await apiMethods.post(
            "/admin/customers/export",
            filters,
            { responseType: "blob" }
        );
        return res as Blob;
    });

export const updateAdminCustomer = (id: string, payload: any) =>
    gracefulFetch(async () => {
        return await apiMethods.put<any>(`/admin/customers/${id}`, payload);
    });

export const getAdminCustomerById = (id: string) =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>(`/admin/customers/${id}`);
        return unwrapData<any>(res);
    });

export const getAdminCustomerOrders = (id: string) =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>(`/admin/customers/${id}/orders`);
        return unwrapData<any>(res);
    });

// ─── Dashboard / Analytics ───────────────────────────────────────────────────

export const getDashboard = () =>
    gracefulFetch(async () => {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
            apiMethods.get<any>("/admin/orders-manage", { params: { page: 1, limit: 200 } }).catch(() => null),
            apiMethods.get<any>("/admin/products").catch(() => null),
            apiMethods.get<any>("/admin/users").catch(() => null),
        ]);

        const ordersData = unwrapData<any>(ordersRes) ?? {};
        const orders = Array.isArray(ordersData?.items)
            ? ordersData.items
            : Array.isArray(ordersData?.data)
                ? ordersData.data
                : Array.isArray(ordersData)
                    ? ordersData
                    : [];

        const totalRevenue = orders.reduce((sum: number, order: any) => {
            const value = Number(order?.totalAmount ?? order?.payment?.total ?? order?.total ?? 0);
            return sum + (Number.isFinite(value) ? value : 0);
        }, 0);

        const products = unwrapData<any>(productsRes);
        const users = unwrapData<any>(usersRes);

        const productsCount = Array.isArray(products)
            ? products.length
            : Array.isArray(products?.items)
                ? products.items.length
                : Number(products?.total ?? 0);

        const usersCount = Array.isArray(users)
            ? users.length
            : Array.isArray(users?.items)
                ? users.items.length
                : Number(users?.total ?? 0);

        return {
            totalRevenue,
            totalOrders: Number(ordersData?.total ?? orders.length),
            totalProducts: Number.isFinite(productsCount) ? productsCount : 0,
            activeUsers: Number.isFinite(usersCount) ? usersCount : 0,
            revenueTrend: 0,
            ordersTrend: 0,
        } as DashboardData;
    });

export const getAnalytics = (_range?: string) =>
    gracefulFetch(async () => {
        const stats = await getAdminOrderStats();
        const totalOrders = Number(stats?.total ?? stats?.total_orders ?? 0);

        return {
            revenue: { current: Number((stats as any)?.totalRevenue ?? 0), trend: 0 },
            orders: { current: totalOrders, trend: 0 },
            conversionRate: { current: 0, trend: 0 },
            visitors: { current: 0, trend: 0 },
        } as AnalyticsData;
    });

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const getAdminReviews = () =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>("/admin/reviews");
        const data = unwrapData<any>(res);
        if (Array.isArray(data)) return data as AdminReview[];
        return (data?.items ?? data?.data ?? []) as AdminReview[];
    });

// ─── Settings (frontend-safe fallback storage) ──────────────────────────────

export const getAdminSettings = (): Promise<any> =>
    gracefulFetch(async () => {
        if (typeof window === "undefined") return DEFAULT_SETTINGS;
        try {
            const raw = window.localStorage.getItem("admin_settings");
            if (!raw) return DEFAULT_SETTINGS;
            const parsed = JSON.parse(raw);
            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
            } as AdminSettings;
        } catch {
            return DEFAULT_SETTINGS;
        }
    });

export const updateAdminSettings = (payload: AdminSettings): Promise<any> =>
    gracefulFetch(async () => {
        if (typeof window !== "undefined") {
            const current = await getAdminSettings();
            const merged = {
                ...(current ?? DEFAULT_SETTINGS),
                ...payload,
            };
            window.localStorage.setItem("admin_settings", JSON.stringify(merged));
            return merged;
        }
        return payload;
    });

// ─── CMS (frontend-safe fallback storage) ───────────────────────────────────

export const getCMSData = () =>
    gracefulFetch(async () => {
        if (typeof window === "undefined") return DEFAULT_CMS_DATA;
        try {
            const raw = window.localStorage.getItem("admin_cms_data");
            if (!raw) return DEFAULT_CMS_DATA;
            const parsed = JSON.parse(raw);
            return {
                ...DEFAULT_CMS_DATA,
                ...parsed,
            } as CMSData;
        } catch {
            return DEFAULT_CMS_DATA;
        }
    });

export const updateCMSData = (payload: Partial<CMSData>) =>
    gracefulFetch(async () => {
        if (typeof window !== "undefined") {
            const current = await getCMSData();
            const merged = {
                ...(current ?? DEFAULT_CMS_DATA),
                ...payload,
            } as CMSData;
            window.localStorage.setItem("admin_cms_data", JSON.stringify(merged));
            return merged;
        }
        return payload as CMSData;
    });

// ─── Banners ─────────────────────────────────────────────────────────────────

export const getActiveBanners = () =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>("/banners");
        const data = unwrapData<any>(res);
        if (Array.isArray(data)) return data as Banner[];
        return (data?.items ?? data?.data ?? []) as Banner[];
    });

export const createBanner = (payload: FormData) =>
    gracefulFetch(async () => {
        const res = await apiMethods.post<any>("/banners", payload, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return unwrapData<Banner>(res);
    });

export const updateBanner = (id: string, payload: FormData) =>
    gracefulFetch(async () => {
        const res = await apiMethods.patch<any>(`/banners/${id}`, payload, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return unwrapData<Banner>(res);
    });

export const deleteBanner = (id: string) =>
    gracefulFetch(async () => {
        return await apiMethods.delete<any>(`/banners/${id}`);
    });

// ─── Categories ──────────────────────────────────────────────────────────────

export const getAdminCategories = (params?: any) =>
    gracefulFetch(async () => {
        const adminRes = await apiMethods
            .get<any>("/categories/admin/all", { params })
            .catch(() => null);

        const source = adminRes ?? (await apiMethods.get<any>("/categories", { params }));
        const data = unwrapData<any>(source);
        const items = Array.isArray(data)
            ? data
            : data?.items ?? data?.data ?? [];

        const normalized: Category[] = (items as any[]).map((item) => ({
            _id: item?._id,
            categoryId: item?.categoryId ?? item?._id ?? "",
            name: item?.name ?? "",
            description: item?.description ?? "",
            isActive: item?.isActive !== false,
            image: item?.image,
            productCount: item?.productCount,
        }));

        return {
            items: normalized,
            total: data?.total ?? normalized.length,
            page: data?.page ?? 1,
            limit: data?.limit ?? normalized.length,
            totalPages: data?.totalPages ?? 1,
        };
    });

export const createCategory = (payload: { name: string; description?: string; isActive?: boolean }) =>
    gracefulFetch(async () => {
        const res = await apiMethods.post<any>("/categories", payload);
        return unwrapData<Category>(res);
    });

export const updateCategory = (id: string, payload: Partial<{ name: string; description: string; isActive: boolean }>) =>
    gracefulFetch(async () => {
        const res = await apiMethods.patch<any>(`/categories/${id}`, payload);
        return unwrapData<Category>(res);
    });

export const deleteCategory = (id: string) =>
    gracefulFetch(async () => {
        return await apiMethods.delete<any>(`/categories/${id}`);
    });

// Backward-compatible alias used by product admin view
export const getCategories = (params?: any) => getAdminCategories(params);