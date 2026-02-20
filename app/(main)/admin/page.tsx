"use client";

import { 
  LayoutDashboard, ShoppingCart, Package, PlusCircle, Layers, Star, 
  FileText, BarChart2, Users, Settings, Search, Bell, ChevronDown, 
  MoreVertical, TrendingUp, DollarSign, Box, CheckCircle2, X
} from "lucide-react";
import { useState } from "react";
import AddProduct from "./AddProduct"; 

// ---- MOCK DATA ----
const RECENT_ORDERS = [
  { id: "#ORD-2024-001", customer: "Sarah Miller", product: "Rose Gold Bracelet", amount: "$89.99", status: "Completed", date: "Feb 6, 2026" },
  { id: "#ORD-2024-002", customer: "John Davis", product: "Pearl Necklace Set", amount: "$129.99", status: "Processing", date: "Feb 6, 2026" },
  { id: "#ORD-2024-003", customer: "Emily Brown", product: "Boho Beaded Set", amount: "$44.99", status: "Pending", date: "Feb 5, 2026" },
  { id: "#ORD-2024-004", customer: "Michael Wilson", product: "Crochet Pouch", amount: "$39.99", status: "Completed", date: "Feb 5, 2026" },
  { id: "#ORD-2024-005", customer: "Olivia Johnson", product: "Classic Earrings", amount: "$54.99", status: "Cancelled", date: "Feb 4, 2026" },
]; 

const TOP_PRODUCTS = [
  { name: "Rose Gold Bracelet", category: "Jewelry", sales: 245, color: "bg-orange-200" },
  { name: "Pearl Necklace", category: "Jewelry", sales: 198, color: "bg-gray-200" },
  { name: "Boho Beaded Set", category: "Accessories", sales: 156, color: "bg-green-200" },
  { name: "Crochet Pouch", category: "Accessories", sales: 142, color: "bg-yellow-200" },
]; 

const RECENT_ACTIVITY = [
  { text: "New order received", time: "2 minutes ago", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-100" },
  { text: "Order #1234 shipped", time: "15 minutes ago", icon: Box, color: "text-blue-500", bg: "bg-blue-100" },
  { text: "New 5-star review", time: "1 hour ago", icon: Star, color: "text-yellow-500", bg: "bg-yellow-100" },
  { text: "New product added", time: "3 hours ago", icon: PlusCircle, color: "text-primary", bg: "bg-pink-100" },
]; 

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard"); 

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-card border-r border-border fixed left-0 top-16 h-[calc(100vh-4rem)] z-30 flex flex-col font-sans shadow-sm">
        <div className="p-6 flex-shrink-0">
          <h1 className="text-3xl font-serif text-primary-dark">Inventino</h1>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">A la mode handcrafted</p>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto pb-10 custom-scrollbar">
          <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 mt-2">Main</p>
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
          <NavItem icon={ShoppingCart} label="Orders" active={activeTab === "Orders"} onClick={() => setActiveTab("Orders")} />

          <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 mt-6">Products</p>
          <NavItem icon={Package} label="All Products" active={activeTab === "All Products"} onClick={() => setActiveTab("All Products")} />
          <NavItem icon={PlusCircle} label="Add Product" active={activeTab === "Add Product"} onClick={() => setActiveTab("Add Product")} />
          <NavItem icon={Layers} label="Categories" active={activeTab === "Categories"} onClick={() => setActiveTab("Categories")} />
          <NavItem icon={Star} label="Reviews" active={activeTab === "Reviews"} onClick={() => setActiveTab("Reviews")} />

          <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 mt-6">Analytics</p>
          <NavItem icon={FileText} label="Reports" active={activeTab === "Reports"} onClick={() => setActiveTab("Reports")} />
          <NavItem icon={BarChart2} label="Analytics" active={activeTab === "Analytics"} onClick={() => setActiveTab("Analytics")} />
          
          <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 mt-6">Other</p>
          <NavItem icon={Users} label="Customers" active={activeTab === "Customers"} onClick={() => setActiveTab("Customers")} />
          <NavItem icon={Settings} label="Settings" active={activeTab === "Settings"} onClick={() => setActiveTab("Settings")} />
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 ml-64 p-8 bg-background"> 
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {activeTab === "Dashboard" ? "Welcome back, Admin! 👋" : activeTab}
            </h2>
            <p className="text-sm text-muted-foreground">
              {activeTab === "Dashboard" ? "Here's what's happening with your store today." : "Manage your store efficiently."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input type="text" placeholder="Search orders, products..." className="pl-10 pr-4 py-2 bg-card border border-border rounded-full text-sm focus:outline-none focus:border-primary-dark w-64 shadow-sm" />
            </div>
            <button className="p-2 bg-card border border-border rounded-full text-muted-foreground hover:text-primary-dark shadow-sm relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="w-9 h-9 bg-primary-dark rounded-full flex items-center justify-center text-white font-bold">A</div>
              <div className="text-sm">
                <p className="font-bold text-foreground leading-none">Admin User</p>
                <p className="text-muted-foreground text-xs">Administrator</p>
              </div>
              <ChevronDown size={14} className="text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* --- CONDITIONAL RENDER --- */}
        {activeTab === "Dashboard" && <DashboardView />}
        {activeTab === "Add Product" && <AddProduct />}

        {["Orders", "All Products", "Categories", "Reviews", "Reports", "Analytics", "Customers", "Settings"].includes(activeTab) && activeTab !== "Add Product" && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card rounded-2xl border border-border shadow-sm">
             <Package size={48} className="mb-4 opacity-20" />
             <p className="text-lg font-medium">{activeTab} Page Coming Soon</p>
          </div>
        )}
      </main>
    </div>
  );
}

// --- DASHBOARD VIEW WITH RECENT ORDERS ---
function DashboardView() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Revenue" value="$45,280" trend="+12.5%" trendUp={true} icon={DollarSign} color="bg-orange-100 text-orange-600" />
        <StatCard title="Total Orders" value="1,245" trend="+8.2%" trendUp={true} icon={ShoppingCart} color="bg-blue-100 text-blue-600" />
        <StatCard title="Total Products" value="856" trend="+15.2%" trendUp={true} icon={Package} color="bg-purple-100 text-purple-600" />
        <StatCard title="Customers" value="8,426" trend="+6.7%" trendUp={true} icon={Users} color="bg-pink-100 text-pink-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-foreground">Revenue Overview</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-primary-dark">7 Days</button>
              <button className="px-3 py-1 text-xs font-medium bg-primary-dark text-white rounded-lg">30 Days</button>
              <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-primary-dark">90 Days</button>
            </div>
          </div>
          <div className="h-64 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
            <div className="text-center text-muted-foreground">
              <BarChart2 size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Revenue Chart Area (Integration with Recharts/Chart.js)</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="font-bold text-foreground mb-6">Sales by Category</h3>
          <div className="space-y-6">
            <CategoryProgress label="Jewelry" percent={45} color="bg-primary-dark" />
            <CategoryProgress label="Accessories" percent={30} color="bg-orange-400" />
            <CategoryProgress label="Home Decor" percent={15} color="bg-blue-400" />
            <CategoryProgress label="Art & Crafts" percent={10} color="bg-purple-400" />
          </div>
        </div>
      </div>

      {/* --- RECENT ORDERS TABLE --- */}
      <div className="bg-card rounded-2xl shadow-sm border border-border mb-8 overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-foreground">Recent Orders</h3>
          <button className="text-xs font-bold text-primary-dark hover:underline">View All &rarr;</button>
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
                  <td className="px-6 py-4 font-bold text-foreground">{order.id}</td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${['bg-red-400','bg-blue-400','bg-green-400','bg-purple-400','bg-orange-400'][idx % 5]}`}>
                      {order.customer.charAt(0)}
                    </div>
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{order.product}</td>
                  <td className="px-6 py-4 font-bold text-foreground">{order.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                  <td className="px-6 py-4">
                    <button className="text-muted-foreground hover:text-foreground"><MoreVertical size={16} /></button>
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
            <button className="text-xs font-bold text-primary-dark hover:underline">View All &rarr;</button>
          </div>
          <div className="space-y-4">
             {TOP_PRODUCTS.map((product, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 hover:bg-muted rounded-xl transition-colors">
                  <div className={`w-12 h-12 rounded-lg ${product.color}`}></div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-dark">{product.sales}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Sold</p>
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
                <div className={`absolute left-0 top-0 w-8 h-8 rounded-full ${activity.bg} flex items-center justify-center z-10 border-2 border-white`}>
                  <activity.icon size={14} className={activity.color} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{activity.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// --- SHARED COMPONENTS ---
function NavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${active ? "bg-primary text-primary-foreground shadow-md shadow-pink-200" : "text-muted-foreground hover:bg-muted hover:text-primary-dark"}`}>
      <Icon size={18} />
      {label}
    </button>
  );
}

function StatCard({ title, value, trend, trendUp, icon: Icon, color }: any) {
  return (
    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color}`}><Icon size={20} /></div>
        <span className={`flex items-center text-xs font-bold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
          {trendUp ? <TrendingUp size={14} className="mr-1" /> : <TrendingUp size={14} className="mr-1 rotate-180" />}
          {trend}
        </span>
      </div>
      <h3 className="text-muted-foreground text-xs uppercase tracking-wider font-bold mb-1">{title}</h3>
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
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}