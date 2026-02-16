"use client";

import React, { useState } from "react";
import {
    MapPin, Plus, Trash2, Edit2,
    ArrowLeft, CheckCircle2, Home,
    Briefcase, Globe
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";

interface SavedAddress {
    id: string;
    type: string;
    firstName: string;
    lastName: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
}

export default function AddressesPage() {
    const [showForm, setShowForm] = useState(false);
    const [addresses, setAddresses] = useState<SavedAddress[]>([
        {
            id: "1",
            type: "Home",
            firstName: "John",
            lastName: "Doe",
            streetAddress: "123 Main Street",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "United States",
            isDefault: true,
        }
    ]);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        streetAddress: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
        type: "Home"
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, country: value }));
    };

    const handleAddAddress = (e: React.FormEvent) => {
        e.preventDefault();
        const newAddress: SavedAddress = {
            id: Date.now().toString(),
            type: formData.type,
            firstName: formData.firstName,
            lastName: formData.lastName,
            streetAddress: formData.streetAddress,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
            isDefault: addresses.length === 0,
        };
        setAddresses([...addresses, newAddress]);
        setShowForm(false);
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            streetAddress: "",
            city: "",
            state: "",
            zipCode: "",
            country: "United States",
            type: "Home"
        });
    };

    const deleteAddress = (id: string) => {
        setAddresses(addresses.filter(addr => addr.id !== id));
    };

    return (
        <div className="bg-[#fdf8f9] min-h-screen pt-4 md:pt-8 pb-20 font-sans">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/profile" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-600 shadow-sm border border-pink-50 hover:bg-pink-50 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-serif font-bold text-[#D94F7A]">Saved Addresses</h1>
                </div>

                {!showForm ? (
                    <div className="space-y-4">
                        {/* Add New Address Trigger */}
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full p-6 border-2 border-dashed border-pink-200 rounded-[2rem] bg-pink-50/30 flex flex-col items-center justify-center gap-3 text-pink-600 hover:bg-pink-50 transition-colors group"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Plus size={24} />
                            </div>
                            <p className="font-bold">Add New Address</p>
                        </button>

                        {/* Address List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map((address) => (
                                <div key={address.id} className="bg-white p-6 rounded-[2rem] border border-pink-50 shadow-sm relative group">
                                    {address.isDefault && (
                                        <div className="absolute top-4 right-4 flex items-center gap-1 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
                                            <CheckCircle2 size={12} /> Default
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-[#D94F7A]">
                                            {address.type === "Home" ? <Home size={18} /> :
                                                address.type === "Work" ? <Briefcase size={18} /> :
                                                    <Globe size={18} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{address.type}</p>
                                            <p className="text-sm text-gray-500 font-medium">{address.firstName} {address.lastName}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1 mb-6">
                                        <p className="text-sm text-gray-600">{address.streetAddress}</p>
                                        <p className="text-sm text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                                        <p className="text-sm text-gray-600 font-medium">{address.country}</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button className="flex-1 py-2 px-4 rounded-xl bg-gray-50 text-gray-600 text-sm font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                                            <Edit2 size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => deleteAddress(address.id)}
                                            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-pink-50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <MapPin className="text-pink-600" /> Add New Address
                        </h2>

                        <form onSubmit={handleAddAddress} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="firstName" className="text-sm text-gray-700 mb-1.5 block">
                                        First Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="firstName"
                                        placeholder="Enter First Name"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="bg-pink-50/50 border-pink-100 rounded-xl h-12"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="lastName" className="text-sm text-gray-700 mb-1.5 block">
                                        Last Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Enter Last Name"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="bg-pink-50/50 border-pink-100 rounded-xl h-12"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email" className="text-sm text-gray-700 mb-1.5 block">
                                        Email Address <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@email.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="bg-pink-50/50 border-pink-100 rounded-xl h-12"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="phone" className="text-sm text-gray-700 mb-1.5 block">
                                        Phone Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+91 12345 67890"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="bg-pink-50/50 border-pink-100 rounded-xl h-12"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="streetAddress" className="text-sm text-gray-700 mb-1.5 block">
                                        Street Address <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="streetAddress"
                                        placeholder="123 Main Street, Appt 4B"
                                        value={formData.streetAddress}
                                        onChange={handleInputChange}
                                        className="bg-pink-50/50 border-pink-100 rounded-xl h-12"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="city" className="text-sm text-gray-700 mb-1.5 block">
                                        City <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="city"
                                        placeholder="Mumbai"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="bg-pink-50/50 border-pink-100 rounded-xl h-12"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="state" className="text-sm text-gray-700 mb-1.5 block">
                                        State <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="state"
                                        placeholder="Maharashtra"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="bg-pink-50/50 border-pink-100 rounded-xl h-12"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="zipCode" className="text-sm text-gray-700 mb-1.5 block">
                                        ZIP Code <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="zipCode"
                                        placeholder="400001"
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        className="bg-pink-50/50 border-pink-100 rounded-xl h-12"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="country" className="text-sm text-gray-700 mb-1.5 block">
                                        Country <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={formData.country} onValueChange={handleSelectChange}>
                                        <SelectTrigger className="bg-pink-50/50 border-pink-100 rounded-xl h-12">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="India">India</SelectItem>
                                            <SelectItem value="United States">United States</SelectItem>
                                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                            <SelectItem value="Canada">Canada</SelectItem>
                                            <SelectItem value="Australia">Australia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 border-pink-200 text-pink-600 hover:bg-pink-50 h-14 rounded-2xl font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-[#D94F7A] hover:bg-[#C0426A] text-white h-14 rounded-2xl font-bold shadow-lg shadow-pink-200"
                                >
                                    Save Address
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
