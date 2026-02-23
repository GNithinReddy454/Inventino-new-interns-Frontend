"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CreditCard, Plus, Trash2, Edit2, ShieldCheck, ArrowLeft } from "lucide-react";

interface Card {
  id: number;
  type: "VISA" | "MASTERCARD";
  maskedNumber: string;
  expiry: string;
  holder: string;
  isDefault?: boolean;
}

const INITIAL_CARDS: Card[] = [
  { id: 1, type: "VISA", maskedNumber: "•••• •••• •••• 4532", expiry: "12/25", holder: "JOHN DOE", isDefault: true },
  { id: 2, type: "MASTERCARD", maskedNumber: "•••• •••• •••• 8765", expiry: "08/26", holder: "JOHN DOE" },
];

export default function PaymentMethodsPage() {
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ holder: "", number: "", expiry: "", cvv: "" });

  const handleDelete = (id: number) => setCards((prev) => prev.filter((c) => c.id !== id));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const last4 = form.number.replace(/\s/g, "").slice(-4);
    const type = form.number.startsWith("4") ? "VISA" : "MASTERCARD";
    setCards((prev) => [
      ...prev,
      { id: Date.now(), type, maskedNumber: `•••• •••• •••• ${last4}`, expiry: form.expiry, holder: form.holder.toUpperCase() },
    ]);
    setShowForm(false);
    setForm({ holder: "", number: "", expiry: "", cvv: "" });
  };

  return (
    <div className="bg-[#fdf8f9] min-h-screen pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/profile" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-600 shadow-sm border border-pink-50 hover:bg-pink-50 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
              <p className="text-sm text-gray-400 mt-0.5">Manage your saved payment cards</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#D94F7A] text-white text-sm font-semibold rounded-lg hover:bg-[#C0426A] transition-colors"
          >
            <Plus size={15} /> Add New Card
          </button>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          {cards.map((card) => (
            <div
              key={card.id}
              className="relative rounded-2xl overflow-hidden bg-gray-800 text-white p-6 min-h-[160px] flex flex-col justify-between shadow-lg"
            >
              {/* Card brand label */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest opacity-80">{card.type}</span>
                {card.isDefault && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300">
                    <ShieldCheck size={10} /> Default
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <button
                    className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="w-7 h-7 rounded-md bg-white/10 hover:bg-red-500/50 flex items-center justify-center transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Masked number */}
              <p className="text-lg font-semibold tracking-[0.18em] mt-4">{card.maskedNumber}</p>

              {/* Holder & expiry */}
              <div className="flex items-end justify-between mt-3">
                <p className="text-xs font-semibold opacity-80">{card.holder}</p>
                <p className="text-xs font-semibold opacity-60">Exp. {card.expiry}</p>
              </div>

              {/* Decorative circle */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
            </div>
          ))}

          {/* Add new card tile */}
          <button
            onClick={() => setShowForm(true)}
            className="rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/40 flex flex-col items-center justify-center gap-3 min-h-[160px] text-[#D94F7A] hover:bg-pink-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-pink-100 flex items-center justify-center shadow-sm">
              <Plus size={20} />
            </div>
            <span className="text-sm font-semibold">Add New Card</span>
          </button>
        </div>

        {/* Add card form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Add New Card</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
                >
                  <Plus size={18} className="rotate-45" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Card Holder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={form.holder}
                    onChange={(e) => setForm({ ...form, holder: e.target.value })}
                    className="w-full h-11 rounded-lg border border-pink-100 bg-pink-50/40 px-3 text-sm outline-none focus:ring-2 focus:ring-pink-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="•••• •••• •••• ••••"
                    value={form.number}
                    onChange={(e) => setForm({ ...form, number: e.target.value })}
                    className="w-full h-11 rounded-lg border border-pink-100 bg-pink-50/40 px-3 text-sm outline-none focus:ring-2 focus:ring-pink-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="MM/YY"
                      value={form.expiry}
                      onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                      className="w-full h-11 rounded-lg border border-pink-100 bg-pink-50/40 px-3 text-sm outline-none focus:ring-2 focus:ring-pink-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">CVV</label>
                    <input
                      type="password"
                      required
                      maxLength={3}
                      placeholder="•••"
                      value={form.cvv}
                      onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                      className="w-full h-11 rounded-lg border border-pink-100 bg-pink-50/40 px-3 text-sm outline-none focus:ring-2 focus:ring-pink-200"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 h-11 rounded-lg border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-lg bg-[#D94F7A] text-white text-sm font-semibold hover:bg-[#C0426A] transition-colors"
                  >
                    Save Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
