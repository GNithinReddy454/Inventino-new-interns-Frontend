import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Toggle from "./Toggle";
import { Skeleton } from "./Skeleton";
import { useToast } from "@/app/components/GlobalToast";

// Zod Schema for Settings
const settingsSchema = z.object({
    storeName: z.string().min(2, "Store name must be at least 2 characters"),
    storeEmail: z.string().email("Invalid email address"),
    storePhone: z.string().min(10, "Phone number must be at least 10 characters"),
    storeCurrency: z.string().min(1, "Currency is required"),
    storeAddress: z.string().min(5, "Address must be at least 5 characters"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

// Mock database initial state
const defaultValues: SettingsFormData = {
    storeName: "Handmade Marketplace",
    storeEmail: "store@handmade.com",
    storePhone: "+1 (555) 123-4567",
    storeCurrency: "USD ($)",
    storeAddress: "123 Main Street, New York, NY 10001",
};

export default function SettingsView() {
    const [notifications, setNotifications] = useState({
        orderNotifications: true,
        lowStockAlerts: true,
        customerMessages: true,
        reviewNotifications: false,
    });

    const [payment, setPayment] = useState({
        freeShippingThreshold: "$50.00",
        standardShippingRate: "$5.99",
        stripeGateway: true,
        paypalIntegration: true,
        cashOnDelivery: false,
    });

    const [twoFactor, setTwoFactor] = useState(false);
    const [taxEnabled, setTaxEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    // Initialize React Hook Form for the primary settings block
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<SettingsFormData>({
        resolver: zodResolver(settingsSchema),
        defaultValues,
    });

    const onSubmitStoreInfo = async (data: SettingsFormData) => {
        // Simulate API call
        console.log("Saving Store Info:", data);
        await new Promise((resolve) => setTimeout(resolve, 800));
        showToast("Success", "Store settings saved successfully!", "success");
    };

    return (
        <div className="space-y-6 w-full">
            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-bold text-foreground">Settings</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Manage your store settings and preferences
                </p>
            </div>

            {/* Store Information */}
            <form
                onSubmit={handleSubmit(onSubmitStoreInfo)}
                className="bg-card rounded-2xl border border-border shadow-sm p-6"
            >
                <h3 className="text-base font-bold text-foreground">
                    Store Information
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-6">
                    Basic store details and contact information
                </p>

                {isLoading ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex flex-col gap-1.5">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="storeName"
                                    className="text-xs font-semibold text-foreground"
                                >
                                    Store Name
                                </label>
                                <input
                                    id="storeName"
                                    {...register("storeName")}
                                    className={`w-full px-4 py-2.5 bg-[#FDF2F5] border rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all ${errors.storeAddress ? "border-red-500" : "border-pink-200"
                                        }`}
                                />
                                {errors.storeName && (
                                    <span className="text-red-500 text-xs mt-1">
                                        {errors.storeName.message}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="storeEmail"
                                    className="text-xs font-semibold text-foreground"
                                >
                                    Store Email
                                </label>
                                <input
                                    id="storeEmail"
                                    {...register("storeEmail")}
                                    className={`w-full px-4 py-2.5 bg-input border rounded-xl text-sm focus:outline-none focus:border-primary transition-all ${errors.storeEmail ? "border-red-500" : "border-border"
                                        }`}
                                />
                                {errors.storeEmail && (
                                    <span className="text-red-500 text-xs mt-1">
                                        {errors.storeEmail.message}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="storePhone"
                                    className="text-xs font-semibold text-foreground"
                                >
                                    Contact Phone
                                </label>
                                <input
                                    id="storePhone"
                                    {...register("storePhone")}
                                    className={`w-full px-4 py-2.5 bg-input border rounded-xl text-sm focus:outline-none focus:border-primary transition-all ${errors.storePhone ? "border-red-500" : "border-border"
                                        }`}
                                />
                                {errors.storePhone && (
                                    <span className="text-red-500 text-xs mt-1">
                                        {errors.storePhone.message}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="storeCurrency"
                                    className="text-xs font-semibold text-foreground"
                                >
                                    Currency
                                </label>
                                <input
                                    id="storeCurrency"
                                    {...register("storeCurrency")}
                                    className={`w-full px-4 py-2.5 bg-input border rounded-xl text-sm focus:outline-none focus:border-primary transition-all ${errors.storeCurrency ? "border-red-500" : "border-border"
                                        }`}
                                />
                                {errors.storeCurrency && (
                                    <span className="text-red-500 text-xs mt-1">
                                        {errors.storeCurrency.message}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label
                                    htmlFor="storeAddress"
                                    className="text-xs font-semibold text-foreground"
                                >
                                    Store Address
                                </label>
                                <input
                                    id="storeAddress"
                                    {...register("storeAddress")}
                                    className={`w-full px-4 py-2.5 bg-input border rounded-xl text-sm focus:outline-none focus:border-primary transition-all ${errors.storeAddress ? "border-red-500" : "border-border"
                                        }`}
                                />
                                {errors.storeAddress && (
                                    <span className="text-red-500 text-xs mt-1">
                                        {errors.storeAddress.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <button
                                type="button"
                                onClick={() => reset()}
                                className="w-full py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-all"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary-dark transition-all shadow-sm disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </>
                )}
            </form>

            {/* Notification Preferences */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <h3 className="text-base font-bold text-foreground">
                    Notification Preferences
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-6">
                    Manage email and push notifications
                </p>

                <div className="space-y-0 divide-y divide-border">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between py-4">
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-64" />
                                </div>
                                <Skeleton className="w-10 h-5 rounded-full" />
                            </div>
                        ))
                    ) : (
                        (
                            [
                                {
                                    key: "orderNotifications",
                                    label: "Order Notifications",
                                    desc: "Get notified when new orders are placed",
                                },
                                {
                                    key: "lowStockAlerts",
                                    label: "Low Stock Alerts",
                                    desc: "Alert when product inventory runs low",
                                },
                                {
                                    key: "customerMessages",
                                    label: "Customer Messages",
                                    desc: "Notifications for customer inquiries",
                                },
                                {
                                    key: "reviewNotifications",
                                    label: "Review Notifications",
                                    desc: "Alert when customers leave product reviews",
                                },
                            ] as {
                                key: keyof typeof notifications;
                                label: string;
                                desc: string;
                            }[]
                        ).map((item) => (
                            <div
                                key={item.key}
                                className="flex items-center justify-between py-4"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        {item.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {item.desc}
                                    </p>
                                </div>
                                <Toggle
                                    enabled={notifications[item.key]}
                                    onToggle={() =>
                                        setNotifications((prev) => ({
                                            ...prev,
                                            [item.key]: !prev[item.key],
                                        }))
                                    }
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Payment & Shipping */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <h3 className="text-base font-bold text-foreground">
                    Payment &amp; Shipping
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-6">
                    Configure payment gateways and shipping options
                </p>

                {isLoading ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                        <div className="space-y-0 divide-y divide-border">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between py-4">
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-3 w-64" />
                                    </div>
                                    <Skeleton className="w-10 h-5 rounded-full" />
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="freeShippingThreshold"
                                    className="text-xs font-semibold text-foreground"
                                >
                                    Free Shipping Threshold
                                </label>
                                <input
                                    id="freeShippingThreshold"
                                    value={payment.freeShippingThreshold}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setPayment({
                                            ...payment,
                                            freeShippingThreshold: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="standardShippingRate"
                                    className="text-xs font-semibold text-foreground"
                                >
                                    Standard Shipping Rate
                                </label>
                                <input
                                    id="standardShippingRate"
                                    value={payment.standardShippingRate}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setPayment({ ...payment, standardShippingRate: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-0 divide-y divide-border">
                            {(
                                [
                                    {
                                        key: "stripeGateway",
                                        label: "Stripe Payment Gateway",
                                        desc: "Accept credit and debit card payments",
                                    },
                                    {
                                        key: "paypalIntegration",
                                        label: "PayPal Integration",
                                        desc: "Allow customers to pay with PayPal",
                                    },
                                    {
                                        key: "cashOnDelivery",
                                        label: "Cash on Delivery",
                                        desc: "Enable COD payment option",
                                    },
                                ] as { key: keyof typeof payment; label: string; desc: string }[]
                            ).map((item) => (
                                <div
                                    key={item.key}
                                    className="flex items-center justify-between py-4"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            {item.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {item.desc}
                                        </p>
                                    </div>
                                    <Toggle
                                        enabled={payment[item.key] as boolean}
                                        onToggle={() =>
                                            setPayment((prev) => ({
                                                ...prev,
                                                [item.key]: !prev[item.key],
                                            }))
                                        }
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <button className="w-full py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-all">
                                Cancel
                            </button>
                            <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary-dark transition-all shadow-sm">
                                Save Settings
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Security Settings */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <h3 className="text-base font-bold text-foreground">
                    Security Settings
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-5">
                    Manage password and account security
                </p>

                {isLoading ? (
                    <div className="space-y-5">
                        <Skeleton className="h-16 w-full" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-4 mt-2 border-t border-border">
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-56" />
                            </div>
                            <Skeleton className="w-10 h-5 rounded-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-5">
                            <span className="text-yellow-500 text-sm mt-0.5">⚠️</span>
                            <p className="text-xs text-yellow-700 font-medium">
                                For security reasons, password changes require email verification.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="currentPassword"
                                    className="text-xs font-semibold text-foreground"
                                >
                                    Current Password
                                </label>
                                <input
                                    id="currentPassword"
                                    type="password"
                                    placeholder="Enter current password"
                                    className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="newPassword"
                                    className="text-xs font-semibold text-foreground"
                                >
                                    New Password
                                </label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-4 mt-2 border-t border-border">
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Two-Factor Authentication
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Add extra security layer to your account
                                </p>
                            </div>
                            <Toggle
                                enabled={twoFactor}
                                onToggle={() => setTwoFactor((prev) => !prev)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <button className="w-full py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-all">
                                Cancel
                            </button>
                            <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary-dark transition-all shadow-sm">
                                Update Password
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Tax Configuration */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <h3 className="text-base font-bold text-foreground">
                    Tax Configuration
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-5">
                    Set up tax rates and rules
                </p>

                {isLoading ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 mb-4 border-b border-border">
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-56" />
                            </div>
                            <Skeleton className="w-10 h-5 rounded-full" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between py-3 mb-4 border-b border-border">
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Enable Tax Calculation
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Automatically calculate taxes on orders
                                </p>
                            </div>
                            <Toggle
                                enabled={taxEnabled}
                                onToggle={() => setTaxEnabled((prev) => !prev)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="defaultTaxRate"
                                    className="text-xs font-semibold text-foreground"
                                >
                                    Default Tax Rate
                                </label>
                                <input
                                    id="defaultTaxRate"
                                    defaultValue="8.5%"
                                    className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="taxIdNumber"
                                    className="text-xs font-semibold text-foreground"
                                >
                                    Tax ID Number
                                </label>
                                <input
                                    id="taxIdNumber"
                                    placeholder="Enter tax ID (optional)"
                                    className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <button className="w-full py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-all">
                                Reset
                            </button>
                            <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary-dark transition-all shadow-sm">
                                Save Tax Settings
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Account Management */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <h3 className="text-base font-bold text-foreground">
                    Account Management
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-5">
                    Manage your admin account
                </p>

                {isLoading ? (
                    <div className="space-y-5">
                        <Skeleton className="h-16 w-full" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Danger Banner */}
                        <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-5">
                            <span className="text-yellow-500 text-sm mt-0.5">⚠️</span>
                            <p className="text-xs text-yellow-700 font-medium">
                                These actions are permanent and cannot be undone. Please proceed
                                with caution.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="adminEmail"
                                    className="text-xs font-semibold text-foreground"
                                >
                                    Admin Email
                                </label>
                                <input
                                    id="adminEmail"
                                    defaultValue="admin@handmade.com"
                                    className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="accountStatus"
                                    className="text-xs font-semibold text-foreground"
                                >
                                    Account Status
                                </label>
                                <input
                                    id="accountStatus"
                                    defaultValue="Active"
                                    readOnly
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-border rounded-xl text-sm focus:outline-none cursor-default text-muted-foreground"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="w-full py-2.5 border-2 border-primary text-primary rounded-xl text-sm font-bold hover:bg-pink-50 transition-all">
                                Logout All Devices
                            </button>
                            <button className="w-full py-2.5 border-2 border-primary text-primary rounded-xl text-sm font-bold hover:bg-pink-50 transition-all">
                                Deactivate Account
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
