"use client";

import { useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  PlusCircle,
  Star,
  BarChart2,
  Users,
  Settings,
  Search,
  Bell,
  LayoutTemplate,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

import { TOP_PRODUCTS, RECENT_ORDERS, RECENT_ACTIVITY } from "./_data/mockData";
import DashboardView from "./_components/DashboardView";
import AllProductsView from "./products/AllProductsView";
import OrdersView from "./orders/OrdersView";
import CustomersView from "./customers/CustomersView";
import ReportsAnalyticsView from "./_components/ReportsAnalyticsView";
import SettingsView from "./_components/SettingsView";
import LandingPageCMSView from "./_components/LandingPageCMSView";
import LandingPagePreviewModal from "./_components/LandingPagePreviewModal";
import ReviewsView from "./_components/ReviewsView";
import CustomerProfileView from "./customers/CustomerProfileView";
import AddProduct from "./products/AddProduct";
import OrderDetailView from "./orders/OrderDetailView";
import InquiriesView from "./customers/InquiriesView";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

function NavItem({ icon: Icon, label, active, onClick, collapsed }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full flex items-center gap-4 px-6 py-2.5 transition-all group ${
        active
          ? "text-[#E91E63] font-bold bg-white shadow-sm rounded-lg mx-2 w-[calc(100%-16px)]"
          : "text-gray-500 hover:text-gray-900 font-medium bg-transparent mx-2 w-[calc(100%-16px)]"
      }`}
      title={collapsed ? label : undefined}
    >
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.75 bg-[#E91E63] rounded-r-md -ml-2" />}
      <Icon size={18} className={active ? "text-[#E91E63]" : "group-hover:text-gray-900 transition-colors"} />
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLandingPreview, setShowLandingPreview] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Single state for selected item (order or customer)
  const [selectedItem, setSelectedItem] = useState<{
    type: "order" | "customer";
    id: string;
  } | null>(null);

  const navigationGroups = [
    { title: "MAIN", items: [{ label: "Dashboard", icon: LayoutDashboard }, { label: "CMS", icon: LayoutTemplate }] },
    { title: "PRODUCTS", items: [{ label: "All Products", icon: Package }, { label: "Add Product", icon: PlusCircle }, { label: "Reviews", icon: Star }, { label: "Orders", icon: ShoppingCart }] },
    { title: "ANALYTICS", items: [{ label: "Reports & Analytics", icon: BarChart2 }] },
    { title: "OTHER", items: [{ label: "Customers", icon: Users }, { label: "Settings", icon: Settings }] },
  ];

  const handleNavigate = (label: string) => {
    if (label === "Orders") {
      setSelectedItem(null);
      setActiveTab("Orders");
    } else if (label === "Customers") {
      setSelectedItem(null);
      setActiveTab("Customers");
    } else if (label === "CMS") {
      setActiveTab("Landing Page CMS");
    } else {
      setActiveTab(label);
    }
  };

  const handleViewOrder = (orderId: string) => {
    console.log("AdminDashboard: view order", orderId);
    setSelectedItem({ type: "order", id: orderId });
    setActiveTab("Order Details");
  };

  const handleViewCustomer = (customerId: string) => {
    console.log("AdminDashboard: view customer", customerId);
    setSelectedItem({ type: "customer", id: customerId });
    setActiveTab("Customer Profile");
  };

  const handleBack = () => {
    if (selectedItem?.type === "order") {
      setActiveTab("Orders");
    } else if (selectedItem?.type === "customer") {
      setActiveTab("Customers");
    }
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FEF8F9] font-sans text-gray-900">
      <aside className={`hidden md:flex ${isSidebarCollapsed ? "w-20" : "w-65"} bg-[#FEF8F9] flex-col h-screen sticky top-0 transition-all duration-300 z-50 shrink-0 border-r border-[#F3E8EC]`}>
        <div className="h-28 flex items-center justify-center px-6 shrink-0 relative">
          {!isSidebarCollapsed && <Image src="/logo.png" alt="Inventino" width={160} height={60} className="object-contain" priority />}
          {isSidebarCollapsed && <span className="text-2xl font-black italic tracking-tight uppercase text-[#E91E63]">I<span className="text-gray-300">.</span></span>}
          <button onClick={() => setSidebarCollapsed(!isSidebarCollapsed)} className="absolute -right-3.5 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-[#E91E63] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all hidden md:flex z-50">
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2 pb-8 space-y-7 scrollbar-hide">
          {navigationGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!isSidebarCollapsed && <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-8 mb-3">{group.title}</p>}
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <NavItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    active={
                      activeTab === item.label ||
                      (activeTab === "Landing Page CMS" && item.label === "CMS") ||
                      (activeTab === "Order Details" && item.label === "Orders") ||
                      (activeTab === "Customer Profile" && item.label === "Customers")
                    }
                    onClick={() => handleNavigate(item.label)}
                    collapsed={isSidebarCollapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Mobile Header Bar */}
        <div className="flex md:hidden items-center justify-between px-6 py-4 bg-white border-b border-[#F3E8EC] sticky top-0 z-40 shrink-0">
          <Image src="/logo.png" alt="Inventino" width={100} height={38} className="object-contain" priority />
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-500 hover:text-[#E91E63] hover:bg-pink-50 rounded-lg transition-all"
            aria-label="Toggle Menu"
          >
            <Menu size={24} />
          </button>
        </div>

        <header className="px-6 lg:px-10 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4">
          <div>
            {activeTab === "Dashboard" ? (
              <>
                <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Welcome back, Admin!</h1>
                <p className="text-[13px] text-gray-500 mt-1 font-medium tracking-wide">Here's what's happening with your store today.</p>
              </>
            ) : activeTab === "Landing Page CMS" ? (
              <>
                <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Landing Page CMS</h1>
                <p className="text-[13px] text-gray-500 mt-1 font-medium tracking-wide">Manage your landing page content with live preview</p>
              </>
            ) : (
              <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">{activeTab}</h1>
            )}
          </div>

          <div className="flex items-center gap-4">
            {activeTab === "Landing Page CMS" && (
              <button
                onClick={() => setShowLandingPreview(true)}
                className="px-4 py-2 border border-[#E91E63] text-[#E91E63] rounded-xl text-[13px] font-bold hover:bg-pink-50 transition-all shrink-0"
              >
                Preview Landing Page
              </button>
            )}

            <div className="relative hidden lg:block w-72 h-10">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search orders, products..."
                className="w-full h-full pl-10 pr-4 bg-white border border-transparent shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-full text-[12px] text-gray-600 focus:outline-none focus:border-gray-200 transition-all placeholder:text-gray-400 font-medium"
              />
            </div>

            <button className="relative w-10 h-10 flex items-center justify-center bg-white text-gray-500 hover:text-gray-900 rounded-full shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-colors cursor-pointer shrink-0">
              <Bell size={18} />
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#E91E63] text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white">5</span>
            </button>

            <div className="flex items-center gap-3 bg-white rounded-full p-1 pr-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#E91E63] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-sm">A</div>
              <div className="hidden sm:flex flex-col justify-center">
                <p className="text-[12px] font-bold text-gray-900 leading-none mb-1">Admin User</p>
                <p className="text-[10px] text-gray-400 leading-none font-medium">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {showLandingPreview && (
          <LandingPagePreviewModal onClose={() => setShowLandingPreview(false)} />
        )}

        <div className="flex-1 px-6 lg:px-10 pb-10">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-7xl mx-auto h-full">
            {activeTab === "Dashboard" && <DashboardView TOP_PRODUCTS={TOP_PRODUCTS} RECENT_ORDERS={RECENT_ORDERS} RECENT_ACTIVITY={RECENT_ACTIVITY} />}
            {activeTab === "Landing Page CMS" && <LandingPageCMSView />}
            {activeTab === "All Products" && <AllProductsView onAddProduct={() => setActiveTab("Add Product")} />}
            {activeTab === "Add Product" && <AddProduct />}
            {activeTab === "Reviews" && <ReviewsView />}
            {activeTab === "Orders" && <OrdersView onViewOrder={handleViewOrder} />}
            {activeTab === "Reports & Analytics" && <ReportsAnalyticsView />}
            {activeTab === "Customers" && <CustomersView onViewProfile={handleViewCustomer} onViewInquiries={() => setActiveTab("Customer Inquiries")} />}
            {activeTab === "Customer Inquiries" && <InquiriesView onBack={() => setActiveTab("Customers")} />}
            {activeTab === "Customer Profile" && selectedItem?.type === "customer" && (
              <CustomerProfileView 
                customerId={selectedItem.id} 
                onBack={handleBack} 
                onViewOrder={handleViewOrder}
              />
            )}
            {activeTab === "Order Details" && selectedItem?.type === "order" && (
              <OrderDetailView orderId={selectedItem.id} onBack={handleBack} />
            )}
            {activeTab === "Settings" && <SettingsView />}
          </div>
        </div>
      </main>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Drawer Content */}
        <div
          className={`absolute left-0 top-0 h-full w-[280px] bg-[#FEF8F9] border-r border-[#F3E8EC] flex flex-col p-6 shadow-2xl transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-[#F3E8EC]">
            <Image src="/logo.png" alt="Inventino" width={120} height={45} className="object-contain" priority />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 hover:bg-pink-50 text-gray-500 hover:text-[#E91E63] rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2 pb-8 space-y-7 scrollbar-hide">
            {navigationGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-3">{group.title}</p>
                <div className="space-y-1.5">
                  {group.items.map((item) => (
                    <NavItem
                      key={item.label}
                      icon={item.icon}
                      label={item.label}
                      active={
                        activeTab === item.label ||
                        (activeTab === "Landing Page CMS" && item.label === "CMS") ||
                        (activeTab === "Order Details" && item.label === "Orders") ||
                        (activeTab === "Customer Profile" && item.label === "Customers")
                      }
                      onClick={() => {
                        handleNavigate(item.label);
                        setIsMobileMenuOpen(false);
                      }}
                      collapsed={false}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#F3E8EC] mt-auto">
            <div className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-pink-50 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)]">
              <div className="w-9 h-9 rounded-full bg-[#E91E63] text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-sm">A</div>
              <div className="flex flex-col min-w-0">
                <p className="text-[13px] font-bold text-gray-900 leading-tight truncate">Admin User</p>
                <p className="text-[11px] text-gray-400 font-medium leading-none mt-0.5">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}