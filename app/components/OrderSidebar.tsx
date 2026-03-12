"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchCart, applyPromoCode as applyPromoAction } from "@/redux/cartslice";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CheckoutStep, PaymentMethod } from "@/lib/types";
import { Loader2 } from "lucide-react";

type OrderSidebarProps = {
  currentStep: CheckoutStep;
  paymentMethod: PaymentMethod;
  onPlaceOrder: (method: PaymentMethod) => void;
  isProcessing: boolean;
};

export function OrderSidebar({
  currentStep,
  paymentMethod,
  onPlaceOrder,
  isProcessing,
}: OrderSidebarProps) {
  const dispatch = useAppDispatch();
  const { 
    items: cart, 
    totalAmount, 
    isLoading: cartLoading, 
    discount, 
    promoCode: appliedCode 
  } = useAppSelector((state) => state.cart);

  // Calculate summary from cart data
  const summary = {
    subtotal: cart.reduce(
      (sum: any, item: any) => {
        const price = item.price || item.product?.price || 0;
        return sum + price * item.quantity;
      },
      0,
    ),
    shipping: 0, // Default free shipping
    discount: discount || 0,
    tax: 0,
    total: totalAmount,
  };

  const [promoCode, setPromoCode] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setApplyingPromo(true);
    setPromoError("");
    try {
      const result = await dispatch(applyPromoAction(promoCode));
      if (applyPromoAction.rejected.match(result)) {
        setPromoError(result.payload as string || "Invalid promo code");
      } else {
        setPromoCode("");
      }
    } catch (error) {
      setPromoError("Something went wrong");
    } finally {
      setApplyingPromo(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        </div>
      </div>
    );
  }

  // Product color to gradient mapping
  const getGradient = (color?: string) => {
    const gradients: Record<string, string> = {
      "Rose Gold": "from-orange-200 to-orange-300",
      "Sage Green": "from-teal-300 to-green-400",
      "Honey Yellow": "from-yellow-200 to-yellow-300",
    };
    return gradients[color || ""] || "from-pink-200 to-pink-300";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
      <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

      {/* Cart Items with Product Cards */}
      <div className="space-y-4 mb-6">
        {cart?.map((item: any, index: any) => {
          const product = item.product || item;
          const name = product.name || "Product Name";
          const color = product.color || "Standard";
          const price = product.price || 0;
          const quantity = item.quantity || 1;
          const id = product._id || product.productId || index;

          return (
            <div
              key={id}
              className="flex gap-3 items-start"
            >
              {/* Product Image Box */}
              <div
                className={`w-20 h-20 bg-gradient-to-br ${getGradient(color)} rounded-xl flex-shrink-0 shadow-sm`}
              />

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 mb-1 truncate">
                  {name}
                </h3>
                <p className="text-xs text-gray-500 mb-1">
                  Qty: {quantity} • {color}
                </p>
                <p className="text-sm font-bold text-pink-600">
                  ₹{price.toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Promo Code */}
      {currentStep !== "success" && currentStep !== "tracking" && (
        <div className="mb-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="text-sm bg-pink-50/50 border-pink-100"
            />
            <Button
              onClick={handleApplyPromo}
              disabled={applyingPromo || !promoCode.trim()}
              size="sm"
              className="bg-pink-500 hover:bg-pink-600 text-white whitespace-nowrap px-6"
            >
              {applyingPromo ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>
          {promoError && (
            <p className="text-xs text-red-500 mt-1">{promoError}</p>
          )}
        </div>
      )}

      {/* Pricing Breakdown */}
      <div className="space-y-3 py-4 border-t border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">
            ₹{summary?.subtotal?.toFixed(2) || "0.00"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-semibold text-green-600">
            {summary?.shipping === 0
              ? "FREE"
              : `₹${summary?.shipping?.toFixed(2) || "0.00"}`}
          </span>
        </div>
        {summary?.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="font-medium text-green-600">
              -${summary?.discount?.toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium">
            ₹{summary?.tax?.toFixed(2) || "0.00"}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-2xl font-bold text-pink-600">
          ₹{summary?.total?.toFixed(2) || "0.00"}
        </span>
      </div>

      {/* Place Order Button */}
      {currentStep === "payment" && paymentMethod === "cod" && (
        <div className="mt-6">
          <Button
            onClick={() => onPlaceOrder(paymentMethod)}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-6 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              "Place Order"
            )}
          </Button>

          {/* Privacy Text */}
          <p className="text-xs text-center text-gray-500 mt-4 leading-relaxed">
            By placing your order, you agree to our{" "}
            <a href="/terms" className="text-pink-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-pink-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
