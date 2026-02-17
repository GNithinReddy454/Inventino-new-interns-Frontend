"use client";

import React, { useState } from "react";
import {
    Settings, User, Bell, Shield,
    ChevronRight, ArrowLeft, Camera,
    Mail, Phone, Lock, Eye, EyeOff,
    Globe, Laptop, Sun, Moon, Palette
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { useAuth } from "@/app/(main)/components/authContext";

type TabId = 'account' | 'notifications' | 'security' | 'appearance';

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabId>('account');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const tabs = [
        { id: 'account' as TabId, label: 'Account Settings', icon: User },
        { id: 'notifications' as TabId, label: 'Notifications', icon: Bell },
        { id: 'security' as TabId, label: 'Password & Security', icon: Shield },
        { id: 'appearance' as TabId, label: 'Appearance', icon: Palette },
    ];

    return (
        <div className="bg-[#fdf8f9] min-h-screen pt-4 md:pt-8 pb-20 font-sans">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/profile" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-600 shadow-sm border border-pink-50 hover:bg-pink-50 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-serif font-bold text-[#D94F7A]">Settings</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1 space-y-2">
                        {tabs.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id
                                        ? 'bg-[#D94F7A] text-white shadow-md shadow-pink-100'
                                        : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Account Settings */}
                        {activeTab === 'account' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 bg-white rounded-[2.5rem] p-6 md:p-8 border border-pink-50 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <User size={20} className="text-pink-600" /> Account Settings
                                </h2>

                                <div className="flex flex-col items-center mb-8">
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-pink-50 rounded-[2rem] flex items-center justify-center text-[#D94F7A] border-4 border-white shadow-sm overflow-hidden">
                                            <User size={48} />
                                        </div>
                                        <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#D94F7A] text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:scale-110 transition-transform">
                                            <Camera size={14} />
                                        </button>
                                    </div>
                                    <p className="mt-3 text-sm font-bold text-gray-900">{user?.name || "Sahil Tiwari"}</p>
                                    <p className="text-xs text-gray-500 font-medium">{user?.email || "sahiltiwari708@gmail.com"}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-gray-500 ml-1">Full Name</Label>
                                        <div className="relative">
                                            <Input placeholder="Sahil Tiwari" className="bg-pink-50/30 border-pink-100 rounded-xl h-12 pl-10 focus-visible:ring-pink-200" />
                                            <User className="absolute left-3.5 top-3.5 text-pink-400" size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-gray-500 ml-1">Email Address</Label>
                                        <div className="relative">
                                            <Input placeholder="sahiltiwari708@gmail.com" className="bg-pink-50/30 border-pink-100 rounded-xl h-12 pl-10" disabled />
                                            <Mail className="absolute left-3.5 top-3.5 text-pink-300" size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-gray-500 ml-1">Phone Number</Label>
                                        <div className="relative">
                                            <Input placeholder="+91 12345 67890" className="bg-pink-50/30 border-pink-100 rounded-xl h-12 pl-10 focus-visible:ring-pink-200" />
                                            <Phone className="absolute left-3.5 top-3.5 text-pink-400" size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-gray-500 ml-1">Location</Label>
                                        <div className="relative">
                                            <Input placeholder="Mumbai, India" className="bg-pink-50/30 border-pink-100 rounded-xl h-12 pl-10 focus-visible:ring-pink-200" />
                                            <Globe className="absolute left-3.5 top-3.5 text-pink-400" size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-pink-50 flex justify-end">
                                    <Button className="bg-[#D94F7A] hover:bg-[#C0426A] text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-pink-100 transition-all">
                                        Update Account
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* 2. Notifications */}
                        {activeTab === 'notifications' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 bg-white rounded-[2.5rem] p-6 md:p-8 border border-pink-50 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Bell size={20} className="text-pink-600" /> Notifications
                                </h2>

                                <div className="space-y-4">
                                    {[
                                        { title: "Order Updates", desc: "Get notified about your order status and delivery", enabled: true },
                                        { title: "Promotions & Offers", desc: "Receive updates about sales, discounts and new arrivals", enabled: false },
                                        { title: "Newsletter", desc: "Weekly roundup of jewelry trends and styling tips", enabled: true },
                                        { title: "Stock Alerts", desc: "Notify when items in your wishlist are back in stock", enabled: false },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-pink-50/30 rounded-2xl border border-pink-50">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{item.title}</p>
                                                <p className="text-xs text-gray-500">{item.desc}</p>
                                            </div>
                                            <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${item.enabled ? 'bg-pink-500' : 'bg-gray-200'}`}>
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${item.enabled ? 'right-1' : 'left-1'}`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Password & Security */}
                        {activeTab === 'security' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 bg-white rounded-[2.5rem] p-6 md:p-8 border border-pink-50 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Shield size={20} className="text-pink-600" /> Password & Security
                                </h2>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-gray-500 ml-1">Current Password</Label>
                                            <div className="relative">
                                                <Input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    className="bg-pink-50/30 border-pink-100 rounded-xl h-12 pl-10 pr-10 focus-visible:ring-pink-200"
                                                />
                                                <Lock className="absolute left-3.5 top-3.5 text-pink-400" size={16} />
                                                <button onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-pink-500">
                                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-gray-500 ml-1">New Password</Label>
                                            <div className="relative">
                                                <Input
                                                    type={showNewPassword ? "text" : "password"}
                                                    className="bg-pink-50/30 border-pink-100 rounded-xl h-12 pl-10 pr-10 focus-visible:ring-pink-200"
                                                />
                                                <Lock className="absolute left-3.5 top-3.5 text-pink-400" size={16} />
                                                <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-pink-500">
                                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button className="w-full bg-[#D94F7A] hover:bg-[#C0426A] text-white h-12 rounded-xl font-bold shadow-lg shadow-pink-100 transition-all flex items-center justify-center gap-2">
                                            Change Password
                                        </Button>
                                    </div>

                                    <div className="pt-6 border-t border-pink-50">
                                        <p className="text-sm font-bold text-gray-900 mb-4">Device Security</p>
                                        <div className="flex items-center justify-between p-4 bg-emerald-50/30 rounded-2xl border border-emerald-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-50">
                                                    <Laptop size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">Current Session</p>
                                                    <p className="text-xs text-gray-500">Windows • Mumbai, India</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full uppercase tracking-wider">Active Now</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. Appearance */}
                        {activeTab === 'appearance' && (activeTab === 'appearance' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 bg-white rounded-[2.5rem] p-6 md:p-8 border border-pink-50 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Palette size={20} className="text-pink-600" /> Appearance
                                </h2>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <p className="text-sm font-bold text-gray-600 ml-1">Theme Mode</p>
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { id: 'light', label: 'Light', icon: Sun },
                                                { id: 'dark', label: 'Dark', icon: Moon },
                                                { id: 'system', label: 'System', icon: Laptop },
                                            ].map((theme) => (
                                                <button key={theme.id} className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${theme.id === 'light' ? 'border-pink-200 bg-pink-50/30 text-pink-600' : 'border-gray-100 bg-white text-gray-400 hover:border-pink-100'}`}>
                                                    <theme.icon size={24} />
                                                    <span className="text-xs font-bold">{theme.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-pink-50">
                                        <p className="text-sm font-bold text-gray-600 ml-1">Interface Color</p>
                                        <div className="flex gap-4">
                                            {['#D94F7A', '#4F46E5', '#059669', '#D97706'].map((color) => (
                                                <button key={color} className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${color === '#D94F7A' ? 'border-white ring-2 ring-pink-500' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-pink-50/30 rounded-2xl border border-pink-50 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Reduced Motion</p>
                                            <p className="text-xs text-gray-500">Minimize animations throughout the site</p>
                                        </div>
                                        <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </div>
        </div>
    );
}
