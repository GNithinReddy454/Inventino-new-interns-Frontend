'use client';

import { useState } from 'react';
import { ShippingForm } from './ShippingForm';
import { PaymentForm } from './PaymentForm';
import { SuccessScreen } from './SuccessScreen';
import { FailedScreen } from './FailedScreen';
import { TrackingScreen } from './TrackingScreen';
import { OrderSidebar } from './OrderSidebar';
import { CheckoutStep, ShippingAddress, PaymentMethod, OrderResponse } from '@/lib/types';
import { placeOrder } from '@/lib/hooks';
import { useEffect } from 'react';

export default function CheckoutFlow() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  //Load razorpay script
  useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  document.body.appendChild(script);
}, []);


  const handleShippingSubmit = (address: ShippingAddress) => {
    setShippingAddress(address);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = async (paymentMethod: PaymentMethod, cardDetails?: any) => {
    if (!shippingAddress) return;

    setIsProcessing(true);
    try {

    if (!(window as any).Razorpay) {
      throw new Error("Razorpay SDK not loaded");
    }

    const options = {
      //Razorpaay test key
      key: process.env.NEXT_PUBLIC_SSK_RAZORPAY_KEY,
      amount: 50000, // Replace with dynamic total later
      currency: "INR",
      name: "Inventino Jewels",
      description: "Order Payment",

      handler: function (response: any) {

        setOrderResponse({
          orderId: response.razorpay_payment_id,
          orderNumber: "INV-" + Date.now(),
          orderDate: new Date().toISOString(),
          transactionId: response.razorpay_payment_id,
          paymentMethod: paymentMethod,
          totalAmount: 500,
          status: "success",
          shippingAddress: shippingAddress
        });

        setCurrentStep("success");
      },

      modal: {
        ondismiss: function () {
          setCurrentStep("failed");
        }
      },

      theme: {
        color: "#ec4899"
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();

  } catch (error) {

    setCurrentStep("failed");

  } finally {
    setIsProcessing(false);
  }
};

  const handleViewTracking = () => {
    setCurrentStep('tracking');
  };

  const handleTryAgain = () => {
    setCurrentStep('payment');
  };

  const handleChangePayment = () => {
    setCurrentStep('payment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="flex-1 order-2 lg:order-1">
            {currentStep === 'shipping' && (
              <ShippingForm onSubmit={handleShippingSubmit} />
            )}
            {currentStep === 'payment' && (
              <PaymentForm
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                onSubmit={handlePaymentSubmit}
                onBack={() => setCurrentStep('shipping')}
                isProcessing={isProcessing}
              />
            )}
            {currentStep === 'success' && orderResponse && (
              <SuccessScreen
                order={orderResponse}
                onViewTracking={handleViewTracking}
              />
            )}
            {currentStep === 'failed' && orderResponse && (
              <FailedScreen
                order={orderResponse}
                onTryAgain={handleTryAgain}
                onChangePayment={handleChangePayment}
              />
            )}
            {currentStep === 'tracking' && orderResponse && (
              <TrackingScreen order={orderResponse} />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-96 order-1 lg:order-2 lg:mt-8">
            <OrderSidebar
              currentStep={currentStep}
              paymentMethod={paymentMethod}
              onPlaceOrder={handlePaymentSubmit}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
