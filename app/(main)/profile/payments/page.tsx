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

                {/* Use cardNumber directly from backend - it already includes the masked format */}
                <p className="text-lg font-semibold tracking-[0.18em] mt-4">
                  {card.cardNumber}
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

// Modal component with full validation and customerId
function AddCardModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (card: PaymentMethod) => void }) {
  const [holderName, setHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Allowed brands as per backend enum
  const allowedBrands = ["VISA", "MASTERCARD", "AMEX", "DISCOVER", "JCB", "DINERS"];

  // Detect card brand from first digits
  const detectBrand = (num: string): { brand: string; isValid: boolean } => {
    const cleaned = num.replace(/\s/g, "");
    if (!cleaned) return { brand: "UNKNOWN", isValid: false };

    // Common card brand detection
    if (cleaned.startsWith("4")) return { brand: "VISA", isValid: true };
    if (/^5[1-5]/.test(cleaned)) return { brand: "MASTERCARD", isValid: true };
    if (cleaned.startsWith("34") || cleaned.startsWith("37")) return { brand: "AMEX", isValid: true };
    if (/^3(?:0[0-5]|[68][0-9])/.test(cleaned)) return { brand: "DINERS", isValid: true };
    if (cleaned.startsWith("6011") || cleaned.startsWith("65") || /^64[4-9]/.test(cleaned) || cleaned.startsWith("622")) return { brand: "DISCOVER", isValid: true };
    if (/^35(?:2[89]|[3-8][0-9])/.test(cleaned)) return { brand: "JCB", isValid: true };
    
    // RuPay detection (Common in India) - starts with 60, 65, 81, 82, 508, 353, 356
    if (/^(60|65|81|82|508|353|356)/.test(cleaned) || cleaned.startsWith("8")) return { brand: "RUPAY", isValid: true };
    
    // Maestro detection
    if (/^(5018|5020|5038|5893|6304|6759|6761|6762|6763)/.test(cleaned)) return { brand: "MAESTRO", isValid: true };

    // Fallback to a generic "CARD" type for any other number that fits common length patterns
    // This allows the user to proceed even if the brand isn't specifically identified here
    if (cleaned.length >= 13) return { brand: "CARD", isValid: true };

    return { brand: "UNKNOWN", isValid: false };
  };

  const handleCardNumberChange = (value: string) => {
    // Remove non-digits
    const cleaned = value.replace(/\D/g, "");
    // Add space every 4 digits
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    setCardNumber(formatted.substring(0, 19)); // Max 16 digits + 3 spaces
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Trim inputs
    const trimmedHolder = holderName.trim();
    if (!trimmedHolder) {
      setFormError("Card holder name is required.");
      return;
    }

    const cleanedNumber = cardNumber.replace(/\s/g, "");
    if (cleanedNumber.length < 13 || cleanedNumber.length > 19) {
      setFormError("Please enter a valid card number (13-19 digits).");
      return;
    }

    // Detect and validate brand
    const { brand, isValid } = detectBrand(cleanedNumber);
    if (!isValid) {
      setFormError("Please enter a valid card number.");
      return;
    }

    // CVV: 3 or 4 digits (Amex uses 4)
    const cleanedCvv = cvv.replace(/\s/g, "");
    const expectedCvvLength = brand === "AMEX" ? 4 : 3;
    if (!/^\d+$/.test(cleanedCvv) || cleanedCvv.length !== expectedCvvLength) {
      setFormError(`CVV must be ${expectedCvvLength} digits.`);
      return;
    }

    // Expiry: must be in MM/YY format
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setFormError("Please enter expiry in MM/YY format (e.g., 12/25).");
      return;
    }

    const [month, year] = expiry.split("/");
    const fullYear = year.length === 2 ? `20${year}` : year;

    const last4 = cleanedNumber.slice(-4);

    setLoading(true);
    try {
      const testToken = "tok_stripe_1739564880"; // test token – confirm with backend team
      // Add a placeholder customerId (backend requires it)
      const payload = {
        paymentToken: testToken,
        customerId: "cus_test_123", // temporary test value; adjust as needed
        brand,
        last4,
        expiryMonth: month.padStart(2, "0"),
        expiryYear: fullYear,
        cardholderName: trimmedHolder,
        isDefault,
        gateway: "stripe",
      };
      const newCard = await paymentService.add(payload);
      onSuccess(newCard);
    } catch (err: any) {
      console.error(err);
      // Try to extract a meaningful error from the response
      const serverMsg = err?.response?.data?.message || "Failed to add card. Please try again.";
      setFormError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Add New Card</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
          >
            <Plus size={18} className="rotate-45" />
          </button>
        </div>

        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Card Holder Name
            </label>
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
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Card Number
            </label>
            <input
              type="text"
              required
              maxLength={19}
              placeholder="•••• •••• •••• ••••"
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              className="w-full h-11 rounded-lg border border-pink-100 bg-pink-50/40 px-3 text-sm outline-none focus:ring-2 focus:ring-pink-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Expiry (MM/YY)
              </label>
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
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                CVV
              </label>
              <input
                type="password"
                required
                maxLength={4}
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
            <label htmlFor="isDefault" className="text-sm text-gray-600">
              Set as default payment method
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-lg border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 rounded-lg bg-[#D94F7A] text-white text-sm font-semibold hover:bg-[#C0426A] disabled:opacity-50 transition-colors"
            >
              {loading ? "Adding..." : "Save Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}