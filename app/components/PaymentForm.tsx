"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { PaymentMethod as PaymentMethodType } from "@/lib/types";
import {
  CreditCard,
  Wallet,
  Smartphone,
  Banknote,
  Loader2,
  Lock,
  Plus,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { ProgressStepper } from "./ProgressStepper";
import { paymentService, PaymentMethod as SavedCard } from "@/services/payment.service";

interface PaymentFormProps {
  paymentMethod: PaymentMethodType;
  setPaymentMethod: (method: PaymentMethodType) => void;
  onSubmit: (method: PaymentMethodType, cardDetails?: any) => void;
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
  // ... (rest of the component state remains same)
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  useEffect(() => {
    const fetchSavedCards = async () => {
      try {
        setLoadingCards(true);
        const cards = await paymentService.getAll();
        setSavedCards(cards);
        if (cards.length > 0) {
          const defaultCard = cards.find(c => c.isDefault) || cards[0];
          setSelectedCardId(defaultCard.id);
        } else {
          setShowNewCardForm(true);
        }
      } catch (error) {
        console.error("Failed to fetch saved cards:", error);
        setShowNewCardForm(true);
      } finally {
        setLoadingCards(false);
      }
    };

    fetchSavedCards();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "card") {
      if (showNewCardForm) {
        onSubmit(paymentMethod, cardDetails);
      } else if (selectedCardId) {
        const selectedCard = savedCards.find(c => c.id === selectedCardId);
        onSubmit(paymentMethod, {
          isSavedCard: true,
          cardId: selectedCardId,
          ...selectedCard
        });
      }
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

  const isFormValid = () => {
    if (paymentMethod !== "card") return true;
    if (showNewCardForm) {
      return (
        cardDetails.cardNumber.replace(/\s/g, "").length >= 15 &&
        cardDetails.expiryDate.length === 5 &&
        cardDetails.cvv.length >= 3 &&
        cardDetails.cardholderName.trim() !== ""
      );
    }
    return selectedCardId !== null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      {/* Progress Stepper */}
      <ProgressStepper currentStep="payment" />

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
            onValueChange={(value) => setPaymentMethod(value as PaymentMethodType)}
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

              {/* Saved Cards Selection */}
              {paymentMethod === "card" && !loadingCards && savedCards.length > 0 && (
                <div className="mt-4 space-y-4 pl-8 animate-in fade-in duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-3 h-3 text-pink-500" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Saved from your profile</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {savedCards.map((card) => {
                      const isSelected = selectedCardId === card.id && !showNewCardForm;
                      return (
                        <div
                          key={card.id}
                          onClick={() => {
                            setSelectedCardId(card.id);
                            setShowNewCardForm(false);
                          }}
                          className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group ${
                            isSelected
                              ? "border-pink-500 bg-pink-50/50 shadow-md shadow-pink-100"
                              : "border-gray-100 bg-white hover:border-pink-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                                card.brand.toLowerCase() === 'visa' ? 'bg-[#1A1F71]' : 'bg-[#EB001B]'
                              }`}>
                                {card.brand.toUpperCase()}
                              </div>
                              <div>
                                <span className="text-sm font-bold text-gray-800">
                                  •••• •••• •••• {card.cardNumber.slice(-4)}
                                </span>
                                <p className="text-[10px] text-gray-400 font-medium">
                                  Expires {card.expiryMonth}/{card.expiryYear}
                                </p>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected ? "border-pink-500 bg-pink-500" : "border-gray-200 group-hover:border-pink-300"
                            }`}>
                              {isSelected && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCardForm(!showNewCardForm);
                        if (!showNewCardForm) setSelectedCardId(null);
                      }}
                      className={`flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed transition-all text-sm font-bold ${
                        showNewCardForm
                          ? "border-pink-400 bg-pink-50 text-pink-600"
                          : "border-gray-100 bg-gray-50/30 text-gray-400 hover:border-pink-200 hover:text-pink-500 hover:bg-pink-50/30"
                      }`}
                    >
                      <Plus size={16} />
                      {showNewCardForm ? "Using New Card" : "Add a New Card"}
                      <ChevronDown size={14} className={`ml-1 transition-transform duration-300 ${showNewCardForm ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>
              )}

              {loadingCards && paymentMethod === "card" && (
                <div className="flex items-center justify-center py-6 pl-8">
                  <div className="relative">
                    <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
                    <div className="absolute inset-0 blur-sm bg-pink-500/20 rounded-full animate-pulse" />
                  </div>
                  <span className="ml-3 text-xs font-semibold text-gray-400">Fetching your secured cards...</span>
                </div>
              )}

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
        {paymentMethod === "card" && showNewCardForm && (
          <div className="space-y-4 p-4 bg-pink-50/30 rounded-lg border border-pink-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-xs font-semibold text-pink-600 uppercase tracking-wider">New Card Details</p>
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

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isProcessing}
            className="flex-1 border-pink-200 text-pink-600 hover:bg-pink-600 hover:text-white hover:border-pink-600 transition-all duration-300"
          >
            Back to Shipping
          </Button>

          <Button
            type="submit"
            disabled={isProcessing || !isFormValid()}
            className={`flex-1 py-6 text-base font-semibold rounded-lg shadow-lg transition-all ${
              !isProcessing && isFormValid()
                ? "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-pink-500/30"
                : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
            }`}
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
        </div>
      </form>
    </div>
  );
}
