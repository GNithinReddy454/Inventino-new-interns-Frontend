import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    ADMIN_PRODUCTS,
    RECENT_ORDERS,
    CUSTOMERS_DATA,
} from "@/app/(admin)/admin/_data/mockData";

export interface AdminState {
    products: any[];
    localAddedProducts: any[];
    orders: any[];
    customers: any[];
    reviews: any[];
    cms: {
        offerBar: {
            text: string;
            show: boolean;
        };
        heroBanner: {
            heading: string;
            text: string;
            image: string | null;
        };
        features: any[];
    };
    settings: {
        storeName: string;
        contactEmail: string;
        currency: string;
        taxRate: number;
    };
}

const initialState: AdminState = {
    products: ADMIN_PRODUCTS,
    localAddedProducts: [],
    orders: RECENT_ORDERS,
    customers: CUSTOMERS_DATA,
    reviews: [
        {
            id: "REV-001",
            customerName: "Alice Smith",
            productName: "Rose Gold Necklace",
            rating: 5,
            comment: "Absolutely beautiful necklace! The craftsmanship is top tier.",
            date: "2024-03-05",
        },
        {
            id: "REV-002",
            customerName: "John Doe",
            productName: "Leather Wallet",
            rating: 4,
            comment: "Great quality, but the shipping took a little longer than expected.",
            date: "2024-03-01",
        },
        {
            id: "REV-003",
            customerName: "Mary Johnson",
            productName: "Silver Earrings",
            rating: 5,
            comment: "These are my new favorite earrings. I wear them every day!",
            date: "2024-02-28",
        },
    ],
    cms: {
        offerBar: {
            text: "Free Shipping on Orders Over $50! Limited Time Offer",
            show: true,
        },
        heroBanner: {
            heading: "Created with love",
            text: "Made for you with passion and dedication. Each piece tells a unique story.",
            image: null,
        },
        features: [
            {
                id: 1,
                title: "Virtual Try-On",
                description:
                    "Experience our products virtually before making a purchase. Use AR technology to see how items look in your space.",
                enabled: true,
            },
            {
                id: 2,
                title: "Book Try at Home",
                description: "Schedule a doorstep trial of your favorite jewellery.",
                enabled: true,
            },
        ],
    },
    settings: {
        storeName: "Handmade Store",
        contactEmail: "contact@handmadestore.com",
        currency: "USD ($)",
        taxRate: 8,
    },
};

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        // Products
        addProduct: (state, action: PayloadAction<any>) => {
            state.localAddedProducts.unshift(action.payload);
        },
        updateProduct: (state, action: PayloadAction<{ id: string; updates: any }>) => {
            const index = state.products.findIndex((p) => p.id === action.payload.id);
            if (index !== -1) {
                state.products[index] = { ...state.products[index], ...action.payload.updates };
            }
        },
        deleteProduct: (state, action: PayloadAction<string>) => {
            state.products = state.products.filter((p) => p.id !== action.payload);
        },

        // Orders
        updateOrderStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
            const index = state.orders.findIndex((o) => o.id === action.payload.id);
            if (index !== -1) {
                state.orders[index].status = action.payload.status;
            }
        },
        deleteOrder: (state, action: PayloadAction<string>) => {
            state.orders = state.orders.filter((o) => o.id !== action.payload);
        },

        // Customers
        addCustomer: (state, action: PayloadAction<any>) => {
            state.customers.unshift(action.payload);
        },
        updateCustomer: (state, action: PayloadAction<{ id: string; updates: any }>) => {
            const index = state.customers.findIndex((c) => c.id === action.payload.id);
            if (index !== -1) {
                state.customers[index] = { ...state.customers[index], ...action.payload.updates };
            }
        },
        deleteCustomer: (state, action: PayloadAction<string>) => {
            state.customers = state.customers.filter((c) => c.id !== action.payload);
        },

        // CMS
        updateCMSOfferBar: (state, action: PayloadAction<any>) => {
            state.cms.offerBar = action.payload;
        },
        updateCMSHeroBanner: (state, action: PayloadAction<any>) => {
            state.cms.heroBanner = action.payload;
        },
        addCMSFeature: (state, action: PayloadAction<any>) => {
            state.cms.features.push(action.payload);
        },
        updateCMSFeature: (state, action: PayloadAction<{ id: number; updates: any }>) => {
            const index = state.cms.features.findIndex((f) => f.id === action.payload.id);
            if (index !== -1) {
                state.cms.features[index] = { ...state.cms.features[index], ...action.payload.updates };
            }
        },
        deleteCMSFeature: (state, action: PayloadAction<number>) => {
            state.cms.features = state.cms.features.filter((f) => f.id !== action.payload);
        },
        toggleCMSFeature: (state, action: PayloadAction<number>) => {
            const index = state.cms.features.findIndex((f) => f.id === action.payload);
            if (index !== -1) {
                state.cms.features[index].enabled = !state.cms.features[index].enabled;
            }
        },

        // Settings
        updateSettings: (state, action: PayloadAction<any>) => {
            state.settings = { ...state.settings, ...action.payload };
        },

        // Reviews
        deleteReview: (state, action: PayloadAction<string>) => {
            state.reviews = state.reviews.filter((r) => r.id !== action.payload);
        },
    },
});

export const {
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    deleteOrder,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    updateCMSOfferBar,
    updateCMSHeroBanner,
    addCMSFeature,
    updateCMSFeature,
    deleteCMSFeature,
    toggleCMSFeature,
    updateSettings,
    deleteReview,
} = adminSlice.actions;

export default adminSlice.reducer;
