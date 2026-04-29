import axios from "axios";
import { apiMethods } from "@/lib/api";

// ─── Helper: Graceful fetch ───────────────────────────────────────────────────
export interface AdminOrderDetail {
    _id: string;
    orderNumber: string;
    paymentMethod?: string;
    total?: number;

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
        productId?: string;
    }[];

    status: string;
    allowedNextStatuses?: string[];
    trackingNumber?: string;

    trackingUpdates?: {
        status: string;
        timestamp: string;
        location?: string;
        note?: string;
        label?: string;
        description?: string;
    }[];

    notes?: {
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
}
async function gracefulFetch<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
        return await fn();
    } catch (err) {
        if (axios.isAxiosError(err)) {
            console.warn("API WARN:", {
                url: err.config?.url,
                status: err.response?.status,
                data: err.response?.data,
            });
        } else {
            console.warn("UNKNOWN WARN:", err);
        }
        return null;
    }
}

const unwrapApiData = <T>(payload: any): T => {
    if (payload && typeof payload === "object" && "data" in payload) {
        return payload.data as T;
    }
    return payload as T;
};

const toNumber = (value: any, fallback = 0): number => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const VALID_ORDER_STATUSES = new Set([
    "created",
    "confirmed",
    "packed",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
    "payment_failed",
    "partially_cancelled",
]);

const VALID_SORT_FIELDS = new Set([
    "createdAt",
    "updatedAt",
    "orderNumber",
    "status",
    "trackingNumber",
]);

const normalizeListOrderParams = (params?: any) => {
    const rawPage = toNumber(params?.page, 1);
    const rawLimit = toNumber(params?.limit, 10);
    const page = Math.max(1, Math.trunc(rawPage));
    // Keep limits reasonable to avoid accidental heavy requests from UI.
    const limit = Math.min(100, Math.max(1, Math.trunc(rawLimit)));

    const search =
        typeof params?.search === "string" && params.search.trim()
            ? params.search.trim()
            : undefined;

    const statusRaw =
        typeof params?.status === "string" ? params.status.toLowerCase().trim() : "";
    const status = VALID_ORDER_STATUSES.has(statusRaw) ? statusRaw : undefined;

    const sortByRaw =
        typeof params?.sortBy === "string" ? params.sortBy.trim() : "createdAt";
    const sortBy = VALID_SORT_FIELDS.has(sortByRaw) ? sortByRaw : "createdAt";

    const sortOrder = params?.sortOrder === "asc" ? "asc" : "desc";

    const from = typeof params?.from === "string" ? params.from : undefined;
    const to = typeof params?.to === "string" ? params.to : undefined;

    return {
        page,
        limit,
        search,
        status,
        from,
        to,
        sortBy,
        sortOrder,
    };
};

// ─── Orders ───────────────────────────────────────────────────────────────────

// GET ORDERS LIST
export const getAdminOrders = (params?: any) =>
    gracefulFetch(async () => {
        const normalizedParams = normalizeListOrderParams(params);
        const res = await apiMethods.get<any>("/admin/orders-manage", {
            params: normalizedParams,
        });

        const listData = unwrapApiData<any[]>(res);
        const list: any[] = Array.isArray(listData) ? listData : [];

        const BG_COLORS = [
            "bg-purple-500","bg-blue-500","bg-green-500",
            "bg-pink-500","bg-yellow-500","bg-indigo-500",
        ];

        return {
            data: list.map((o: any, idx: number) => {
                const name =
                    typeof o.customer === "string"
                        ? o.customer
                        : o.customer?.name ?? o.user?.name ?? o.shippingAddress?.fullName ?? "";

                const email =
                    o.email ??
                    (typeof o.customer === "object" ? o.customer?.email : "") ??
                    o.user?.email ??
                    "";

                const totalAmount =
                    toNumber(o.total, NaN) ||
                    toNumber(o.totalAmount, NaN) ||
                    toNumber(o.pricing?.total, 0);

                return {
                    _id: o._id ?? o.orderNumber,
                    orderNumber: o.orderNumber ?? "",
                    customer: name || "Unknown",
                    email,
                    initials: name ? name.slice(0, 2).toUpperCase() : "NA",
                    bg: BG_COLORS[idx % BG_COLORS.length],
                    products:
                        o.items?.map((i: any) => ({
                            name: i.name ?? "",
                            quantity: i.quantity ?? 1,
                            price: i.price ?? 0,
                        })) ?? [],
                    totalAmount,
                    total: totalAmount,
                    status: o.status ?? "created",
                    date: o.createdAt ?? new Date().toISOString(),
                    createdAt: o.createdAt ?? new Date().toISOString(),
                    trackingNumber: o.trackingNumber ?? "",
                    payment: o.paymentMethod ?? o.payment?.method ?? "",
                };
            }),
            total: toNumber(res?.total, list.length),
            page: toNumber(res?.page, normalizedParams.page),
            limit: toNumber(res?.limit, normalizedParams.limit),
            totalPages:
                toNumber(res?.totalPages, 0) ||
                Math.ceil(
                    toNumber(res?.total, list.length) /
                        Math.max(toNumber(res?.limit, normalizedParams.limit), 1)
                ),
        };
    });

// GET ORDER DETAIL
export const getAdminOrderById = (id: string) =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>(`/admin/orders-manage/${id}`);
        const o = unwrapApiData<any>(res);

        const pricing = o.pricing ?? {};
        const payment = o.payment ?? {};
        const customer = o.customer ?? o.user ?? {};

        return {
            _id: o._id ?? id,
            orderNumber: o.orderNumber ?? "",
            paymentMethod: payment.method ?? o.paymentMethod ?? "",
            total: toNumber(o.total, NaN) || toNumber(pricing.total, 0),

            customer: {
                name:
                    typeof customer === "string"
                        ? customer
                        : customer?.name ?? o.shippingAddress?.fullName ?? "",
                email: customer?.email ?? "",
                phone: customer?.phone ?? o.shippingAddress?.phone ?? "",
                billingAddress: customer?.billingAddress ?? null,
                shippingAddress: customer?.shippingAddress ?? o.shippingAddress ?? null,
            },

            payment: {
                method: payment.method ?? o.paymentMethod ?? "",
                transactionId: payment.transactionId ?? "",
                status: payment.status ?? "pending",
                subtotal: toNumber(pricing.subtotal, 0),
                shipping: toNumber(pricing.shipping, 0),
                tax: toNumber(pricing.tax, 0),
                discount: toNumber(pricing.discount, 0),
                total: toNumber(pricing.total, NaN) || toNumber(o.total, 0),
            },

            items: (o.items ?? []).map((i: any) => ({
                name: i.name ?? "",
                sku: i.sku ?? i.name ?? "",
                quantity: toNumber(i.quantity, 1),
                price: toNumber(i.price, 0),
                total: toNumber(i.total, toNumber(i.price, 0) * toNumber(i.quantity, 1)),
                image: i.image ?? i.imageUrl ?? "",
                productId: i.productId ?? i.product?._id ?? i._id ?? undefined,
            })),

            status: o.status ?? "created",
            allowedNextStatuses: o.allowedNextStatuses ?? [],
            trackingNumber: o.trackingNumber ?? "",

            trackingUpdates: (o.trackingUpdates ?? []).map((t: any) => ({
                status: t.status ?? "",
                timestamp: t.timestamp ?? new Date().toISOString(),
                location: t.location ?? "",
                note: t.note ?? "",
                label: t.label ?? "",
                description: t.description ?? t.note ?? "",
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
        const res = await apiMethods.put(`/admin/orders-manage/${id}/status`, { status });
        return unwrapApiData(res);
    });

// UPDATE TRACKING
export const updateOrderTracking = (id: string, trackingNumber: string) =>
    gracefulFetch(async () => {
        const res = await apiMethods.put(`/admin/orders-manage/${id}/tracking`, {
            trackingNumber,
        });
        return unwrapApiData(res);
    });

// CANCEL ORDER
export const cancelOrder = (id: string, reason?: string) =>
    gracefulFetch(async () => {
        const res = await apiMethods.patch(`/admin/orders-manage/${id}/cancel`, {
            reason: reason ?? "Cancelled by admin",
        });
        return unwrapApiData(res);
    });

// ADD NOTE
export const addOrderNote = (id: string, note: string) =>
    gracefulFetch(async () => {
        const res = await apiMethods.post(`/admin/orders-manage/${id}/notes`, {
            note,
        });
        return unwrapApiData(res);
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
        const payload = {
            search:
                typeof filters?.search === "string" && filters.search.trim()
                    ? filters.search.trim()
                    : undefined,
            status:
                typeof filters?.status === "string" &&
                VALID_ORDER_STATUSES.has(filters.status.toLowerCase().trim())
                    ? filters.status.toLowerCase().trim()
                    : undefined,
            from: typeof filters?.from === "string" ? filters.from : undefined,
            to: typeof filters?.to === "string" ? filters.to : undefined,
        };

        const res = await apiMethods.post(
            "/admin/orders-manage/export",
            payload,
            { responseType: "blob" }
        );
        return res as Blob;
    });

export const getAdminOrderStats = () =>
    gracefulFetch(async () => {
        const direct = await gracefulFetch(async () => {
            const res = await apiMethods.get<any>("/admin/orders-manage/stats", {
                timeout: 5000,
            });
            return (res?.data ?? res) as any;
        });

        if (direct) {
            return {
                total: Number(direct.total ?? 0),
                created: Number(direct.created ?? 0),
                confirmed: Number(direct.confirmed ?? 0),
                packed: Number(direct.packed ?? 0),
                shipped: Number(direct.shipped ?? 0),
                delivered: Number(direct.delivered ?? 0),
                cancelled: Number(direct.cancelled ?? 0),
                returned: Number(direct.returned ?? 0),
            } as OrderStats;
        }

        const fallback = await getAdminOrders({ page: 1, limit: 500 });
        const list: any[] = Array.isArray(fallback?.data) ? fallback.data : [];
        const counts: OrderStats = {
            total: list.length,
            created: 0,
            confirmed: 0,
            packed: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
            returned: 0,
        };

        list.forEach((o: any) => {
            const key = String(o?.status ?? "").toLowerCase();
            if (key in counts) {
                counts[key as keyof OrderStats] =
                    Number(counts[key as keyof OrderStats]) + 1;
            }
        });

        return counts;
    }).then((d) =>
        d ?? {
            total: 0,
            created: 0,
            confirmed: 0,
            packed: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
            returned: 0,
        }
    );

// ─── Customers ───────────────────────────────────────────────────────────────

export interface AdminCustomer {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    userId?: string;
    totalOrders?: number;
    totalSpent?: number;
    customerType?: string;
}

export interface AdminCustomerDetail extends AdminCustomer {
    customerId?: string;
    registeredAt?: string;
    active?: boolean;
    addresses?: any;
}

export const getAdminCustomers = (params?: any) =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>("/admin/customers", { params });
        const payload = (res as any)?.data ?? res;

        if (Array.isArray(payload)) {
            const limit = Number(params?.limit ?? 10);
            return {
                data: payload,
                total: payload.length,
                page: Number(params?.page ?? 1),
                limit,
                totalPages: Math.ceil(payload.length / limit),
            };
        }

        return {
            data: payload?.items ?? payload?.data ?? [],
            total: Number(payload?.total ?? 0),
            page: Number(payload?.page ?? params?.page ?? 1),
            limit: Number(payload?.limit ?? params?.limit ?? 10),
            totalPages: Number(payload?.totalPages ?? 1),
        };
    });

export const getAdminCustomerStats = () =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>("/admin/customers/stats");
        return (res as any)?.data ?? res;
    });

export const exportAdminCustomers = (filters: any) =>
    gracefulFetch(async () => {
        const res = await apiMethods.post("/admin/customers/export", filters, {
            responseType: "blob",
        });
        return res as Blob;
    });

export const getAdminCustomerById = (id: string) =>
    gracefulFetch(async () => {
        return await apiMethods.get<any>(`/admin/customers/${id}`);
    });

export const getAdminCustomerOrders = (id: string) =>
    gracefulFetch(async () => {
        return await apiMethods.get<any>(`/admin/customers/${id}/orders`);
    });

export const updateAdminCustomer = (id: string, payload: any) =>
    gracefulFetch(async () => {
        return await apiMethods.put(`/admin/customers/${id}`, payload);
    });

// ─── Admin Dashboard / Analytics ─────────────────────────────────────────────

export interface DashboardData {
    totalRevenue: number;
    revenueTrend: number;
    totalOrders: number;
    ordersTrend: number;
    totalProducts: number;
    activeUsers: number;
}

export interface AnalyticsMetric {
    current: number;
    trend: number;
}

export interface AnalyticsData {
    revenue: AnalyticsMetric;
    orders: AnalyticsMetric;
    visitors: AnalyticsMetric;
    conversionRate: AnalyticsMetric;
}

export interface AdminReview {
    _id: string;
    customerName: string;
    productName: string;
    rating: number;
    comment: string;
    status?: string;
}

export interface Banner {
    _id?: string;
    title?: string;
    link?: string;
    image?: string;
    isActive?: boolean;
    position?: number;
}

export interface Category {
    _id?: string;
    categoryId?: string;
    name: string;
    description?: string;
    isActive: boolean;
    image?: {
        url?: string;
        key?: string;
    };
    productCount?: number;
}

const DEFAULT_DASHBOARD: DashboardData = {
    totalRevenue: 0,
    revenueTrend: 0,
    totalOrders: 0,
    ordersTrend: 0,
    totalProducts: 0,
    activeUsers: 0,
};

const DEFAULT_ANALYTICS: AnalyticsData = {
    revenue: { current: 0, trend: 0 },
    orders: { current: 0, trend: 0 },
    visitors: { current: 0, trend: 0 },
    conversionRate: { current: 0, trend: 0 },
};

function unwrapData<T = any>(raw: any): T {
    const l1 = raw?.data ?? raw;
    const l2 = l1?.data ?? l1;
    return l2 as T;
}

export const getDashboard = () =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>("/admin/dashboard");
        const data = unwrapData<any>(res) || {};

        return {
            totalRevenue: Number(data.totalRevenue ?? data.revenue ?? 0),
            revenueTrend: Number(data.revenueTrend ?? 0),
            totalOrders: Number(data.totalOrders ?? data.orders ?? 0),
            ordersTrend: Number(data.ordersTrend ?? 0),
            totalProducts: Number(data.totalProducts ?? data.products ?? 0),
            activeUsers: Number(data.activeUsers ?? data.users ?? 0),
        } as DashboardData;
    }).then((d) => d ?? DEFAULT_DASHBOARD);

export const getAnalytics = (period = "30d") =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>("/admin/analytics", { params: { period } });
        const data = unwrapData<any>(res) || {};

        return {
            revenue: {
                current: Number(data?.revenue?.current ?? 0),
                trend: Number(data?.revenue?.trend ?? 0),
            },
            orders: {
                current: Number(data?.orders?.current ?? 0),
                trend: Number(data?.orders?.trend ?? 0),
            },
            visitors: {
                current: Number(data?.visitors?.current ?? 0),
                trend: Number(data?.visitors?.trend ?? 0),
            },
            conversionRate: {
                current: Number(data?.conversionRate?.current ?? 0),
                trend: Number(data?.conversionRate?.trend ?? 0),
            },
        } as AnalyticsData;
    }).then((d) => d ?? DEFAULT_ANALYTICS);

// ─── Settings / CMS ──────────────────────────────────────────────────────────

export const getAdminSettings = () =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>("/admin/settings");
        return unwrapData<any>(res) || {};
    }).then((d) => d ?? {});

export const updateAdminSettings = (payload: any) =>
    gracefulFetch(async () => {
        const res = await apiMethods.patch<any>("/admin/settings", payload);
        return unwrapData<any>(res) || {};
    }).then((d) => d ?? {});

export const getCMSData = () =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>("/admin/settings");
        return unwrapData<any>(res) || {};
    }).then((d) => d ?? {});

export const updateCMSData = (payload: any) =>
    gracefulFetch(async () => {
        const res = await apiMethods.patch<any>("/admin/settings", payload);
        return unwrapData<any>(res) || {};
    }).then((d) => d ?? {});

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const getAdminReviews = () =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>("/reviews", {
            params: { page: 1, limit: 200 },
        });

        const payload = unwrapData<any>(res) || {};
        const rawReviews = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.reviews)
            ? payload.reviews
            : Array.isArray(payload?.items)
            ? payload.items
            : [];

        return rawReviews.map((r: any) => ({
            _id: String(r?._id ?? ""),
            customerName:
                r?.customerName ?? r?.user?.name ?? r?.userName ?? "Unknown Customer",
            productName:
                r?.productName ?? r?.product?.name ?? r?.product?.productName ?? "Unknown Product",
            rating: Number(r?.rating ?? 0),
            comment: String(r?.comment ?? ""),
            status: r?.createdAt
                ? new Date(r.createdAt).toLocaleDateString()
                : (r?.status ?? ""),
        })) as AdminReview[];
    }).then((d) => d ?? []);

// ─── Banners ─────────────────────────────────────────────────────────────────

export const getActiveBanners = () =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>("/banners");
        const payload = unwrapData<any>(res);
        return (Array.isArray(payload) ? payload : []) as Banner[];
    }).then((d) => d ?? []);

export const createBanner = (payload: FormData | Record<string, any>) =>
    gracefulFetch(async () => {
        const res = await apiMethods.post<any>("/banners", payload, {
            headers:
                typeof FormData !== "undefined" && payload instanceof FormData
                    ? { "Content-Type": "multipart/form-data" }
                    : undefined,
        });
        return (unwrapData<any>(res) || {}) as Banner;
    });

export const updateBanner = (id: string, payload: FormData | Record<string, any>) =>
    gracefulFetch(async () => {
        const res = await apiMethods.patch<any>(`/banners/${id}`, payload, {
            headers:
                typeof FormData !== "undefined" && payload instanceof FormData
                    ? { "Content-Type": "multipart/form-data" }
                    : undefined,
        });
        return (unwrapData<any>(res) || {}) as Banner;
    });

export const deleteBanner = (id: string) =>
    gracefulFetch(async () => {
        return await apiMethods.delete(`/banners/${id}`);
    });

// ─── Categories ──────────────────────────────────────────────────────────────

export const getAdminCategories = (params?: Record<string, any>) =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>("/categories/admin/all", { params });
        const payload = unwrapData<any>(res) || {};

        if (Array.isArray(payload)) {
            return {
                items: payload,
                total: payload.length,
            };
        }

        return {
            items: payload?.items ?? payload?.data ?? [],
            total: Number(payload?.total ?? payload?.items?.length ?? 0),
        };
    }).then((d) => d ?? { items: [], total: 0 });

export const getCategories = (params?: Record<string, any>) =>
    gracefulFetch(async () => {
        const res = await apiMethods.get<any>("/categories", { params });
        const payload = unwrapData<any>(res) || {};

        if (Array.isArray(payload)) {
            return { items: payload, total: payload.length };
        }

        return {
            items: payload?.items ?? payload?.data ?? [],
            total: Number(payload?.total ?? payload?.items?.length ?? 0),
        };
    }).then((d) => d ?? { items: [], total: 0 });

export const createCategory = (payload: Partial<Category> & Record<string, any>) =>
    gracefulFetch(async () => {
        const res = await apiMethods.post<any>("/categories", payload);
        return (unwrapData<any>(res) || {}) as Category;
    });

export const updateCategory = (id: string, payload: Partial<Category> & Record<string, any>) =>
    gracefulFetch(async () => {
        const res = await apiMethods.patch<any>(`/categories/${id}`, payload);
        return (unwrapData<any>(res) || {}) as Category;
    });

export const deleteCategory = (id: string) =>
    gracefulFetch(async () => {
        return await apiMethods.delete(`/categories/${id}`);
    });