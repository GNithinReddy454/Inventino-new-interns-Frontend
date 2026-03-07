"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { PaymentMethod } from "@/lib/types";
import {
  CreditCard,
  Wallet,
  Smartphone,
  Banknote,
  Loader2,
  Lock,
} from "lucide-react";

interface PaymentFormProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  onSubmit: (method: PaymentMethod, cardDetails?: any) => void;
  onBack: () => void;
  isProcessing: boolean;
}

export function PaymentForm({
  paymentMethod,
  setPaymentMethod,
  onSubmit,
  onBack,
  isProcessing,
}: PaymentFormProps) {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "card") {
      onSubmit(paymentMethod, cardDetails);
    } else {
      onSubmit(paymentMethod);
    }
  };

  const getSubmitButtonText = () => {
    if (isProcessing) {
      return paymentMethod === "cod"
        ? "Placing Order..."
        : "Processing Payment...";
    }
    return paymentMethod === "cod" ? "Place Order" : "Pay Now";
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

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
            <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-semibold shadow-md">
              3
            </div>
            <p className="text-xs font-medium text-pink-600 mt-2">Payment</p>
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
              className="h-full bg-gradient-to-r from-green-500 via-green-500 to-pink-500"
              style={{ width: "75%" }}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="text-pink-600 font-semibold text-sm">3</span>
            </div>
            <h2 className="text-lg font-semibold">Payment Method</h2>
          </div>

          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
          >
            <div className="space-y-3">
              {/* Credit/Debit Card */}
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-pink-300 has-[:checked]:border-pink-500 has-[:checked]:bg-pink-50/50">
                <RadioGroupItem value="card" id="card" />
                <CreditCard className="h-5 w-5 text-pink-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Credit / Debit Card</p>
                  <p className="text-xs text-gray-500">Pay with your card</p>
                </div>
                <div className="flex gap-1">
                  <div className="w-8 h-5 bg-blue-600 rounded" />
                  <div className="w-8 h-5 bg-red-600 rounded" />
                </div>
              </label>

              {/* PayPal */}
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-pink-300 has-[:checked]:border-pink-500 has-[:checked]:bg-pink-50/50">
                <RadioGroupItem value="paypal" id="paypal" />
                <Wallet className="h-5 w-5 text-pink-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">PayPal</p>
                  <p className="text-xs text-gray-500">Secure payment</p>
                </div>
              </label>

              {/* Google Pay */}
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-pink-300 has-[:checked]:border-pink-500 has-[:checked]:bg-pink-50/50">
                <RadioGroupItem value="gpay" id="gpay" />
                <Smartphone className="h-5 w-5 text-pink-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Google Pay</p>
                  <p className="text-xs text-gray-500">Fast & secure</p>
                </div>
              </label>

              {/* Cash on Delivery */}
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-pink-300 has-[:checked]:border-pink-500 has-[:checked]:bg-pink-50/50">
                <RadioGroupItem value="cod" id="cod" />
                <Banknote className="h-5 w-5 text-pink-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Cash on Delivery</p>
                  <p className="text-xs text-gray-500">Pay when you receive</p>
                </div>
              </label>
            </div>
          </RadioGroup>
        </div>

        {/* Card Details Form */}
        {paymentMethod === "card" && (
          <div className="space-y-4 p-4 bg-pink-50/30 rounded-lg border border-pink-100">
            <div>
              <Label
                htmlFor="cardNumber"
                className="text-sm text-gray-700 mb-1.5 block"
              >
                Card Number
              </Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.cardNumber}
                onChange={(e) =>
                  setCardDetails({
                    ...cardDetails,
                    cardNumber: formatCardNumber(e.target.value),
                  })
                }
                className="bg-white"
                maxLength={19}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="expiryDate"
                  className="text-sm text-gray-700 mb-1.5 block"
                >
                  Expiry Date
                </Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={cardDetails.expiryDate}
                  onChange={(e) =>
                    setCardDetails({
                      ...cardDetails,
                      expiryDate: formatExpiryDate(e.target.value),
                    })
                  }
                  className="bg-white"
                  maxLength={5}
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="cvv"
                  className="text-sm text-gray-700 mb-1.5 block"
                >
                  CVV
                </Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) =>
                    setCardDetails({
                      ...cardDetails,
                      cvv: e.target.value.replace(/\D/g, "").substring(0, 4),
                    })
                  }
                  className="bg-white"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="cardholderName"
                className="text-sm text-gray-700 mb-1.5 block"
              >
                Cardholder Name
              </Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                value={cardDetails.cardholderName}
                onChange={(e) =>
                  setCardDetails({
                    ...cardDetails,
                    cardholderName: e.target.value,
                  })
                }
                className="bg-white"
                required
              />
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isProcessing}
            className="flex-1 border-pink-200 text-pink-600 hover:bg-pink-50"
          >
            Back to Shipping
          </Button>

          {paymentMethod !== "cod" && (
            <Button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-6 text-base font-semibold rounded-lg shadow-lg shadow-pink-500/30"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {getSubmitButtonText()}
                </>
              ) : (
                getSubmitButtonText()
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
