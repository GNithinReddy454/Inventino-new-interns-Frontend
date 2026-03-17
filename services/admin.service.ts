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