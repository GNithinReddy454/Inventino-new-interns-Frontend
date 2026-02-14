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

export default function CheckoutFlow() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleShippingSubmit = (address: ShippingAddress) => {
    setShippingAddress(address);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = async (paymentMethod: PaymentMethod, cardDetails?: any) => {
    if (!shippingAddress) return;

    setIsProcessing(true);
    try {
      const response = await placeOrder(shippingAddress, paymentMethod, cardDetails);
      setOrderResponse(response);
      
      if (response.status === 'success') {
        setCurrentStep('success');
      } else {
        setCurrentStep('failed');
      }
    } catch (error) {
      setCurrentStep('failed');
      setOrderResponse({
        orderId: '',
        orderNumber: '',
        orderDate: new Date().toISOString(),
        transactionId: '',
        paymentMethod: paymentMethod,
        totalAmount: 0,
        status: 'failed',
        errorCode: 'PAYMENT_DECLINED_4001',
        errorMessage: 'Insufficient funds or invalid card',
        shippingAddress: shippingAddress,
      });
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
