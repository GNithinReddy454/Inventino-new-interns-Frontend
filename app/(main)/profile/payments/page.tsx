"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { paymentService, PaymentMethod } from "@/services/payment.service";

// Helper to format masked number
const formatMaskedNumber = (last4: string) => `•••• •••• •••• ${last4}`;

// Helper to format expiry (MM/YY)
const formatExpiry = (month: string, year: string) => `${month}/${year.slice(-2)}`;

export default function PaymentMethodsPage() {
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await paymentService.getAll();
      setCards(data);
    } catch (err) {
      console.error("Failed to load cards:", err);
      setError("Failed to load payment methods. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await paymentService.delete(id);
      setCards((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete card:", err);
      alert("Failed to delete card.");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const updated = await paymentService.setDefault(id);
      setCards((prev) =>
        prev.map((c) => ({
          ...c,
          isDefault: c.id === updated.id,
        }))
      );
    } catch (err) {
      console.error("Failed to set default:", err);
      alert("Failed to set default card.");
    }
  };

  return (
    <div className="bg-[#fdf8f9] min-h-screen pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-600 shadow-sm border border-pink-50 hover:bg-pink-50 transition-colors"
            >
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

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        {/* Cards grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            {cards.map((card) => (
              <div
                key={card.id}
                className="relative rounded-2xl overflow-hidden bg-gray-800 text-white p-6 min-h-40 flex flex-col justify-between shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-widest opacity-80">
                    {card.brand}
                  </span>
                  {card.isDefault && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300">
                      <ShieldCheck size={10} /> Default
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    {!card.isDefault && (
                      <button
                        onClick={() => handleSetDefault(card.id)}
                        className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        title="Set as default"
                      >
                        <ShieldCheck size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="w-7 h-7 rounded-md bg-white/10 hover:bg-red-500/50 flex items-center justify-center transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <p className="text-lg font-semibold tracking-[0.18em] mt-4">
                  {formatMaskedNumber(card.last4)}
                </p>

                <div className="flex items-end justify-between mt-3">
                  <p className="text-xs font-semibold opacity-80">{card.cardholderName}</p>
                  <p className="text-xs font-semibold opacity-60">
                    Exp. {formatExpiry(card.expiryMonth, card.expiryYear)}
                  </p>
                </div>

                <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
              </div>
            ))}

            {/* Add new card tile */}
            {!loading && (
              <button
                onClick={() => setShowForm(true)}
                className="rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/40 flex flex-col items-center justify-center gap-3 min-h-40 text-[#D94F7A] hover:bg-pink-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-pink-100 flex items-center justify-center shadow-sm">
                  <Plus size={20} />
                </div>
                <span className="text-sm font-semibold">Add New Card</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add card modal */}
      {showForm && (
        <AddCardModal
          onClose={() => setShowForm(false)}
          onSuccess={(newCard) => {
            setCards((prev) => [...prev, newCard]);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

// Modal component (no Stripe – uses test token)
function AddCardModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (card: PaymentMethod) => void }) {
  const [holderName, setHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  // Detect card brand from first digits
  const detectBrand = (num: string): string => {
    const cleaned = num.replace(/\s/g, "");
    if (cleaned.startsWith("4")) return "VISA";
    if (cleaned.startsWith("5")) return "MASTERCARD";
    if (cleaned.startsWith("3")) return "AMEX";
    return "UNKNOWN";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the test token from your API example
      const testToken = "tok_stripe_1739564880"; // Confirm with backend team

      // Parse expiry (MM/YY)
      const [month, year] = expiry.split("/");
      const fullYear = year.length === 2 ? `20${year}` : year;
      const last4 = cardNumber.replace(/\s/g, "").slice(-4);
      const brand = detectBrand(cardNumber);

      const payload = {
        paymentToken: testToken,
        brand,
        last4,
        expiryMonth: month.padStart(2, "0"),
        expiryYear: fullYear,
        cardholderName: holderName,
        isDefault,
        gateway: "stripe", // or any value your backend expects
      };

      const newCard = await paymentService.add(payload);
      onSuccess(newCard);
    } catch (err) {
      console.error(err);
      alert("Failed to add card. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Add New Card</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
            <Plus size={18} className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Card Holder Name</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
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
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
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
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
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
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="w-full h-11 rounded-lg border border-pink-100 bg-pink-50/40 px-3 text-sm outline-none focus:ring-2 focus:ring-pink-200"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-200"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-600">Set as default payment method</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-11 rounded-lg border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 h-11 rounded-lg bg-[#D94F7A] text-white text-sm font-semibold hover:bg-[#C0426A] disabled:opacity-50 transition-colors">
              {loading ? "Adding..." : "Save Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}