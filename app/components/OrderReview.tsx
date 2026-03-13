"use client";

import {
  Loader2,
  MapPin,
  CreditCard,
  ShoppingCart,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "./ui/button";
import { useAppSelector } from "@/redux/store";
import { ProgressStepper } from "./ProgressStepper";
import { ShippingAddress, PaymentMethod } from "@/lib/types";

interface OrderReviewProps {
  address: ShippingAddress | null;
  paymentMethod: PaymentMethod;
  cardDetails?: any;
  onPlaceOrder: (method: PaymentMethod, details?: any) => void;
  onBack: () => void;
  isProcessing: boolean;
}

export function OrderReview({
  address,
  paymentMethod,
  cardDetails,
  onPlaceOrder,
  onBack,
  isProcessing,
}: OrderReviewProps) {
  const { items: cart, totalAmount, isLoading: cartLoading } = useAppSelector((state) => state.cart);

  const summary = {
    subtotal: totalAmount,
    shipping: 0,
    tax: 0,
    total: totalAmount,
  };

  const getPaymentLabel = () => {
    switch (paymentMethod) {
      case "card":
        if (cardDetails?.isSavedCard) {
          return `Saved Card (•••• ${cardDetails.cardNumber.slice(-4)})`;
        }
        return `Credit/Debit Card (•••• ${cardDetails?.cardNumber?.slice(-4) || ""})`;
      case "paypal":
        return "PayPal";
      case "gpay":
        return "Google Pay";
      case "cod":
        return "Cash on Delivery";
      default:
        return "Selected Payment Method";
    }
  };

  if (cartLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Progress Stepper */}
        <ProgressStepper currentStep="review" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Shipping Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <MapPin className="w-4 h-4 text-pink-500" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">Shipping Address</h3>
            </div>
            {address && (
              <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                <p className="font-bold text-gray-900">{address.fullName || `${address.firstName} ${address.lastName}`}</p>
                <p className="text-sm text-gray-600 mt-1">{address.streetAddress || address.street}</p>
                <p className="text-sm text-gray-600">{address.city}, {address.state} {address.zipCode || address.pincode}</p>
                <p className="text-sm text-gray-600">{address.country}</p>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-gray-400">
                  <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-md">Phone: {address.phone}</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <CreditCard className="w-4 h-4 text-pink-500" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">Payment Method</h3>
            </div>
            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 h-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{getPaymentLabel()}</p>
                  <p className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3" /> Secure Transaction
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mt-10">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 mb-4">
            <ShoppingCart className="w-4 h-4 text-pink-500" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">Review Items ({cart.length})</h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {cart.map((item: any) => {
              // Handle both structures (Redux vs API)
              const name = item.name || item.product?.name;
              const price = item.price || item.product?.price;
              const quantity = item.quantity;
              const id = item.productId || item.product?._id;
              
              return (
                <div key={id} className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-xl hover:border-pink-100 transition-colors">
                  <div className="w-16 h-16 bg-pink-50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image || item.product?.images?.[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image || item.product?.images?.[0]?.url} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <ShoppingCart className="w-6 h-6 text-pink-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 truncate">{name}</h4>
                    <p className="text-[10px] text-gray-500">
                        Qty: {quantity} {item.color ? `• ${item.color}` : ""} {item.size ? `• ${item.size}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-pink-600">₹{(price * quantity).toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Totals Summary */}
        <div className="mt-8 p-6 bg-pink-50/30 rounded-2xl border border-pink-100">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">₹{summary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-bold text-green-600">FREE</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-pink-100 mt-3">
              <span className="text-base font-bold text-gray-900">Total Payable Amount</span>
              <span className="text-2xl font-black text-pink-600">₹{summary.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isProcessing}
            className="flex-1 py-6 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl font-bold"
          >
            Back to Payment
          </Button>
          <Button
            onClick={() => onPlaceOrder(paymentMethod, cardDetails)}
            disabled={isProcessing}
            className="flex-[2] py-6 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-black text-lg rounded-xl shadow-xl shadow-pink-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Order...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>Confirm & Place Order</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            )}
          </Button>
        </div>

        <p className="text-[10px] text-center text-gray-400 mt-6 max-w-md mx-auto">
          By clicking "Confirm & Place Order", you agree to our Terms of Use and Privacy Policy. Your payment information is processed securely.
        </p>
      </div>
    </div>
  );
}
