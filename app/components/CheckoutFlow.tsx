"use client";

import { useState } from "react";
import { ShippingForm } from "./ShippingForm";
import { PaymentForm } from "./PaymentForm";
import { OrderReview } from "./OrderReview";
import { SuccessScreen } from "./SuccessScreen";
import { FailedScreen } from "./FailedScreen";
import { TrackingScreen } from "./TrackingScreen";
import { OrderSidebar } from "./OrderSidebar";
import { cartService } from "@/services/cart.service";
import { orderService } from "@/services/order.service";
import { addressService } from "@/services/address.service";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchCart } from "@/redux/cartslice";
import { placeOrderAction, resetOrderState, fetchOrderByIdAction } from "@/redux/orderslice";
import {
  CheckoutStep,
  ShippingAddress,
  PaymentMethod,
  OrderResponse,
} from "@/lib/types";
import { useEffect } from "react";

export default function CheckoutFlow() {
  const dispatch = useAppDispatch();
  const { totalAmount, items: cartItems = [], promoCode: appliedCode, discount: currentDiscount } = useAppSelector((state) => state.cart);
  const { isLoading: isOrderProcessing, error: orderError } = useAppSelector((state) => state.order);

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(
    null,
  );
  const [localIsProcessing, setLocalIsProcessing] = useState(false);

  // Combine processing states
  const isProcessing = localIsProcessing || isOrderProcessing;

  // 1. Load razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    // Initial cart fetch if needed
    dispatch(fetchCart());

    return () => {
      dispatch(resetOrderState());
    };
  }, [dispatch]);

  const handleShippingSubmit = (address: ShippingAddress) => {
    setShippingAddress(address);
    setCurrentStep("payment");
  };

  const handlePaymentSubmit = (
    method: PaymentMethod,
    details?: any,
  ) => {
    setPaymentMethod(method);
    if (details) setCardDetails(details);
    setCurrentStep("review");
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress) return;

    setLocalIsProcessing(true);
    try {
      // 1. Ensure address is saved and we have an addressId
      let addressId = shippingAddress._id;
      if (!addressId) {
        const addrResponse = await addressService.addAddress(shippingAddress);
        addressId = addrResponse.data?._id;
        if (addressId) {
          setShippingAddress({ ...shippingAddress, _id: addressId });
        }
      }

      // 2. COD flow
      if (paymentMethod === "cod") {
        const resultAction = await dispatch(placeOrderAction({
          addressId: addressId!,
          items: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            color: item.color || undefined,
            size: item.size || undefined,
          })),
          paymentMethod: "COD",
          promoCode: appliedCode,
          code: appliedCode,
          promo_code: appliedCode,
          subtotal: cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
          discount: currentDiscount,
          total: totalAmount,
        }));

        if (placeOrderAction.fulfilled.match(resultAction)) {
          const orderRes = resultAction.payload;
          const orderKey = orderRes.data.orderNumber || orderRes.data._id;
          if (orderKey && appliedCode) {
            const saved = JSON.parse(localStorage.getItem('order_discounts') || '{}');
            saved[orderKey] = 10;
            localStorage.setItem('order_discounts', JSON.stringify(saved));
          }
          setOrderResponse({
            status: "success",
            orderId: orderRes.data._id || orderRes.data.orderNumber,
            orderNumber: orderRes.data.orderNumber,
            orderDate: orderRes.data.createdAt || new Date().toISOString(),
            totalAmount: orderRes.data.total || totalAmount,
            paymentMethod: "cod",
            shippingAddress: shippingAddress,
            trackingNumber: "TRK-" + Math.floor(Math.random() * 1000000),
            estimatedDelivery: "5-7 Days",
          });
          setCurrentStep("success");
        } else {
          throw new Error(resultAction.payload as string || "Failed to place order");
        }
        setLocalIsProcessing(false);
        return;
      }

      // 3. Online Payment (Razorpay)
      if (!(window as any).Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      // const amountInPaise = Math.round(totalAmount * 1);
      const amountInPaise = 100; // 1 Rupee in paise

      const rzpOrderResp = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInPaise }),
      });
      const rzpOrderData = await rzpOrderResp.json();

      if (!rzpOrderResp.ok) {
        throw new Error(rzpOrderData.error || "Failed to create Razorpay order");
      }

      // Capture current values in closure variables to prevent stale state
      const capturedAddressId = addressId!;
      const capturedItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        color: item.color || undefined,
        size: item.size || undefined,
      }));
      const capturedPaymentMethod = paymentMethod;
      const capturedTotalAmount = totalAmount;
      const capturedShippingAddress = shippingAddress;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: "INR",
        order_id: rzpOrderData.id,
        name: "Inventino Jewels",
        description: "Order Payment",
        handler: async function (response: any) {
          try {
            console.log("Creating order in database...");
            const resultAction = await dispatch(placeOrderAction({
              addressId: capturedAddressId,
              items: capturedItems,
              paymentMethod: capturedPaymentMethod.toUpperCase(),
              promoCode: appliedCode,
              code: appliedCode,
              promo_code: appliedCode,
              subtotal: capturedItems.reduce((acc, item) => acc + (item.quantity * (cartItems.find(ci => ci.productId === item.productId)?.price || 0)), 0),
              discount: currentDiscount,
              total: totalAmount,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }));

            console.log("placeOrderAction result:", resultAction);

            if (placeOrderAction.fulfilled.match(resultAction)) {
              const orderRes = resultAction.payload;
              const dbOrderId = orderRes.data?._id || orderRes.data?.id;

              console.log("Verifying payment signature for order:", dbOrderId);
              // Verify payment against the newly created DB order ID
              await orderService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: dbOrderId, // Use DB Order ID
              });

              console.log("Fetching final order status...");
              // Fulfill "use and show order api" requirement
              const finalOrderAction = await dispatch(fetchOrderByIdAction(dbOrderId));
               const finalOrder = fetchOrderByIdAction.fulfilled.match(finalOrderAction) 
                ? finalOrderAction.payload.data || finalOrderAction.payload
                : orderRes.data;

              const orderKey = finalOrder?.orderNumber || orderRes.data?.orderNumber || dbOrderId;
              if (orderKey && appliedCode) {
                const saved = JSON.parse(localStorage.getItem('order_discounts') || '{}');
                saved[orderKey] = 10;
                localStorage.setItem('order_discounts', JSON.stringify(saved));
              }

              setOrderResponse({
                status: "success",
                orderId: dbOrderId || response.razorpay_payment_id,
                orderNumber: finalOrder?.orderNumber || orderRes.data?.orderNumber || "N/A",
                orderDate: finalOrder?.createdAt || orderRes.data?.createdAt || new Date().toISOString(),
                transactionId: response.razorpay_payment_id,
                paymentMethod: capturedPaymentMethod,
                totalAmount: finalOrder?.total || orderRes.data?.total || capturedTotalAmount,
                shippingAddress: capturedShippingAddress!,
                trackingNumber: finalOrder?.trackingNumber || "TRK-" + Math.floor(Math.random() * 1000000),
                estimatedDelivery: "3-5 Days",
              });
              setCurrentStep("success");
            } else {
              const errorMsg = (resultAction as any).payload || (resultAction as any).error?.message || "Order creation failed";
              console.error("Order creation rejected:", errorMsg);
              setOrderResponse({
                status: "failed",
                orderId: "",
                orderNumber: "",
                orderDate: new Date().toISOString(),
                totalAmount: capturedTotalAmount,
                paymentMethod: capturedPaymentMethod,
                shippingAddress: capturedShippingAddress!,
                transactionId: response.razorpay_payment_id,
                errorMessage: String(errorMsg),
              });
              setCurrentStep("failed");
            }
          } catch (err: any) {
            console.error("Payment verification or order creation failed:", err);
            setOrderResponse({
              status: "failed",
              orderId: "",
              orderNumber: "",
              orderDate: new Date().toISOString(),
              totalAmount: capturedTotalAmount,
              paymentMethod: capturedPaymentMethod,
              shippingAddress: capturedShippingAddress!,
              transactionId: response.razorpay_payment_id,
              errorMessage: err?.message || "Unknown error during order verification/creation",
            });
            setCurrentStep("failed");
          } finally {
            setLocalIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLocalIsProcessing(false);
          },
        },
        theme: {
          color: "#ec4899",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment failed:", error);
      setLocalIsProcessing(false);
    }
  };

  const handleViewTracking = () => {
    setCurrentStep("tracking");
  };

  const handleTryAgain = () => {
    setCurrentStep("payment");
  };

  const handleChangePayment = () => {
    setCurrentStep("payment");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="flex-1 order-2 lg:order-1">
            {currentStep === "shipping" && (
              <ShippingForm onSubmit={handleShippingSubmit} />
            )}
            {currentStep === "payment" && (
              <PaymentForm
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                onSubmit={handlePaymentSubmit}
                onBack={() => setCurrentStep("shipping")}
                isProcessing={isProcessing}
              />
            )}
            {currentStep === "review" && (
              <OrderReview
                address={shippingAddress}
                paymentMethod={paymentMethod}
                cardDetails={cardDetails}
                onPlaceOrder={handlePlaceOrder}
                onBack={() => setCurrentStep("payment")}
                isProcessing={isProcessing}
              />
            )}
            {currentStep === "success" && orderResponse && (
              <SuccessScreen
                order={orderResponse}
                onViewTracking={handleViewTracking}
              />
            )}
            {currentStep === "failed" && orderResponse && (
              <FailedScreen
                order={orderResponse}
                onTryAgain={handleTryAgain}
                onChangePayment={handleChangePayment}
              />
            )}
            {currentStep === "tracking" && orderResponse && (
              <TrackingScreen order={orderResponse} />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-96 order-1 lg:order-2 lg:mt-8">
            <OrderSidebar
              currentStep={currentStep}
              paymentMethod={paymentMethod}
              onPlaceOrder={currentStep === "review" ? handlePlaceOrder : (currentStep === "payment" && paymentMethod === "cod" ? handlePlaceOrder : () => { })}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
