"use client";

import { Button } from "./ui/button";
import { OrderResponse } from "@/lib/types";
import { XCircle, CreditCard, AlertCircle, Lock } from "lucide-react";

interface FailedScreenProps {
  order: OrderResponse;
  onTryAgain: () => void;
  onChangePayment: () => void;
}

export function FailedScreen({
  order,
  onTryAgain,
  onChangePayment,
}: FailedScreenProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      {/* Progress Steps */}
      <div className="mb-8">
        {/* Header with Secure Checkout */}
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Secure Checkout</span>
          </div>
        </div>

        <div className="flex items-center justify-between relative">
          {/* Cart - Step 1 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold shadow-md">
              ✓
            </div>
            <p className="text-xs font-medium text-green-600 mt-2">Cart</p>
          </div>

          {/* Information - Step 2 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold shadow-md">
              ✓
            </div>
            <p className="text-xs font-medium text-green-600 mt-2">
              Information
            </p>
          </div>

          {/* Payment - Step 3 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold shadow-md">
              ✗
            </div>
            <p className="text-xs font-medium text-red-600 mt-2">Payment</p>
          </div>

          {/* Complete - Step 4 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
              4
            </div>
            <p className="text-xs font-medium text-gray-400 mt-2">Complete</p>
          </div>

          {/* Progress Line */}
          <div
            className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2"
            style={{ zIndex: 0 }}
          >
            <div
              className="h-full bg-gradient-to-r from-green-500 via-green-500 to-red-500"
              style={{ width: "75%" }}
            />
          </div>
        </div>
      </div>

      {/* Error Icon */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 mb-4">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          PAYMENT FAILED
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          We couldn&apos;t process your payment. Please try again.
        </p>
      </div>

      {/* Error Details */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 mb-6 space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 mb-1">Error Details</p>
            <p className="text-sm text-gray-700 mb-2">
              {order.errorMessage ||
                "Payment processing failed. Please check your payment details and try again."}
            </p>
            {order.errorCode && (
              <p className="text-xs text-gray-500">
                Error Code:{" "}
                <span className="font-mono font-semibold">
                  {order.errorCode}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-red-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Attempted Payment Method
            </span>
            <span className="font-semibold text-gray-900 capitalize">
              {order.paymentMethod === "card"
                ? "Credit/Debit Card"
                : order.paymentMethod}
            </span>
          </div>
        </div>
      </div>

      {/* Common Issues */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">
          Common reasons for payment failure:
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-pink-500 mt-0.5">•</span>
            <span>Insufficient funds or invalid card</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 mt-0.5">•</span>
            <span>Incorrect card details or CVV</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 mt-0.5">•</span>
            <span>Card expired or blocked by your bank</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 mt-0.5">•</span>
            <span>Network or connection issue</span>
          </li>
        </ul>
      </div>

      {/* Shipping Address (for reference) */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2 text-sm">
          Your shipping address is saved:
        </h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-medium text-gray-900">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </p>
          <p>
            {order.shippingAddress.streetAddress}, {order.shippingAddress.city}
          </p>
          <p>
            {order.shippingAddress.state} {order.shippingAddress.zipCode}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={onTryAgain}
          className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-6 text-base font-semibold rounded-lg shadow-lg shadow-pink-500/30"
        >
          Try Again
        </Button>

        <Button
          onClick={onChangePayment}
          variant="outline"
          className="w-full border-pink-200 text-pink-600 hover:bg-pink-50 py-6"
        >
          <CreditCard className="mr-2 h-5 w-5" />
          Choose Different Payment
        </Button>

        <Button
          variant="ghost"
          onClick={() => (window.location.href = "/support")}
          className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          Contact Support
        </Button>
      </div>
    </div>
  );
}
