"use client";

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  PlusCircle,
  Star,
  FileText,
  BarChart2,
  Users,
  Settings,
  Search,
  Bell,
  ChevronDown,
  MoreVertical,
  TrendingUp,
  DollarSign,
  Box,
  CheckCircle2,
  LayoutTemplate,
  Upload,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import AddProduct from "./AddProduct";

// ---- MOCK DATA ----
const ADMIN_PRODUCTS = [
  {
    id: "#PRD-001",
    name: "Delicate Rose Gold Bracelet",
    sku: "SKU: RGS-RGC-001",
    price: 89.99,
    stock: 45,
    category: "Jewelry",
    status: "Active",
    color: "bg-amber-300",
  },
  {
    id: "#PRD-002",
    name: "Classic Pearl Necklace Set",
    sku: "SKU: PRE-NCK-002",
    price: 129.99,
    stock: 8,
    category: "Jewelry",
    status: "Low Stock",
    color: "bg-gray-300",
  },
  {
    id: "#PRD-003",
    name: "Boho Beaded Bracelet Set",
    sku: "SKU: BHO-BRC-003",
    price: 44.99,
    stock: 0,
    category: "Jewelry",
    status: "Out of Stock",
    color: "bg-emerald-500",
  },
  {
    id: "#PRD-004",
    name: "Handmade Leather Tote Bag",
    sku: "SKU: LTH-BAG-004",
    price: 159.99,
    stock: 32,
    category: "Bags",
    status: "Active",
    color: "bg-pink-500",
  },
  {
    id: "#PRD-005",
    name: "Woven Crossbody Bag",
    sku: "SKU: WVN-BAG-005",
    price: 79.99,
    stock: 56,
    category: "Bags",
    status: "Active",
    color: "bg-amber-600",
  },
  {
    id: "#PRD-006",
    name: "Organic Cotton Throw Blanket",
    sku: "SKU: CTN-BLK-006",
    price: 64.99,
    stock: 28,
    category: "Textiles",
    status: "Active",
    color: "bg-yellow-200",
  },
  {
    id: "#PRD-008",
    name: "Sterling Silver Chain Necklace",
    sku: "SKU: SLV-PCK-008",
    price: 109.99,
    stock: 42,
    category: "Jewelry",
    status: "Active",
    color: "bg-gray-700",
  },
  {
    id: "#PRD-009",
    name: "Handwoven Macrame Wall Art",
    sku: "SKU: MCR-DCH-009",
    price: 74.99,
    stock: 18,
    category: "Home Decor",
    status: "Active",
    color: "bg-amber-700",
  },
  {
    id: "#PRD-007",
    name: "Gold Plated Earrings Set",
    sku: "SKU: GLD-EAR-007",
    price: 94.99,
    stock: 6,
    category: "Jewelry",
    status: "Low Stock",
    color: "bg-yellow-500",
  },
  {
    id: "#PRD-010",
    name: "Ceramic Vase Collection",
    sku: "SKU: CRM-VAS-010",
    price: 89.99,
    stock: 15,
    category: "Home Decor",
    status: "Active",
    color: "bg-gray-200",
  },
  {
    id: "#PRD-011",
    name: "Hand-dyed Silk Scarf",
    sku: "SKU: SLK-SCF-011",
    price: 54.99,
    stock: 33,
    category: "Textiles",
    status: "Active",
    color: "bg-purple-400",
  },
  {
    id: "#PRD-012",
    name: "Beaded Tassel Earrings",
    sku: "SKU: BDD-EAR-012",
    price: 34.99,
    stock: 71,
    category: "Jewelry",
    status: "Active",
    color: "bg-rose-400",
  },
  {
    id: "#PRD-013",
    name: "Knitted Coin Purse",
    sku: "SKU: KNT-PRS-013",
    price: 24.99,
    stock: 4,
    category: "Bags",
    status: "Low Stock",
    color: "bg-green-300",
  },
  {
    id: "#PRD-014",
    name: "Rattan Wall Mirror",
    sku: "SKU: RTN-MIR-014",
    price: 119.99,
    stock: 9,
    category: "Home Decor",
    status: "Low Stock",
    color: "bg-amber-200",
  },
  {
    id: "#PRD-015",
    name: "Crystal Quartz Pendant",
    sku: "SKU: CRY-PND-015",
    price: 49.99,
    stock: 0,
    category: "Jewelry",
    status: "Out of Stock",
    color: "bg-sky-300",
  },
];

const RECENT_ORDERS = [
  {
    id: "#ORD-2024-001",
    customer: "Sarah Miller",
    product: "Rose Gold Bracelet",
    amount: "$89.99",
    status: "Completed",
    date: "Feb 6, 2026",
  },
  {
    id: "#ORD-2024-002",
    customer: "John Davis",
    product: "Pearl Necklace Set",
    amount: "$129.99",
    status: "Processing",
    date: "Feb 6, 2026",
  },
  {
    id: "#ORD-2024-003",
    customer: "Emily Brown",
    product: "Boho Beaded Set",
    amount: "$44.99",
    status: "Pending",
    date: "Feb 5, 2026",
  },
  {
    id: "#ORD-2024-004",
    customer: "Michael Wilson",
    product: "Crochet Pouch",
    amount: "$39.99",
    status: "Completed",
    date: "Feb 5, 2026",
  },
  {
    id: "#ORD-2024-005",
    customer: "Olivia Johnson",
    product: "Classic Earrings",
    amount: "$54.99",
    status: "Cancelled",
    date: "Feb 4, 2026",
  },
];

const TOP_PRODUCTS = [
  {
    name: "Rose Gold Bracelet",
    category: "Jewelry",
    sales: 245,
    color: "bg-orange-200",
  },
  {
    name: "Pearl Necklace",
    category: "Jewelry",
    sales: 198,
    color: "bg-gray-200",
  },
  {
    name: "Boho Beaded Set",
    category: "Accessories",
    sales: 156,
    color: "bg-green-200",
  },
  {
    name: "Crochet Pouch",
    category: "Accessories",
    sales: 142,
    color: "bg-yellow-200",
  },
];

const RECENT_ACTIVITY = [
  {
    text: "New order received",
    time: "2 minutes ago",
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-100",
  },
  {
    text: "Order #1234 shipped",
    time: "15 minutes ago",
    icon: Box,
    color: "text-blue-500",
    bg: "bg-blue-100",
  },
  {
    text: "New 5-star review",
    time: "1 hour ago",
    icon: Star,
    color: "text-yellow-500",
    bg: "bg-yellow-100",
  },
  {
    text: "New product added",
    time: "3 hours ago",
    icon: PlusCircle,
    color: "text-primary",
    bg: "bg-pink-100",
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-card border-r border-border fixed left-0 top-0 h-screen z-30 flex flex-col font-sans shadow-sm">
        <div className="p-6 flex-shrink-0 border-b border-border">
          <h1 className="text-3xl font-serif text-primary-dark">Inventino</h1>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">
            A la mode handcrafted
          </p>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto py-4 custom-scrollbar">
          {/* MAIN */}
          <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Main
          </p>
          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={activeTab === "Dashboard"}
            onClick={() => setActiveTab("Dashboard")}
          />
          <NavItem
            icon={LayoutTemplate}
            label="CMS"
            active={activeTab === "CMS"}
            onClick={() => setActiveTab("CMS")}
          />

          {/* PRODUCTS */}
          <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 mt-6">
            Products
          </p>
          <NavItem
            icon={Package}
            label="All Products"
            active={activeTab === "All Products"}
            onClick={() => setActiveTab("All Products")}
          />
          <NavItem
            icon={PlusCircle}
            label="Add Product"
            active={activeTab === "Add Product"}
            onClick={() => setActiveTab("Add Product")}
          />
          <NavItem
            icon={Star}
            label="Reviews"
            active={activeTab === "Reviews"}
            onClick={() => setActiveTab("Reviews")}
          />
          <NavItem
            icon={ShoppingCart}
            label="Orders"
            active={activeTab === "Orders"}
            onClick={() => setActiveTab("Orders")}
          />

          {/* ANALYTICS */}
          <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 mt-6">
            Analytics
          </p>
          <NavItem
            icon={BarChart2}
            label="Reports & Analytics"
            active={activeTab === "Reports & Analytics"}
            onClick={() => setActiveTab("Reports & Analytics")}
          />

          {/* OTHER */}
          <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 mt-6">
            Other
          </p>
          <NavItem
            icon={Users}
            label="Customers"
            active={activeTab === "Customers"}
            onClick={() => setActiveTab("Customers")}
          />
          <NavItem
            icon={Settings}
            label="Settings"
            active={activeTab === "Settings"}
            onClick={() => setActiveTab("Settings")}
          />
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 ml-64 p-8 bg-background min-h-screen">
        {/* Global page header — hidden for tabs that render their own header */}
        {!(
          [
            "All Products",
            "Reviews",
            "Orders",
            "Reports & Analytics",
            "Customers",
            "Settings",
          ] as string[]
        ).includes(activeTab) && (
          <header className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {activeTab === "Dashboard"
                  ? "Welcome back, Admin! 👋"
                  : activeTab === "CMS"
                    ? "Landing Page CMS"
                    : activeTab}
              </h2>
              <p className="text-sm text-muted-foreground">
                {activeTab === "Dashboard"
                  ? "Here's what's happening with your store today."
                  : activeTab === "CMS"
                    ? "Manage your landing page content, banners and features."
                    : "Manage your store efficiently."}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search orders, products..."
                  className="pl-10 pr-4 py-2 bg-card border border-border rounded-full text-sm focus:outline-none focus:border-primary-dark w-64 shadow-sm"
                />
              </div>
              <button className="p-2 bg-card border border-border rounded-full text-muted-foreground hover:text-primary-dark shadow-sm relative">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-border">
                <div className="w-9 h-9 bg-primary-dark rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="text-sm">
                  <p className="font-bold text-foreground leading-none">
                    Admin User
                  </p>
                  <p className="text-muted-foreground text-xs">Administrator</p>
                </div>
                <ChevronDown size={14} className="text-muted-foreground" />
              </div>
            </div>
          </header>
        )}

        {/* --- CONDITIONAL RENDER --- */}
        {activeTab === "Dashboard" && <DashboardView />}
        {activeTab === "Add Product" && <AddProduct />}
        {activeTab === "CMS" && <LandingPageCMSView />}
        {activeTab === "All Products" && (
          <AllProductsView onAddProduct={() => setActiveTab("Add Product")} />
        )}
        {activeTab === "Reviews" && <ReviewsView />}
        {activeTab === "Orders" && <OrdersView />}

        {activeTab === "Reports & Analytics" && <ReportsAnalyticsView />}

        {activeTab === "Customers" && <CustomersView />}

        {activeTab === "Settings" && <SettingsView />}
      </main>
    </div>
  );
}

// --- LANDING PAGE CMS VIEW ---
function LandingPageCMSView() {
  const [offerText, setOfferText] = useState(
    "Free Shipping on Orders Over $50! Limited Time Offer",
  );
  const [showOfferBar, setShowOfferBar] = useState(true);
  const [bannerHeading, setBannerHeading] = useState("Created with love");
  const [bannerText, setBannerText] = useState(
    "Made for you with passion and dedication. Each piece tells a unique story.",
  );
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  const [features, setFeatures] = useState([
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
    {
      id: 3,
      title: "Talk to an Expert",
      description: "Need guidance? Speak to our jewellery consultant.",
      enabled: false,
    },
  ]);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newFeatureDesc, setNewFeatureDesc] = useState("");
  const [newFeatureStatus, setNewFeatureStatus] = useState("enabled");

  const toggleFeature = (id: number) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
    );
  };

  const openAddModal = () => {
    setNewFeatureName("");
    setNewFeatureDesc("");
    setNewFeatureStatus("enabled");
    setShowAddModal(true);
  };

  const confirmAddFeature = () => {
    if (!newFeatureName.trim()) return;
    setFeatures((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: newFeatureName.trim(),
        description: newFeatureDesc.trim() || "No description provided.",
        enabled: newFeatureStatus === "enabled",
      },
    ]);
    setShowAddModal(false);
  };

  const removeFeature = (id: number) => {
    setFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setBannerImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* 1. OFFER BAR */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="font-bold text-foreground text-base">
              Offer Bar Management
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control the top announcement bar on your landing page
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-muted-foreground">
              Show on Landing Page
            </span>
            <Toggle
              enabled={showOfferBar}
              onToggle={() => setShowOfferBar(!showOfferBar)}
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-xs font-bold text-foreground mb-2">
            Offer Text
          </label>
          <input
            type="text"
            value={offerText}
            onChange={(e) => setOfferText(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary-dark transition-all"
          />
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={() =>
              setOfferText(
                "Free Shipping on Orders Over $50! Limited Time Offer",
              )
            }
            className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-all"
          >
            Reset
          </button>
          <button className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary-dark transition-all shadow-sm">
            Save Changes
          </button>
        </div>
      </div>

      {/* 2. HERO BANNER */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <h3 className="font-bold text-foreground text-base">
          Hero Banner Management
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 mb-5">
          Update your main landing page banner image and text
        </p>

        <div className="mb-5">
          <label className="block text-xs font-bold text-foreground mb-2">
            Banner Image
          </label>
          <label className="w-full border-2 border-dashed border-pink-300 rounded-xl bg-[#fdf0f4] flex flex-col items-center justify-center py-10 cursor-pointer hover:bg-pink-100 transition-all group">
            {bannerImage ? (
              <img
                src={bannerImage}
                alt="Banner"
                className="max-h-40 object-contain rounded-lg"
              />
            ) : (
              <>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:shadow-md transition-all">
                  <Upload size={22} className="text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground">
                  Click to upload banner image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended size: 1920×1080px (JPG, PNG)
                </p>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-foreground mb-2">
            Banner Heading
          </label>
          <input
            type="text"
            value={bannerHeading}
            onChange={(e) => setBannerHeading(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary-dark transition-all"
          />
        </div>

        <div className="mb-5">
          <label className="block text-xs font-bold text-foreground mb-2">
            Banner Text
          </label>
          <textarea
            rows={3}
            value={bannerText}
            onChange={(e) => setBannerText(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary-dark transition-all resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setBannerHeading("Created with love");
              setBannerText(
                "Made for you with passion and dedication. Each piece tells a unique story.",
              );
              setBannerImage(null);
            }}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-all"
          >
            Reset
          </button>
          <button className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary-dark transition-all shadow-sm">
            Save Changes
          </button>
        </div>
      </div>

      {/* 3. FEATURES MANAGEMENT */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex justify-between items-center mb-1">
          <div>
            <h3 className="font-bold text-foreground text-base">
              Features Management
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage the &apos;Why Buy Here&apos; section features
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary-dark transition-all shadow-sm"
          >
            <Plus size={14} /> Add New Feature
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex items-start justify-between gap-4 py-4 border-b border-border last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">
                  {feature.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => removeFeature(feature.id)}
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                  title="Remove feature"
                >
                  <Trash2 size={15} />
                </button>
                <Toggle
                  enabled={feature.enabled}
                  onToggle={() => toggleFeature(feature.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- ADD FEATURE MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          {/* Modal Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 z-10">
            <h2 className="text-xl font-bold text-foreground text-center mb-6">
              Add New Feature
            </h2>

            {/* Feature Name */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Feature Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                placeholder="Feature Name"
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl text-sm text-foreground placeholder:text-pink-300 focus:outline-none focus:border-primary-dark transition-all"
              />
            </div>

            {/* Feature Description */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Feature Description <span className="text-primary">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Feature Description"
                value={newFeatureDesc}
                onChange={(e) => setNewFeatureDesc(e.target.value)}
                className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl text-sm text-foreground placeholder:text-pink-300 focus:outline-none focus:border-primary-dark transition-all resize-none"
              />
            </div>

            {/* Status Dropdown */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Status
              </label>
              <div className="relative">
                <select
                  value={newFeatureStatus}
                  onChange={(e) => setNewFeatureStatus(e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl text-sm text-foreground focus:outline-none focus:border-primary-dark transition-all cursor-pointer"
                >
                  <option value="enabled">Enable</option>
                  <option value="disabled">Disable</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddFeature}
                disabled={!newFeatureName.trim()}
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary-dark transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Feature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- TOGGLE COMPONENT ---
function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${enabled ? "bg-primary" : "bg-gray-200"}`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-0"}`}
      />
    </div>
  );
}

// --- DASHBOARD VIEW ---
function DashboardView() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value="$45,280"
          trend="+12.5%"
          trendUp={true}
          icon={DollarSign}
          color="bg-orange-100 text-orange-600"
        />
        <StatCard
          title="Total Orders"
          value="1,245"
          trend="+8.2%"
          trendUp={true}
          icon={ShoppingCart}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Total Products"
          value="856"
          trend="+15.2%"
          trendUp={true}
          icon={Package}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Customers"
          value="8,426"
          trend="+6.7%"
          trendUp={true}
          icon={Users}
          color="bg-pink-100 text-pink-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-foreground">Revenue Overview</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-primary-dark">
                7 Days
              </button>
              <button className="px-3 py-1 text-xs font-medium bg-primary-dark text-white rounded-lg">
                30 Days
              </button>
              <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-primary-dark">
                90 Days
              </button>
            </div>
          </div>
          <div className="h-64 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
            <div className="text-center text-muted-foreground">
              <BarChart2 size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Revenue Chart Area</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="font-bold text-foreground mb-6">Sales by Category</h3>
          <div className="space-y-6">
            <CategoryProgress
              label="Jewelry"
              percent={45}
              color="bg-primary-dark"
            />
            <CategoryProgress
              label="Accessories"
              percent={30}
              color="bg-orange-400"
            />
            <CategoryProgress
              label="Home Decor"
              percent={15}
              color="bg-blue-400"
            />
            <CategoryProgress
              label="Art & Crafts"
              percent={10}
              color="bg-purple-400"
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border mb-8 overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-foreground">Recent Orders</h3>
          <button className="text-xs font-bold text-primary-dark hover:underline">
            View All &rarr;
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-muted text-muted-foreground font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {RECENT_ORDERS.map((order, idx) => (
                <tr key={idx} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${["bg-red-400", "bg-blue-400", "bg-green-400", "bg-purple-400", "bg-orange-400"][idx % 5]}`}
                    >
                      {order.customer.charAt(0)}
                    </div>
                    {order.customer}
                  </td>
                  <td className="px-6 py-4">{order.product}</td>
                  <td className="px-6 py-4 font-bold text-foreground">
                    {order.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Processing"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "Pending"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{order.date}</td>
                  <td className="px-6 py-4">
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-foreground">Top Products</h3>
            <button className="text-xs font-bold text-primary-dark hover:underline">
              View All &rarr;
            </button>
          </div>
          <div className="space-y-4">
            {TOP_PRODUCTS.map((product, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-3 hover:bg-muted rounded-xl transition-colors"
              >
                <div className={`w-12 h-12 rounded-lg ${product.color}`}></div>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {product.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-dark">{product.sales}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Sold
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="font-bold text-foreground mb-6">Recent Activity</h3>
          <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
            {RECENT_ACTIVITY.map((activity, idx) => (
              <div key={idx} className="relative pl-10">
                <div
                  className={`absolute left-0 top-0 w-8 h-8 rounded-full ${activity.bg} flex items-center justify-center z-10 border-2 border-white`}
                >
                  <activity.icon size={14} className={activity.color} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {activity.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// --- ALL PRODUCTS VIEW ---
function AllProductsView({ onAddProduct }: { onAddProduct: () => void }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sort, setSort] = useState("Newest First");
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const PAGE_SIZE = 10;

  const categories = [
    "All Categories",
    ...Array.from(new Set(ADMIN_PRODUCTS.map((p) => p.category))),
  ];
  const statuses = ["All Status", "Active", "Low Stock", "Out of Stock"];
  const sortOptions = [
    "Newest First",
    "Price: Low to High",
    "Price: High to Low",
    "Name A-Z",
  ];

  const filtered = ADMIN_PRODUCTS.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      categoryFilter === "All Categories" || p.category === categoryFilter;
    const matchStatus =
      statusFilter === "All Status" || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  }).sort((a, b) => {
    if (sort === "Price: Low to High") return a.price - b.price;
    if (sort === "Price: High to Low") return b.price - a.price;
    if (sort === "Name A-Z") return a.name.localeCompare(b.name);
    return 0;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalProducts = ADMIN_PRODUCTS.length;
  const activeProducts = ADMIN_PRODUCTS.filter(
    (p) => p.status === "Active",
  ).length;
  const lowStock = ADMIN_PRODUCTS.filter(
    (p) => p.status === "Low Stock",
  ).length;
  const outOfStock = ADMIN_PRODUCTS.filter(
    (p) => p.status === "Out of Stock",
  ).length;

  const statusBadge = (status: string) => {
    if (status === "Active")
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
          Active
        </span>
      );
    if (status === "Low Stock")
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
          Low Stock
        </span>
      );
    if (status === "Out of Stock")
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
          Out of Stock
        </span>
      );
    return null;
  };

  const categoryBadge = (cat: string) => {
    const colors: Record<string, string> = {
      Jewelry: "bg-purple-100 text-purple-700",
      Bags: "bg-blue-100 text-blue-700",
      Textiles: "bg-yellow-100 text-yellow-700",
      "Home Decor": "bg-green-100 text-green-700",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[cat] || "bg-gray-100 text-gray-600"}`}
      >
        {cat}
      </span>
    );
  };

  const pageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-foreground">ducts</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Complete product inventory and management
          </p>
        </div>
        <button
          onClick={onAddProduct}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm"
        >
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
            Total Products
          </p>
          <p className="text-4xl font-bold text-primary">{totalProducts}</p>
          <p className="text-xs text-green-500 font-bold mt-2 flex items-center gap-1">
            <TrendingUp size={12} /> +15.2% vs last month
          </p>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
            Active Products
          </p>
          <p className="text-4xl font-bold text-foreground">{activeProducts}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Available for sale
          </p>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
            Low Stock Items
          </p>
          <p className="text-4xl font-bold text-orange-500">{lowStock}</p>
          <p className="text-xs text-muted-foreground mt-2">Need restocking</p>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
            Out of Stock
          </p>
          <p className="text-4xl font-bold text-red-500">{outOfStock}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Requires attention
          </p>
        </div>
      </div>

      {/* Search / Filter / Sort Bar */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={15}
            />
            <input
              type="text"
              placeholder="Search products by name, ID, or SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all"
            />
          </div>
          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all cursor-pointer"
            >
              {sortOptions.map((s) => (
                <option key={s}>Sort: {s}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-muted-foreground font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Product ID</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-16 text-muted-foreground"
                  >
                    <Package size={36} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No products found</p>
                  </td>
                </tr>
              ) : (
                paginated.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-muted/30 transition-colors relative"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex-shrink-0 ${product.color}`}
                        />
                        <div>
                          <p className="font-semibold text-foreground text-sm leading-tight">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {product.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                      {product.id}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground">
                        {product.stock}
                      </p>
                      <p className="text-[10px] text-muted-foreground">units</p>
                    </td>
                    <td className="px-6 py-4">
                      {categoryBadge(product.category)}
                    </td>
                    <td className="px-6 py-4">{statusBadge(product.status)}</td>
                    <td className="px-6 py-4 relative">
                      <button
                        onClick={() =>
                          setOpenMenu(
                            openMenu === product.id ? null : product.id,
                          )
                        }
                        className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenu === product.id && (
                        <div className="absolute right-6 top-8 z-20 bg-white border border-border rounded-xl shadow-xl py-2 w-36 text-sm">
                          <button className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground">
                            Edit
                          </button>
                          <button className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground">
                            Duplicate
                          </button>
                          <button className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors text-red-500">
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
            <span className="font-bold text-foreground">{filtered.length}</span>{" "}
            products
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            {pageNumbers().map((p, i) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-2 text-muted-foreground text-sm"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(Number(p))}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? "bg-primary text-primary-foreground shadow-sm" : "border border-border text-muted-foreground hover:bg-muted"}`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- REVIEWS VIEW ---
const REVIEWS_DATA = [
  {
    id: 1,
    initials: "SM",
    bg: "bg-pink-500",
    name: "Sarah Miller",
    date: "February 18, 2026",
    rating: 5,
    product: "Rose Gold Bracelet",
    order: "Order #ORD-2024-143",
    title: "Absolutely Beautiful!",
    body: "This bracelet exceeded all my expectations! The craftsmanship is incredible, and you can tell it was made with love. The rose gold finish is stunning and catches the light beautifully. I've received so many compliments already!",
    helpful: 42,
    verified: true,
    status: "pending",
  },
  {
    id: 2,
    initials: "EB",
    bg: "bg-emerald-500",
    name: "Emily Brown",
    date: "February 17, 2026",
    rating: 5,
    product: "Pearl Necklace Set",
    order: "Order #ORD-2024-144",
    title: "Perfect Gift!",
    body: "I bought this as a gift for my best friend and she absolutely loves it! The packaging was beautiful and the quality is outstanding. Definitely worth every penny!",
    helpful: 16,
    verified: true,
    status: "pending",
  },
  {
    id: 3,
    initials: "JD",
    bg: "bg-violet-500",
    name: "Jessica Davis",
    date: "February 16, 2026",
    rating: 4,
    product: "Leather Tote Bag",
    order: "Order #ORD-2024-142",
    title: "Great Quality, Minor Issue",
    body: "The bag is beautifully made and the leather quality is excellent. However, it's slightly smaller than I expected from the photos. Still a great purchase overall!",
    helpful: 15,
    verified: true,
    status: "pending",
  },
  {
    id: 4,
    initials: "MK",
    bg: "bg-blue-500",
    name: "Michael Kim",
    date: "February 15, 2026",
    rating: 5,
    product: "Boho Beaded Bracelet Set",
    order: "Order #ORD-2024-140",
    title: "Love Everything About It!",
    body: "Ordered for my daughter and she hasn't taken it off since. It's lightweight, comfortable and the colors are exactly as shown. Superfast shipping too!",
    helpful: 28,
    verified: true,
    status: "approved",
  },
  {
    id: 5,
    initials: "RP",
    bg: "bg-orange-400",
    name: "Rachel Patel",
    date: "February 14, 2026",
    rating: 3,
    product: "Handwoven Macrame Wall Art",
    order: "Order #ORD-2024-138",
    title: "Decent But Expected More",
    body: "The art piece is nice but the strings were a bit loose on arrival. Customer service was responsive but I had to do some minor fixing myself. Price could be lower.",
    helpful: 7,
    verified: false,
    status: "pending",
  },
];

function ReviewsView() {
  const [reviews, setReviews] = useState(REVIEWS_DATA);
  const [statusFilter, setStatusFilter] = useState("All Reviews");
  const [ratingFilter, setRatingFilter] = useState("All Ratings");
  const [productFilter, setProductFilter] = useState("All Products");
  const [sort, setSort] = useState("Newest");
  const [replyOpen, setReplyOpen] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const products = [
    "All Products",
    ...Array.from(new Set(REVIEWS_DATA.map((r) => r.product))),
  ];

  const changeStatus = (id: number, status: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const filtered = reviews
    .filter((r) => {
      const matchStatus =
        statusFilter === "All Reviews" ||
        (statusFilter === "Pending" && r.status === "pending") ||
        (statusFilter === "Approved" && r.status === "approved") ||
        (statusFilter === "Rejected" && r.status === "rejected");
      const matchRating =
        ratingFilter === "All Ratings" || r.rating === parseInt(ratingFilter);
      const matchProduct =
        productFilter === "All Products" || r.product === productFilter;
      return matchStatus && matchRating && matchProduct;
    })
    .sort((a, b) => (sort === "Oldest" ? a.id - b.id : b.id - a.id));

  const totalReviews = reviews.length;
  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;
  const avgRating = (
    reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  ).toFixed(1);

  const Stars = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= rating ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  const statusPill = (s: string) => {
    if (s === "approved")
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
          Approved
        </span>
      );
    if (s === "rejected")
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
          Rejected
        </span>
      );
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">
        Pending
      </span>
    );
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Reviews Management
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage and moderate customer product reviews
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
            Total Reviews
          </p>
          <p className="text-4xl font-bold text-primary">1,284</p>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
            Pending Approval
          </p>
          <p className="text-4xl font-bold text-orange-500">{pendingCount}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
            Approved
          </p>
          <p className="text-4xl font-bold text-foreground">1,245</p>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
            Avg Rating
          </p>
          <p className="text-4xl font-bold text-foreground">{avgRating}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all cursor-pointer"
            >
              {["All Reviews", "Pending", "Approved", "Rejected"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
          <div className="relative">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all cursor-pointer"
            >
              {["All Ratings", "5", "4", "3", "2", "1"].map((s) => (
                <option key={s}>
                  {s === "All Ratings" ? s : `${s} Stars`}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
          <div className="relative flex-1 min-w-[160px]">
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all cursor-pointer"
            >
              {products.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all cursor-pointer"
            >
              {["Newest", "Oldest"].map((s) => (
                <option key={s}>Sort: {s}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Review Cards */}
      <div className="space-y-5">
        {filtered.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border shadow-sm py-16 flex flex-col items-center text-muted-foreground">
            <Star size={36} className="mb-3 opacity-20" />
            <p className="text-sm">No reviews match your filters</p>
          </div>
        ) : (
          filtered.map((review) => (
            <div
              key={review.id}
              className="bg-card rounded-2xl border border-border shadow-sm p-6"
            >
              {/* Top row */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${review.bg} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                  >
                    {review.initials}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">
                      {review.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {review.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Stars rating={review.rating} />
                  <span className="px-2 py-0.5 bg-yellow-400 text-white text-xs font-bold rounded-md">
                    {review.rating}.0
                  </span>
                  {statusPill(review.status)}
                </div>
              </div>

              {/* Product reference */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-muted/40 rounded-xl w-fit">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {review.product}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {review.order}
                  </p>
                </div>
              </div>

              {/* Review content */}
              <h4 className="font-bold text-foreground text-base mb-1">
                {review.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {review.body}
              </p>

              {/* Badges */}
              <div className="flex items-center gap-3 mb-5">
                {review.verified && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                    <CheckCircle2 size={13} /> Verified Purchase
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  👍 {review.helpful} found helpful
                </span>
              </div>

              {/* Reply box */}
              {replyOpen === review.id && (
                <div className="mb-4">
                  <textarea
                    rows={3}
                    placeholder="Write your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setReplyOpen(null);
                        setReplyText("");
                      }}
                      className="px-4 py-2 text-xs border border-border rounded-lg text-muted-foreground hover:bg-muted transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setReplyOpen(null);
                        setReplyText("");
                      }}
                      className="px-4 py-2 text-xs bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary-dark transition-all"
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => changeStatus(review.id, "approved")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${review.status === "approved" ? "bg-green-200 text-green-700 cursor-default" : "bg-green-500 text-white hover:bg-green-600"}`}
                >
                  {review.status === "approved" ? "✓ Approved" : "Approve"}
                </button>
                <button
                  onClick={() =>
                    setReplyOpen(replyOpen === review.id ? null : review.id)
                  }
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-primary text-primary hover:bg-pink-50 transition-all"
                >
                  Reply
                </button>
                <button
                  onClick={() => changeStatus(review.id, "rejected")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${review.status === "rejected" ? "bg-red-200 text-red-700 cursor-default" : "bg-red-500 text-white hover:bg-red-600"}`}
                >
                  {review.status === "rejected" ? "✗ Rejected" : "Reject"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- ORDERS VIEW ---
const ORDERS_DATA = [
  {
    id: "#ORD-2024-145",
    customer: "John Doe",
    email: "john@example.com",
    initials: "JD",
    bg: "bg-violet-500",
    date: "Feb 18, 2026",
    amount: "$129.99",
    status: "Delivered",
    tracking: "FDX-8945632",
  },
  {
    id: "#ORD-2024-144",
    customer: "Sarah Miller",
    email: "sarah@example.com",
    initials: "SM",
    bg: "bg-pink-500",
    date: "Feb 17, 2026",
    amount: "$89.99",
    status: "Shipped",
    tracking: "UPS-7532641",
  },
  {
    id: "#ORD-2024-143",
    customer: "Emily Brown",
    email: "emily@example.com",
    initials: "EB",
    bg: "bg-emerald-500",
    date: "Feb 16, 2026",
    amount: "$44.99",
    status: "Processing",
    tracking: "Pending",
  },
  {
    id: "#ORD-2024-142",
    customer: "Michael Wilson",
    email: "michael@example.com",
    initials: "MW",
    bg: "bg-primary",
    date: "Feb 15, 2026",
    amount: "$199.99",
    status: "Pending",
    tracking: "N/A",
  },
  {
    id: "#ORD-2024-141",
    customer: "Olivia Johnson",
    email: "olivia@example.com",
    initials: "OJ",
    bg: "bg-orange-400",
    date: "Feb 14, 2026",
    amount: "$64.99",
    status: "Delivered",
    tracking: "FDX-7823412",
  },
  {
    id: "#ORD-2024-140",
    customer: "David Chen",
    email: "david@example.com",
    initials: "DC",
    bg: "bg-blue-500",
    date: "Feb 13, 2026",
    amount: "$149.99",
    status: "Shipped",
    tracking: "DHL-5634219",
  },
  {
    id: "#ORD-2024-139",
    customer: "Priya Sharma",
    email: "priya@example.com",
    initials: "PS",
    bg: "bg-teal-500",
    date: "Feb 12, 2026",
    amount: "$79.99",
    status: "Cancelled",
    tracking: "N/A",
  },
  {
    id: "#ORD-2024-138",
    customer: "Rachel Patel",
    email: "rachel@example.com",
    initials: "RP",
    bg: "bg-amber-500",
    date: "Feb 11, 2026",
    amount: "$34.99",
    status: "Delivered",
    tracking: "UPS-4521936",
  },
];

function OrdersView() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("All Dates");
  const [sort, setSort] = useState("Newest");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const statuses = [
    "All Status",
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];
  const dateOptions = ["All Dates", "Today", "Last 7 Days", "Last 30 Days"];

  const filtered = ORDERS_DATA.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All Status" || o.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) =>
    sort === "Oldest" ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id),
  );

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Delivered: "bg-green-100 text-green-700",
      Shipped: "bg-blue-100 text-blue-700",
      Processing: "bg-orange-100 text-orange-700",
      Pending: "bg-purple-100 text-purple-700",
      Cancelled: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${map[status] || "bg-gray-100 text-gray-600"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Orders and Shipping Management
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
            Total Orders
          </p>
          <p className="text-3xl font-bold text-primary">1,245</p>
          <p className="text-xs text-green-500 font-bold mt-2 flex items-center gap-1">
            <TrendingUp size={11} /> +8.3% vs last month
          </p>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
            Pending
          </p>
          <p className="text-3xl font-bold text-orange-500">23</p>
          <p className="text-xs text-muted-foreground mt-2">Need attention</p>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
            Shipped
          </p>
          <p className="text-3xl font-bold text-blue-500">89</p>
          <p className="text-xs text-green-500 font-bold mt-2 flex items-center gap-1">
            <TrendingUp size={11} /> +12% this week
          </p>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
            Delivered
          </p>
          <p className="text-3xl font-bold text-foreground">1,125</p>
          <p className="text-xs text-muted-foreground mt-2">All time</p>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
            Returns
          </p>
          <p className="text-3xl font-bold text-red-500">8</p>
          <p className="text-xs text-red-400 font-bold mt-2 flex items-center gap-1">
            <TrendingUp size={11} className="rotate-180" /> -2.1% vs last month
          </p>
        </div>
      </div>

      {/* Search / Filter / Sort */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={15}
            />
            <input
              type="text"
              placeholder="Search by order ID, customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all cursor-pointer"
            >
              {dateOptions.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-all cursor-pointer"
            >
              {["Newest", "Oldest"].map((s) => (
                <option key={s}>Sort: {s}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-muted-foreground font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tracking</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-16 text-muted-foreground"
                  >
                    <ShoppingCart
                      size={36}
                      className="mx-auto mb-3 opacity-20"
                    />
                    <p className="text-sm">No orders found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-foreground font-mono text-xs">
                      {order.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${order.bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                        >
                          {order.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm leading-tight">
                            {order.customer}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {order.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {order.amount}
                    </td>
                    <td className="px-6 py-4">{statusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                      {order.tracking}
                    </td>
                    <td className="px-6 py-4 relative">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === order.id ? null : order.id)
                        }
                        className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenu === order.id && (
                        <div className="absolute right-6 top-8 z-20 bg-white border border-border rounded-xl shadow-xl py-2 w-40 text-sm">
                          <button className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground">
                            View Details
                          </button>
                          <button className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground">
                            Update Status
                          </button>
                          <button className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground">
                            Print Invoice
                          </button>
                          <button className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors text-red-500">
                            Cancel Order
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-bold text-foreground">{filtered.length}</span>{" "}
            of {ORDERS_DATA.length} orders
          </p>
          <button className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">
            Export CSV &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

// --- REPORTS & ANALYTICS VIEW ---
function ReportsAnalyticsView() {
  const [period, setPeriod] = useState("30d");
  const [reportPeriod, setReportPeriod] = useState("Last 7 Days");

  // ---- Simulated line chart data ----
  const lineData = [
    18, 22, 15, 28, 35, 20, 42, 38, 30, 45, 50, 40, 60, 55, 48, 65, 70, 62, 75,
    68, 72, 80, 78, 85, 90, 82, 95, 88, 100, 110,
  ];
  const maxLine = Math.max(...lineData);
  const linePoints = lineData
    .map((v, i) => {
      const x = (i / (lineData.length - 1)) * 470;
      const y = 160 - (v / maxLine) * 150;
      return `${x},${y}`;
    })
    .join(" ");
  const areaPoints = `0,160 ${lineData.map((v, i) => `${(i / (lineData.length - 1)) * 470},${160 - (v / maxLine) * 150}`).join(" ")} 470,160`;

  // ---- Simulated bar chart data (sales report) ----
  const barData = [
    4, 3, 5, 8, 12, 10, 15, 18, 22, 25, 20, 28, 30, 26, 32, 35, 28, 38, 40, 36,
    42, 45, 38, 48, 50, 44, 52, 55, 48, 60,
  ];
  const maxBar = Math.max(...barData);

  // ---- Sales by category bar chart ----
  const catBars = [
    { label: "Jewelry", value: 5200, color: "#e91e8c" },
    { label: "Bags", value: 4100, color: "#f4845f" },
    { label: "Accessories", value: 4800, color: "#8b5cf6" },
    { label: "Textiles", value: 2800, color: "#a0aec0" },
    { label: "Home Decor", value: 2400, color: "#818cf8" },
  ];
  const maxCat = Math.max(...catBars.map((c) => c.value));

  return (
    <div className="space-y-8 w-full">
      {/* ========== ANALYTICS SECTION ========== */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Real-time insights and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 shadow-sm">
            {["24h", "7d", "30d", "90d", "1y"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  period === p
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Revenue",
              value: "$45,280",
              trend: "+12.5% from last month",
              color: "text-primary",
            },
            {
              label: "Orders",
              value: "1,245",
              trend: "+8.3% from last month",
              color: "text-primary",
            },
            {
              label: "Conversion",
              value: "3.24%",
              trend: "+0.8% from last month",
              color: "text-primary",
            },
            {
              label: "Visitors",
              value: "38,426",
              trend: "+6.7% from last month",
              color: "text-primary",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-card rounded-2xl border border-border shadow-sm p-5"
            >
              <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
                {card.label}
              </p>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-green-500 font-bold mt-2">
                {card.trend}
              </p>
            </div>
          ))}
        </div>

        {/* Revenue Overview + Key Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Line Chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-6">
            <h3 className="font-bold text-foreground mb-4">Revenue Overview</h3>
            <div className="relative">
              <svg
                width="100%"
                viewBox="0 0 520 200"
                className="overflow-visible"
              >
                <defs>
                  <linearGradient id="lgAreaRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e91e8c" stopOpacity="0.35" />
                    <stop
                      offset="100%"
                      stopColor="#e91e8c"
                      stopOpacity="0.02"
                    />
                  </linearGradient>
                </defs>
                {/* Horizontal grid lines */}
                {[185, 143, 101, 59, 17].map((y, i) => (
                  <line
                    key={y}
                    x1="48"
                    y1={y}
                    x2="510"
                    y2={y}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                ))}
                {/* Y-axis labels */}
                {[
                  [185, "$0"],
                  [143, "$5k"],
                  [101, "$10k"],
                  [59, "$15k"],
                  [17, "$20k"],
                ].map(([y, lbl]) => (
                  <text
                    key={String(lbl)}
                    x="44"
                    y={Number(y) + 4}
                    fontSize="10"
                    fill="#9ca3af"
                    textAnchor="end"
                  >
                    {lbl}
                  </text>
                ))}
                {/* Area fill - wave shape */}
                <path
                  d="M50,155 C70,148 90,130 110,120 C130,110 145,100 160,88 C175,76 185,72 200,85 C215,98 225,110 245,118 C265,126 275,122 295,110 C315,98 325,90 345,100 C365,110 375,118 395,105 C415,92 425,85 445,88 C465,91 480,100 510,88 L510,185 L50,185 Z"
                  fill="url(#lgAreaRev)"
                />
                {/* Line */}
                <path
                  d="M50,155 C70,148 90,130 110,120 C130,110 145,100 160,88 C175,76 185,72 200,85 C215,98 225,110 245,118 C265,126 275,122 295,110 C315,98 325,90 345,100 C365,110 375,118 395,105 C415,92 425,85 445,88 C465,91 480,100 510,88"
                  fill="none"
                  stroke="#e91e8c"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* Dots at peaks/troughs */}
                {[
                  [50, 155],
                  [110, 120],
                  [160, 88],
                  [200, 85],
                  [245, 118],
                  [295, 110],
                  [345, 100],
                  [395, 105],
                  [445, 88],
                  [510, 88],
                ].map(([cx, cy], i) => (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="3.5"
                    fill="white"
                    stroke="#e91e8c"
                    strokeWidth="2"
                  />
                ))}
                {/* Today tooltip — white card with pink value */}
                <g transform="translate(415, 62)">
                  <rect
                    x="0"
                    y="0"
                    width="95"
                    height="26"
                    rx="8"
                    fill="white"
                    stroke="#f3f4f6"
                    strokeWidth="1"
                    filter="url(#shadow)"
                  />
                  <text
                    x="8"
                    y="17"
                    fontSize="10"
                    fill="#6b7280"
                    fontWeight="600"
                  >
                    Today:{" "}
                  </text>
                  <text
                    x="52"
                    y="17"
                    fontSize="10"
                    fill="#e91e8c"
                    fontWeight="800"
                  >
                    $18,000
                  </text>
                </g>
              </svg>
              <p className="text-[11px] text-muted-foreground text-center mt-1">
                Revenue Line Chart — Last 30 Days
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h3 className="font-bold text-foreground mb-4">Key Metrics</h3>
            <div className="space-y-3">
              {[
                { label: "Avg Order Value", value: "$36.36" },
                { label: "Customer Lifetime Value", value: "$428" },
                { label: "Return Rate", value: "2.4%" },
                { label: "Customer Satisfaction", value: "4.8/5" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="flex justify-between items-center px-4 py-3.5 bg-pink-50/60 rounded-xl"
                >
                  <p className="text-sm text-muted-foreground">{m.label}</p>
                  <p className="font-bold text-[#e91e8c] text-base">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic Sources + Top Locations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Traffic Sources */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h3 className="font-bold text-foreground mb-4">Traffic Sources</h3>
            <div className="flex items-center justify-around gap-4">
              {/* Proper SVG Pie Chart */}
              <svg
                viewBox="0 0 200 200"
                width="180"
                height="180"
                className="flex-shrink-0"
              >
                {/* Slice 1 - Organic Search 45% (162deg) pink/rose, 0deg -> 162deg */}
                <path
                  d="M100,100 L100,10 A90,90 0 0,1 185.4,127.3 Z"
                  fill="#e91e8c"
                />
                {/* Slice 2 - Direct 25% (90deg), 162deg -> 252deg */}
                <path
                  d="M100,100 L185.4,127.3 A90,90 0 0,1 72.1,190 Z"
                  fill="#f4845f"
                />
                {/* Slice 3 - Referral 20% (72deg), 252deg -> 324deg */}
                <path
                  d="M100,100 L72.1,190 A90,90 0 0,1 27.3,45.4 Z"
                  fill="#8b5cf6"
                />
                {/* Slice 4 - Social 10% (36deg), 324deg -> 360deg */}
                <path
                  d="M100,100 L27.3,45.4 A90,90 0 0,1 100,10 Z"
                  fill="#3b82f6"
                />
                {/* White separators */}
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="10"
                  stroke="white"
                  strokeWidth="2.5"
                />
                <line
                  x1="100"
                  y1="100"
                  x2="185.4"
                  y2="127.3"
                  stroke="white"
                  strokeWidth="2.5"
                />
                <line
                  x1="100"
                  y1="100"
                  x2="72.1"
                  y2="190"
                  stroke="white"
                  strokeWidth="2.5"
                />
                <line
                  x1="100"
                  y1="100"
                  x2="27.3"
                  y2="45.4"
                  stroke="white"
                  strokeWidth="2.5"
                />
                {/* Percentage labels inside slices */}
                <text
                  x="142"
                  y="80"
                  fontSize="12"
                  fontWeight="bold"
                  fill="white"
                  textAnchor="middle"
                >
                  25%
                </text>
                <text
                  x="150"
                  y="155"
                  fontSize="12"
                  fontWeight="bold"
                  fill="white"
                  textAnchor="middle"
                >
                  20%
                </text>
                <text
                  x="56"
                  y="138"
                  fontSize="12"
                  fontWeight="bold"
                  fill="white"
                  textAnchor="middle"
                >
                  20%
                </text>
                <text
                  x="63"
                  y="85"
                  fontSize="13"
                  fontWeight="bold"
                  fill="white"
                  textAnchor="middle"
                >
                  45%
                </text>
              </svg>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Organic Search", color: "bg-primary" },
                  { label: "Direct", color: "bg-orange-400" },
                  { label: "Referral", color: "bg-violet-500" },
                  { label: "Social", color: "bg-blue-500" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-sm flex-shrink-0 ${s.color}`}
                    />
                    <span className="text-muted-foreground">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-3">
              Traffic Pie Chart
            </p>
          </div>

          {/* Top Locations / World Map */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h3 className="font-bold text-foreground mb-4">Top Locations</h3>
            <div className="flex items-center justify-center h-52">
              <svg
                viewBox="0 80 1010 500"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="gAm" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#f4845f" />
                  </linearGradient>
                  <linearGradient id="gEu" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e91e8c" />
                    <stop offset="100%" stopColor="#c026d3" />
                  </linearGradient>
                  <linearGradient id="gAs" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                  <linearGradient id="gAu" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                {/* North America */}
                <path
                  d="M120,120 L160,105 L200,110 L230,130 L240,160 L225,195 L210,220 L190,250 L170,265 L150,270 L130,260 L110,240 L95,215 L85,185 L90,155 Z"
                  fill="url(#gAm)"
                  stroke="white"
                  strokeWidth="1.5"
                  opacity="0.9"
                />
                {/* South America */}
                <path
                  d="M170,285 L200,275 L225,285 L235,310 L230,345 L215,375 L195,400 L175,410 L158,400 L148,375 L150,345 L158,315 Z"
                  fill="url(#gAm)"
                  stroke="white"
                  strokeWidth="1.5"
                  opacity="0.85"
                />
                {/* Greenland */}
                <path
                  d="M200,90 L230,82 L255,88 L260,105 L245,118 L220,115 L205,105 Z"
                  fill="url(#gEu)"
                  stroke="white"
                  strokeWidth="1"
                  opacity="0.7"
                />
                {/* Europe */}
                <path
                  d="M420,115 L455,108 L480,115 L495,130 L490,150 L475,162 L460,168 L445,165 L432,155 L425,140 Z"
                  fill="url(#gEu)"
                  stroke="white"
                  strokeWidth="1.5"
                  opacity="0.9"
                />
                {/* Africa */}
                <path
                  d="M430,180 L465,172 L490,178 L500,200 L498,235 L490,270 L472,298 L450,315 L428,318 L410,305 L400,278 L398,245 L405,212 L415,192 Z"
                  fill="url(#gEu)"
                  stroke="white"
                  strokeWidth="1.5"
                  opacity="0.85"
                />
                {/* Middle East */}
                <path
                  d="M505,165 L535,158 L555,168 L558,190 L545,205 L522,210 L505,200 L498,182 Z"
                  fill="url(#gAs)"
                  stroke="white"
                  strokeWidth="1"
                  opacity="0.8"
                />
                {/* Russia / Central Asia */}
                <path
                  d="M510,100 L580,88 L660,85 L730,90 L780,100 L800,118 L790,135 L760,142 L720,138 L680,140 L640,145 L600,142 L560,138 L530,132 L515,118 Z"
                  fill="url(#gAs)"
                  stroke="white"
                  strokeWidth="1.5"
                  opacity="0.85"
                />
                {/* India */}
                <path
                  d="M590,185 L618,178 L635,192 L638,218 L628,240 L610,252 L592,248 L580,230 L578,208 Z"
                  fill="url(#gAs)"
                  stroke="white"
                  strokeWidth="1.5"
                  opacity="0.85"
                />
                {/* Southeast Asia */}
                <path
                  d="M680,180 L720,172 L750,180 L758,200 L748,220 L725,228 L700,225 L682,210 L678,192 Z"
                  fill="url(#gAs)"
                  stroke="white"
                  strokeWidth="1.5"
                  opacity="0.85"
                />
                {/* China/East Asia */}
                <path
                  d="M650,148 L700,140 L745,145 L768,160 L765,182 L748,195 L720,200 L688,195 L662,182 L648,165 Z"
                  fill="url(#gAs)"
                  stroke="white"
                  strokeWidth="1.5"
                  opacity="0.9"
                />
                {/* Japan */}
                <path
                  d="M780,145 L800,138 L812,148 L808,165 L793,172 L778,162 Z"
                  fill="url(#gAs)"
                  stroke="white"
                  strokeWidth="1"
                  opacity="0.8"
                />
                {/* Australia */}
                <path
                  d="M730,310 L785,298 L830,305 L855,325 L858,355 L842,380 L815,395 L782,395 L752,380 L730,355 L722,330 Z"
                  fill="url(#gAu)"
                  stroke="white"
                  strokeWidth="1.5"
                  opacity="0.9"
                />
                {/* New Zealand */}
                <path
                  d="M870,370 L885,362 L892,375 L882,390 L868,388 Z"
                  fill="url(#gAu)"
                  stroke="white"
                  strokeWidth="1"
                  opacity="0.8"
                />
              </svg>
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-1">
              Geographic Map
            </p>
          </div>
        </div>

        {/* Sales by Category Bar Chart */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 pb-6">
          <h3 className="font-bold text-foreground mb-4">Sales by Category</h3>
          <svg viewBox="0 0 620 210" width="100%" className="overflow-visible">
            <defs>
              {catBars.map((cat, i) => (
                <linearGradient
                  key={i}
                  id={`catG${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={cat.color} stopOpacity="1" />
                  <stop
                    offset="100%"
                    stopColor={cat.color}
                    stopOpacity="0.75"
                  />
                </linearGradient>
              ))}
            </defs>
            {/* Y-axis labels */}
            {[
              ["$6k", 10],
              ["$4k", 64],
              ["$2k", 118],
            ].map(([lbl, y]) => (
              <text
                key={String(lbl)}
                x="38"
                y={Number(y) + 5}
                fontSize="11"
                fill="#9ca3af"
                textAnchor="end"
              >
                {lbl}
              </text>
            ))}
            {/* Grid lines */}
            {[10, 64, 118].map((y) => (
              <line
                key={y}
                x1="44"
                y1={y}
                x2="616"
                y2={y}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            ))}
            {/* Bars — fixed 55px width, 32px gap, starts at x=60 */}
            {catBars.map((cat, i) => {
              const barH = (cat.value / maxCat) * 160;
              const x = 60 + i * (55 + 32);
              const y = 175 - barH;
              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width="55"
                  height={barH}
                  fill={`url(#catG${i})`}
                  rx="10"
                  ry="10"
                  className="transition-all hover:opacity-85"
                />
              );
            })}
            {/* Baseline */}
            <line
              x1="44"
              y1="175"
              x2="616"
              y2="175"
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          </svg>
          <p className="text-[11px] text-muted-foreground text-center mt-1">
            Category Bar Chart Comparison
          </p>
        </div>
      </div>

      {/* ===== SPACER between Analytics and Reports ===== */}
      <div className="pt-8" />

      {/* ========== REPORTS SECTION ========== */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Reports</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Generate and view detailed business reports
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none cursor-pointer"
              >
                {[
                  "Last 7 Days",
                  "Last 30 Days",
                  "Last 90 Days",
                  "This Year",
                ].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm">
              Export All
            </button>
          </div>
        </div>

        {/* Report Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Revenue",
              value: "$45,280",
              trend: "+12.5% vs last period",
              positive: true,
            },
            {
              label: "Total Orders",
              value: "1,245",
              trend: "+0.3% vs last period",
              positive: true,
            },
            {
              label: "Avg Order Value",
              value: "$36.36",
              trend: "+4.2% vs last period",
              positive: true,
            },
            {
              label: "New Customers",
              value: "342",
              trend: "+15.8% vs last period",
              positive: true,
            },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-card rounded-2xl border border-border shadow-sm p-5"
            >
              <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
                {c.label}
              </p>
              <p className="text-3xl font-bold text-primary">{c.value}</p>
              <p
                className={`text-xs mt-2 font-bold ${c.positive ? "text-green-500" : "text-red-400"}`}
              >
                {c.trend}
              </p>
            </div>
          ))}
        </div>

        {/* Sales Report Bar Chart */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-foreground">Sales Report</h3>
            <button className="px-3 py-1.5 border border-primary text-primary text-xs font-bold rounded-lg hover:bg-pink-50 transition-all">
              Download PDF
            </button>
          </div>
          <div className="flex items-end gap-1 h-40 mb-2">
            {barData.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm transition-all hover:opacity-80"
                style={{
                  height: `${(v / maxBar) * 148}px`,
                  backgroundColor:
                    i >= barData.length - 5
                      ? "#e91e8c"
                      : `rgba(233,30,140,${0.2 + (i / barData.length) * 0.5})`,
                }}
              />
            ))}
          </div>
          {/* Y axis labels */}
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            {["$1k", "$.2k", "$3k"].reverse().map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          {/* Today tooltip */}
          <div className="flex justify-end">
            <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded-lg font-bold">
              Today: $2,900
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            Sales Chart — Last 30 Days
          </p>
        </div>

        {/* Top Selling Products */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-foreground">Top Selling Products</h3>
            <button className="px-3 py-1.5 border border-primary text-primary text-xs font-bold rounded-lg hover:bg-pink-50 transition-all">
              Download CSV
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs font-bold text-muted-foreground">
                  Product Name
                </th>
                <th className="text-right py-2 text-xs font-bold text-muted-foreground">
                  Units Sold
                </th>
                <th className="text-right py-2 text-xs font-bold text-muted-foreground">
                  Revenue
                </th>
                <th className="text-right py-2 text-xs font-bold text-muted-foreground">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                {
                  name: "Rose Gold Bracelet",
                  units: 234,
                  revenue: "$21,056",
                  growth: "+18%",
                  pos: true,
                },
                {
                  name: "Pearl Necklace Set",
                  units: 189,
                  revenue: "$24,561",
                  growth: "+12%",
                  pos: true,
                },
                {
                  name: "Leather Tote Bag",
                  units: 156,
                  revenue: "$24,958",
                  growth: "+25%",
                  pos: true,
                },
                {
                  name: "Silver Chain Necklace",
                  units: 142,
                  revenue: "$15,618",
                  growth: "+8%",
                  pos: true,
                },
              ].map((r) => (
                <tr
                  key={r.name}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 text-foreground font-medium">{r.name}</td>
                  <td className="py-3 text-right text-muted-foreground">
                    {r.units}
                  </td>
                  <td className="py-3 text-right font-bold text-foreground">
                    {r.revenue}
                  </td>
                  <td
                    className={`py-3 text-right font-bold text-sm ${r.pos ? "text-green-500" : "text-red-400"}`}
                  >
                    {r.growth}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sales by Region */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-foreground">Sales by Region</h3>
            <button className="px-3 py-1.5 border border-primary text-primary text-xs font-bold rounded-lg hover:bg-pink-50 transition-all">
              Download PDF
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs font-bold text-muted-foreground">
                  Region
                </th>
                <th className="text-right py-2 text-xs font-bold text-muted-foreground">
                  Orders
                </th>
                <th className="text-right py-2 text-xs font-bold text-muted-foreground">
                  Revenue
                </th>
                <th className="text-right py-2 text-xs font-bold text-muted-foreground">
                  Share
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                {
                  region: "North America",
                  orders: 542,
                  revenue: "$19,723",
                  share: "43.6%",
                },
                {
                  region: "Europe",
                  orders: 398,
                  revenue: "$14,456",
                  share: "31.9%",
                },
                {
                  region: "Asia",
                  orders: 245,
                  revenue: "$8,891",
                  share: "19.6%",
                },
                {
                  region: "Other",
                  orders: 60,
                  revenue: "$2,210",
                  share: "4.9%",
                },
              ].map((r) => (
                <tr
                  key={r.region}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 text-foreground font-medium">
                    {r.region}
                  </td>
                  <td className="py-3 text-right text-muted-foreground">
                    {r.orders}
                  </td>
                  <td className="py-3 text-right font-bold text-foreground">
                    {r.revenue}
                  </td>
                  <td className="py-3 text-right text-muted-foreground">
                    {r.share}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Category Performance */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-foreground">Category Performance</h3>
            <button className="px-3 py-1.5 border border-primary text-primary text-xs font-bold rounded-lg hover:bg-pink-50 transition-all">
              Download CSV
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs font-bold text-muted-foreground">
                  Category
                </th>
                <th className="text-right py-2 text-xs font-bold text-muted-foreground">
                  Products
                </th>
                <th className="text-right py-2 text-xs font-bold text-muted-foreground">
                  Sales
                </th>
                <th className="text-right py-2 text-xs font-bold text-muted-foreground">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                {
                  cat: "Jewelry",
                  products: 342,
                  sales: 1245,
                  revenue: "$28,450",
                },
                { cat: "Bags", products: 156, sales: 487, revenue: "$12,230" },
                {
                  cat: "Textiles",
                  products: 98,
                  sales: 234,
                  revenue: "$6,760",
                },
                {
                  cat: "Home Decor",
                  products: 67,
                  sales: 156,
                  revenue: "$3,890",
                },
              ].map((r) => (
                <tr key={r.cat} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 text-foreground font-medium">{r.cat}</td>
                  <td className="py-3 text-right text-muted-foreground">
                    {r.products}
                  </td>
                  <td className="py-3 text-right text-muted-foreground">
                    {r.sales}
                  </td>
                  <td className="py-3 text-right font-bold text-foreground">
                    {r.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- CUSTOMERS VIEW ---
const CUSTOMERS_DATA = [
  {
    id: 1,
    initials: "JD",
    bg: "bg-violet-500",
    name: "John Doe",
    since: "Member since Dec 2024",
    email: "john@example.com",
    orders: 24,
    spent: "$2,450",
    type: "VIP",
  },
  {
    id: 2,
    initials: "SM",
    bg: "bg-pink-500",
    name: "Sarah Miller",
    since: "Member since Jan 2025",
    email: "sarah@example.com",
    orders: 15,
    spent: "$1,230",
    type: "Regular",
  },
  {
    id: 3,
    initials: "EB",
    bg: "bg-emerald-500",
    name: "Emily Brown",
    since: "Member since Feb 2026",
    email: "emily@example.com",
    orders: 2,
    spent: "$189",
    type: "New",
  },
  {
    id: 4,
    initials: "MK",
    bg: "bg-blue-500",
    name: "Michael Kim",
    since: "Member since Oct 2024",
    email: "michael@example.com",
    orders: 31,
    spent: "$3,820",
    type: "VIP",
  },
  {
    id: 5,
    initials: "OJ",
    bg: "bg-orange-400",
    name: "Olivia Johnson",
    since: "Member since Mar 2025",
    email: "olivia@example.com",
    orders: 9,
    spent: "$742",
    type: "Regular",
  },
  {
    id: 6,
    initials: "DC",
    bg: "bg-teal-500",
    name: "David Chen",
    since: "Member since Jan 2026",
    email: "david@example.com",
    orders: 1,
    spent: "$49",
    type: "New",
  },
];

function CustomersView() {
  const [activeTab2, setActiveTab2] = useState("All Customers");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [sort, setSort] = useState("Newest");
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const tabs = ["All Customers", "Returns", "Replacements", "Support Tickets"];

  const filtered = CUSTOMERS_DATA.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All Types" || c.type === typeFilter;
    return matchSearch && matchType;
  });

  const typeBadge = (type: string) => {
    const map: Record<string, string> = {
      VIP: "bg-yellow-100 text-yellow-700",
      Regular: "bg-blue-100 text-blue-700",
      New: "bg-pink-100 text-pink-600",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${map[type] || "bg-gray-100 text-gray-600"}`}
      >
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Customers Management
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and manage all customers, returns, and support requests
          </p>
        </div>
        <button className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm flex-shrink-0">
          Export Customers
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: "8,426", color: "text-primary" },
          { label: "Active Returns", value: "12", color: "text-primary" },
          { label: "Replacements", value: "8", color: "text-primary" },
          { label: "Support Tickets", value: "23", color: "text-primary" },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-card rounded-2xl border border-border shadow-sm p-5"
          >
            <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
              {c.label}
            </p>
            <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Tab bar + Search/Filter */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab2(tab)}
              className={`relative px-4 py-4 text-sm font-semibold transition-colors ${
                activeTab2 === tab
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab2 === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Search / Filter / Sort */}
        <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-border">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={15}
            />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none cursor-pointer"
            >
              {["All Types", "VIP", "Regular", "New"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none cursor-pointer"
            >
              {["Newest", "Oldest", "Most Orders", "Highest Spent"].map((s) => (
                <option key={s}>Sort: {s}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
        </div>

        {/* Table */}
        {activeTab2 === "All Customers" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-pink-50/50 text-muted-foreground font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Total Orders</th>
                  <th className="px-6 py-4">Total Spent</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-muted-foreground text-sm"
                    >
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full ${c.bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                          >
                            {c.initials}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm leading-tight">
                              {c.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {c.since}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">
                        {c.email}
                      </td>
                      <td className="px-6 py-4 text-foreground font-semibold">
                        {c.orders}
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">
                        {c.spent}
                      </td>
                      <td className="px-6 py-4">{typeBadge(c.type)}</td>
                      <td className="px-6 py-4 relative">
                        <button
                          onClick={() =>
                            setOpenMenu(openMenu === c.id ? null : c.id)
                          }
                          className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenu === c.id && (
                          <div className="absolute right-6 top-8 z-20 bg-white border border-border rounded-xl shadow-xl py-2 w-40 text-sm">
                            <button className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground">
                              View Profile
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground">
                              Send Email
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground">
                              View Orders
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors text-red-500">
                              Block Customer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="px-6 py-4 border-t border-border bg-muted/10 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-bold text-foreground">
                  {filtered.length}
                </span>{" "}
                of {CUSTOMERS_DATA.length} customers
              </p>
              <button className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">
                View All &rarr;
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users size={36} className="mb-3 opacity-20" />
            <p className="text-sm">{activeTab2} — No records found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SETTINGS VIEW ---

function SettingsView() {
  const [storeInfo, setStoreInfo] = useState({
    name: "Handmade Marketplace",
    email: "store@handmade.com",
    phone: "+1 (555) 123-4567",
    currency: "USD ($)",
    address: "123 Main Street, New York, NY 10001",
  });

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
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <h3 className="text-base font-bold text-foreground">
          Store Information
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 mb-6">
          Basic store details and contact information
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Store Name
            </label>
            <input
              value={storeInfo.name}
              onChange={(e) =>
                setStoreInfo({ ...storeInfo, name: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Store Email
            </label>
            <input
              value={storeInfo.email}
              onChange={(e) =>
                setStoreInfo({ ...storeInfo, email: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Contact Phone
            </label>
            <input
              value={storeInfo.phone}
              onChange={(e) =>
                setStoreInfo({ ...storeInfo, phone: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Currency
            </label>
            <input
              value={storeInfo.currency}
              onChange={(e) =>
                setStoreInfo({ ...storeInfo, currency: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-foreground">
              Store Address
            </label>
            <input
              value={storeInfo.address}
              onChange={(e) =>
                setStoreInfo({ ...storeInfo, address: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            onClick={() =>
              setStoreInfo({
                name: "Handmade Marketplace",
                email: "store@handmade.com",
                phone: "+1 (555) 123-4567",
                currency: "USD ($)",
                address: "123 Main Street, New York, NY 10001",
              })
            }
            className="w-full py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-all"
          >
            Reset
          </button>
          <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary-dark transition-all shadow-sm">
            Save Changes
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <h3 className="text-base font-bold text-foreground">
          Notification Preferences
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 mb-6">
          Manage email and push notifications
        </p>

        <div className="space-y-0 divide-y divide-border">
          {(
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
          ))}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Free Shipping Threshold
            </label>
            <input
              value={payment.freeShippingThreshold}
              onChange={(e) =>
                setPayment({
                  ...payment,
                  freeShippingThreshold: e.target.value,
                })
              }
              className="w-full px-4 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Standard Shipping Rate
            </label>
            <input
              value={payment.standardShippingRate}
              onChange={(e) =>
                setPayment({ ...payment, standardShippingRate: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
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
      </div>

      {/* Security Settings */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <h3 className="text-base font-bold text-foreground">
          Security Settings
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 mb-5">
          Manage password and account security
        </p>

        {/* Warning Banner */}
        <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-5">
          <span className="text-yellow-500 text-sm mt-0.5">⚠️</span>
          <p className="text-xs text-yellow-700 font-medium">
            For security reasons, password changes require email verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              className="w-full px-4 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full px-4 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
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
      </div>

      {/* Tax Configuration */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <h3 className="text-base font-bold text-foreground">
          Tax Configuration
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 mb-5">
          Set up tax rates and rules
        </p>

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
            <label className="text-xs font-semibold text-foreground">
              Default Tax Rate
            </label>
            <input
              defaultValue="8.5%"
              className="w-full px-4 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Tax ID Number
            </label>
            <input
              placeholder="Enter tax ID (optional)"
              className="w-full px-4 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
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
      </div>

      {/* Account Management */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <h3 className="text-base font-bold text-foreground">
          Account Management
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 mb-5">
          Manage your admin account
        </p>

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
            <label className="text-xs font-semibold text-foreground">
              Admin Email
            </label>
            <input
              defaultValue="admin@handmade.com"
              className="w-full px-4 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Account Status
            </label>
            <input
              defaultValue="Active"
              readOnly
              className="w-full px-4 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none cursor-default text-muted-foreground"
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
      </div>
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${active ? "bg-primary text-primary-foreground shadow-md shadow-pink-300" : "text-muted-foreground hover:bg-muted hover:text-primary-dark"}`}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}

function StatCard({ title, value, trend, trendUp, icon: Icon, color }: any) {
  return (
    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={20} />
        </div>
        <span
          className={`flex items-center text-xs font-bold ${trendUp ? "text-green-500" : "text-red-500"}`}
        >
          {trendUp ? (
            <TrendingUp size={14} className="mr-1" />
          ) : (
            <TrendingUp size={14} className="mr-1 rotate-180" />
          )}
          {trend}
        </span>
      </div>
      <h3 className="text-muted-foreground text-xs uppercase tracking-wider font-bold mb-1">
        {title}
      </h3>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">vs last month</p>
    </div>
  );
}

function CategoryProgress({ label, percent, color }: any) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold text-muted-foreground mb-2">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}
