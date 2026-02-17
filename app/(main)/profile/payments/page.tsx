"use client";

import React, { useState } from "react";
import {
    CreditCard, Plus, Trash2, ShieldCheck,
    ArrowLeft, Lock, MoreVertical,
    Wallet, Landmark
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

export default function PaymentManagementPage() {
    const [cards, setCards] = useState([
        { id: 1, type: "Visa", number: "**** **** **** 4242", expiry: "12/28", holder: "Sahil Tiwari", color: "bg-gradient-to-br from-gray-800 to-gray-900", isDefault: true },
        { id: 2, type: "Mastercard", number: "**** **** **** 8856", expiry: "05/27", holder: "Sahil Tiwari", color: "bg-gradient-to-br from-indigo-700 to-indigo-900", isDefault: false },
    ]);

    const [isAddingCard, setIsAddingCard] = useState(false);
    const [formData, setFormData] = useState({
        number: "",
        expiry: "",
        holder: "",
        cvv: "",
        type: "Visa"
    });

    const [upis, setUpis] = useState([
        { id: 1, handle: "sahiltiwari@okaxis", provider: "Google Pay", isDefault: true },
        { id: 2, handle: "sahil.708@ybl", provider: "PhonePe", isDefault: false },
    ]);

    const [isAddingUpi, setIsAddingUpi] = useState(false);
    const [upiFormData, setUpiFormData] = useState({
        handle: "",
        provider: ""
    });

    const [wallets, setWallets] = useState([
        { name: "Apple Pay", connected: false, email: "", color: "hover:border-black hover:text-black", activeColor: "bg-black text-white", icon: Wallet },
        { name: "Google Pay", connected: false, email: "", color: "hover:border-[#4285F4] hover:text-[#4285F4]", activeColor: "bg-[#4285F4] text-white", icon: Wallet },
        { name: "PayPal", connected: true, email: "sahil.tiwari@paypal.com", color: "hover:border-[#003087] hover:text-[#003087]", activeColor: "bg-[#003087] text-white", icon: Wallet },
        { name: "Amazon Pay", connected: false, email: "", color: "hover:border-[#FF9900] hover:text-[#FF9900]", activeColor: "bg-[#FF9900] text-white", icon: Wallet },
    ]);

    const [isLinkingWallet, setIsLinkingWallet] = useState<string | null>(null);
    const [linkEmail, setLinkEmail] = useState("");

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        const newCard = {
            id: cards.length + 1,
            type: formData.type,
            number: `**** **** **** ${formData.number.slice(-4)}`,
            expiry: formData.expiry,
            holder: formData.holder,
            color: "bg-gradient-to-br from-pink-600 to-rose-700",
            isDefault: false
        };
        setCards([...cards, newCard]);
        setIsAddingCard(false);
        setFormData({ number: "", expiry: "", holder: "", cvv: "", type: "Visa" });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Simple card type detection
        if (name === "number") {
            if (value.startsWith("4")) setFormData(prev => ({ ...prev, type: "Visa" }));
            else if (value.startsWith("5")) setFormData(prev => ({ ...prev, type: "Mastercard" }));
        }
    };

    const handleAddUpi = (e: React.FormEvent) => {
        e.preventDefault();
        const newUpi = {
            id: upis.length + 1,
            handle: upiFormData.handle,
            provider: upiFormData.provider || "UPI",
            isDefault: false
        };
        setUpis([...upis, newUpi]);
        setIsAddingUpi(false);
        setUpiFormData({ handle: "", provider: "" });
    };

    const handleUpiInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUpiFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleWalletToggle = (name: string) => {
        const wallet = wallets.find(w => w.name === name);
        if (wallet?.connected) {
            if (confirm(`Disconnect ${name}?`)) {
                setWallets(wallets.map(w => w.name === name ? { ...w, connected: false, email: "" } : w));
            }
        } else {
            setIsLinkingWallet(name);
        }
    };

    const confirmConnection = (e: React.FormEvent) => {
        e.preventDefault();
        setWallets(wallets.map(w => w.name === isLinkingWallet ? { ...w, connected: true, email: linkEmail } : w));
        setIsLinkingWallet(null);
        setLinkEmail("");
    };

    return (
        <div className="bg-[#fdf8f9] min-h-screen pt-4 md:pt-8 pb-20 font-sans">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/profile" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-600 shadow-sm border border-pink-50 hover:bg-pink-50 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-serif font-bold text-[#D94F7A]">Payment Management</h1>
                </div>

                {/* Security Banner */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-8 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm">
                        <Lock size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-emerald-900">Secure Payments</p>
                        <p className="text-xs text-emerald-600">Your card details are encrypted and stored securely.</p>
                    </div>
                </div>

                {/* Saved Cards Section */}
                <section className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Saved Cards</h2>
                        <Button
                            variant="ghost"
                            className="text-pink-600 hover:bg-pink-50 font-bold text-sm gap-2"
                            onClick={() => setIsAddingCard(true)}
                        >
                            <Plus size={16} /> Add New Card
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cards.map((card) => (
                            <div key={card.id} className={`${card.color} rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer`}>
                                <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Card Holder</p>
                                            <p className="text-sm font-bold">{card.holder}</p>
                                        </div>
                                        <div className="h-8 w-12 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-md italic font-black text-xs">
                                            {card.type}
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <p className="text-xl font-medium tracking-[0.2em]">{card.number}</p>
                                    </div>

                                    <div className="mt-4 flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Expires</p>
                                            <p className="text-sm font-bold">{card.expiry}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Chips/Circles Background */}
                                <div className="absolute top-1/2 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                                {card.isDefault && (
                                    <div className="absolute top-4 right-16 flex items-center gap-1 bg-emerald-500 px-3 py-1 rounded-full text-[10px] font-bold">
                                        <ShieldCheck size={10} /> Default
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Empty Add Card Placeholder */}
                        <button
                            onClick={() => setIsAddingCard(true)}
                            className="border-2 border-dashed border-pink-100 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-4 text-pink-400 hover:bg-pink-50 hover:border-pink-200 transition-all min-h-[208px]"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <Plus size={24} />
                            </div>
                            <p className="font-bold text-sm">Add Another Card</p>
                        </button>
                    </div>
                </section>

                {/* UPI IDs Section */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-6 font-serif">UPI & Other Methods</h2>
                    <div className="bg-white rounded-[2.5rem] border border-pink-50 shadow-sm overflow-hidden">
                        {upis.map((upi, idx) => (
                            <div key={upi.id} className={`flex items-center justify-between p-6 ${idx !== upis.length - 1 ? 'border-b border-pink-50' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600">
                                        <Landmark size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-gray-900 text-sm">{upi.handle}</p>
                                            {upi.isDefault && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Default</span>}
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">{upi.provider}</p>
                                    </div>
                                </div>
                                <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={() => setIsAddingUpi(true)}
                            className="w-full p-6 flex items-center justify-center gap-2 text-pink-600 font-bold text-sm hover:bg-pink-50/50 transition-colors border-t border-pink-50 border-dashed"
                        >
                            <Plus size={18} /> Add New UPI ID
                        </button>
                    </div>
                </section>

                {/* Other Wallets */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {wallets.map((wallet) => (
                        <button
                            key={wallet.name}
                            onClick={() => handleWalletToggle(wallet.name)}
                            className={`p-4 rounded-3xl border shadow-sm flex flex-col items-center gap-2 transition-all group relative overflow-hidden ${wallet.connected
                                    ? `${wallet.activeColor} border-transparent ring-2 ring-offset-2 ring-pink-100`
                                    : `bg-white border-pink-50 ${wallet.color}`
                                }`}
                        >
                            <wallet.icon size={20} className={wallet.connected ? "text-white" : "text-gray-400 group-hover:inherit"} />
                            <div className="text-center">
                                <span className="text-[11px] font-bold block">{wallet.name}</span>
                                {wallet.connected && <span className="text-[9px] opacity-80 block truncate max-w-[80px]">{wallet.email}</span>}
                            </div>

                            {wallet.connected ? (
                                <div className="absolute top-2 right-2">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                                </div>
                            ) : (
                                <Plus size={10} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Wallet Connection Modal */}
                {isLinkingWallet && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                        <div
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsLinkingWallet(null)}
                        ></div>
                        <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600">
                                            <Wallet size={20} />
                                        </div>
                                        <h2 className="text-xl font-serif font-bold text-[#D94F7A]">Link {isLinkingWallet}</h2>
                                    </div>
                                    <button
                                        onClick={() => setIsLinkingWallet(null)}
                                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                    >
                                        <Plus size={24} className="rotate-45" />
                                    </button>
                                </div>

                                <p className="text-sm text-gray-500 mb-8">
                                    Connect your <span className="font-bold text-gray-900">{isLinkingWallet}</span> account to enjoy faster, one-click checkouts on Inventino Jewels.
                                </p>

                                <form onSubmit={confirmConnection} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="walletEmail">{isLinkingWallet} Email/ID</Label>
                                        <Input
                                            id="walletEmail"
                                            type="email"
                                            placeholder="your-account@email.com"
                                            className="rounded-xl border-pink-100 focus:border-pink-500 h-12"
                                            value={linkEmail}
                                            onChange={(e) => setLinkEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-4">
                                        <Lock size={16} className="text-blue-500 mt-1 shrink-0" />
                                        <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                                            Redirecting to secure login. We never see or store your {isLinkingWallet} password.
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-gray-900 text-white rounded-xl h-12 font-bold hover:scale-[1.02] transition-transform"
                                    >
                                        Proceed to Connect
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Card Modal */}
                {isAddingCard && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <div
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsAddingCard(false)}
                        ></div>
                        <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-serif font-bold text-[#D94F7A]">Add New Card</h2>
                                    <button
                                        onClick={() => setIsAddingCard(false)}
                                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                    >
                                        <Plus size={24} className="rotate-45" />
                                    </button>
                                </div>

                                {/* Preview Card */}
                                <div className="bg-gradient-to-br from-pink-600 to-rose-700 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden mb-8 h-48 flex flex-col justify-between">
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Card Holder</p>
                                                <p className="text-sm font-bold min-h-[20px]">{formData.holder || "Your Name"}</p>
                                            </div>
                                            <div className="h-8 w-12 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-md italic font-black text-xs">
                                                {formData.type}
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-lg font-medium tracking-[0.2em]">{formData.number ? formData.number.replace(/(.{4})/g, '$1 ').trim() : "**** **** **** ****"}</p>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Expires</p>
                                                <p className="text-sm font-bold">{formData.expiry || "MM/YY"}</p>
                                            </div>
                                            <ShieldCheck size={20} className="opacity-60" />
                                        </div>
                                    </div>
                                    <div className="absolute top-1/2 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                                </div>

                                <form onSubmit={handleAddCard} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="holder">Card Holder Name</Label>
                                        <Input
                                            id="holder"
                                            name="holder"
                                            placeholder="Sahil Tiwari"
                                            className="rounded-xl border-pink-100 focus:border-pink-500 transition-all"
                                            value={formData.holder}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="number">Card Number</Label>
                                        <Input
                                            id="number"
                                            name="number"
                                            placeholder="0000 0000 0000 0000"
                                            className="rounded-xl border-pink-100 focus:border-pink-500 transition-all"
                                            maxLength={16}
                                            value={formData.number}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="expiry">Expiry Date</Label>
                                            <Input
                                                id="expiry"
                                                name="expiry"
                                                placeholder="MM/YY"
                                                className="rounded-xl border-pink-100 focus:border-pink-500 transition-all"
                                                maxLength={5}
                                                value={formData.expiry}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cvv">CVV</Label>
                                            <Input
                                                id="cvv"
                                                name="cvv"
                                                type="password"
                                                placeholder="***"
                                                className="rounded-xl border-pink-100 focus:border-pink-500 transition-all"
                                                maxLength={3}
                                                value={formData.cvv}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="flex-1 rounded-xl h-12"
                                            onClick={() => setIsAddingCard(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-gradient-to-r from-[#D94F7A] to-rose-500 text-white rounded-xl h-12 font-bold shadow-lg shadow-pink-200 hover:scale-[1.02] transition-transform"
                                        >
                                            Save Card
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add UPI Modal */}
                {isAddingUpi && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <div
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsAddingUpi(false)}
                        ></div>
                        <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600">
                                            <Landmark size={20} />
                                        </div>
                                        <h2 className="text-2xl font-serif font-bold text-[#D94F7A]">Add UPI ID</h2>
                                    </div>
                                    <button
                                        onClick={() => setIsAddingUpi(false)}
                                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                    >
                                        <Plus size={24} className="rotate-45" />
                                    </button>
                                </div>

                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-8 flex items-center gap-4">
                                    <ShieldCheck size={20} className="text-emerald-500" />
                                    <p className="text-xs text-emerald-700 font-medium">Your UPI ID is used only for secure identity verification and payments.</p>
                                </div>

                                <form onSubmit={handleAddUpi} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="handle">UPI ID (VPA)</Label>
                                        <Input
                                            id="handle"
                                            name="handle"
                                            placeholder="username@bankmount"
                                            className="rounded-xl border-pink-100 focus:border-pink-500 transition-all h-12"
                                            value={upiFormData.handle}
                                            onChange={handleUpiInputChange}
                                            required
                                        />
                                        <p className="text-[10px] text-gray-400 px-1">Example: sahil@okaxis, 9876543210@ybl</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="provider">Provider (Optional)</Label>
                                        <Input
                                            id="provider"
                                            name="provider"
                                            placeholder="Google Pay, PhonePe, etc."
                                            className="rounded-xl border-pink-100 focus:border-pink-500 transition-all h-12"
                                            value={upiFormData.provider}
                                            onChange={handleUpiInputChange}
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="flex-1 rounded-xl h-12"
                                            onClick={() => setIsAddingUpi(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-gradient-to-r from-[#D94F7A] to-rose-500 text-white rounded-xl h-12 font-bold shadow-lg shadow-pink-200 hover:scale-[1.02] transition-transform"
                                        >
                                            Add UPI ID
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
