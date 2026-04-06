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
import { clearBuyNowProduct } from "@/redux/buyNowSlice";
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
  const { totalAmount: cartTotal, items: cartItems = [], promoCode: appliedCode, discount: currentDiscount } = useAppSelector((state) => state.cart);
  const { product: buyNowProduct } = useAppSelector((state) => state.buyNow);
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

  // Derive active items and totals based on buyNow flow
  const itemsToOrder = buyNowProduct 
    ? [{ 
        productId: buyNowProduct.productId, 
        quantity: buyNowProduct.quantity, 
        color: buyNowProduct.color, 
        size: buyNowProduct.size, 
        price: buyNowProduct.product?.price || 0,
        name: buyNowProduct.product?.name || "Product"
      }] 
    : cartItems;

  const orderSubtotal = Number(itemsToOrder.reduce((acc, item: any) => acc + (Number(item.pricing?.price || item.price || item.product?.price || 0) * Number(item.quantity || 1)), 0));
  const orderTotal = buyNowProduct ? Math.max(0, orderSubtotal - Number(currentDiscount || 0)) : Number(cartTotal || 0);

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
      // Step 1: Ensure address is saved and we have an addressId
      let addressId = shippingAddress._id;
      if (!addressId) {
        const addrResponse = await addressService.addAddress(shippingAddress);
        addressId = addrResponse.data?._id;
        if (addressId) {
          setShippingAddress({ ...shippingAddress, _id: addressId });
        }
      }

      // Prepare order details for common fields
      const orderPayload = {
        addressId: addressId!,
        items: itemsToOrder.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color || null,
          size: item.size || undefined,
        })),
        promoCode: appliedCode,
        code: appliedCode,
        promo_code: appliedCode,
        subtotal: orderSubtotal,
        discount: currentDiscount,
        total: orderTotal,
      };

      // Handle COD Flow (Step 1 is same, but no payment creation)
      if (paymentMethod === "cod") {
        const resultAction = await dispatch(placeOrderAction({
          ...orderPayload,
          paymentMethod: "COD",
        }));

        if (placeOrderAction.fulfilled.match(resultAction)) {
          const orderRes = resultAction.payload;
          setOrderResponse({
            status: "success",
            orderId: orderRes.data?._id || orderRes.data?.orderNumber,
            orderNumber: orderRes.data?.orderNumber || "N/A",
            orderDate: orderRes.data?.createdAt || new Date().toISOString(),
            totalAmount: orderRes.data?.total || orderTotal,
            paymentMethod: "cod",
            shippingAddress: shippingAddress,
            trackingNumber: orderRes.data?.trackingNumber || "TBD",
            estimatedDelivery: "5-7 Days",
          });
          setCurrentStep("success");
          // Clear cart after success
          if (buyNowProduct) {
            dispatch(clearBuyNowProduct());
          } else {
            await cartService.clearCart();
          }
          dispatch(fetchCart());
        } else {
          throw new Error(resultAction.payload as string || "Failed to place order");
        }
        setLocalIsProcessing(false);
        return;
      }

      // Secure Online Flow (Steps 1 through 5)
      
      // Step 1: Place Order (Create Order in Database)
      const resultAction = await dispatch(placeOrderAction({
        ...orderPayload,
        paymentMethod: "CARD",
      }));

      if (placeOrderAction.rejected.match(resultAction)) {
        throw new Error(resultAction.payload as string || "Failed to create order");
      }

      const orderRes = resultAction.payload;
      const dbOrderId = orderRes.data?._id || orderRes.data?.id;

      if (!dbOrderId) {
        throw new Error("Failed to retrieve order ID from database");
      }

      // Step 2: Create Razorpay Order (Send orderId to Backend)
      console.group("🚀 Payment Flow - Step 2: Create Razorpay Order");
      console.log("Input Order ID:", dbOrderId);
      const rzpServiceResp = await orderService.createRazorpayOrder(dbOrderId);
      console.log("Full Backend Response:", rzpServiceResp);

      const rzpData = rzpServiceResp.data || rzpServiceResp;
      const { razorpayOrderId, amount: rzpAmount, currency } = rzpData;

      console.log("Extracted Razorpay Data:", { razorpayOrderId, rzpAmount, currency });
      console.groupEnd();

      if (!razorpayOrderId) {
        throw new Error("Razorpay Order ID missing from backend response");
      }

      if (!(window as any).Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please check your internet connection.");
      }

      // Step 3: Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpAmount,
        currency: currency || "INR",
        order_id: razorpayOrderId,
        name: "Inventino Jewels",
        description: "Payment for Order " + (orderRes.data?.orderNumber || dbOrderId),
        handler: async function (response: any) {
          try {
            setLocalIsProcessing(true);
            
            // Step 4: Verify Payment (Send Payment Details to Backend)
            console.group("💳 Payment Flow - Step 4: Verify Payment");
            console.log("Razorpay Response:", response);
            
            const verificationResult = await orderService.verifyPayment({
              razorpay_order_id: razorpayOrderId, // Use the ID from backend, not response
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: dbOrderId,
            });
            console.log("Verification Result:", verificationResult);
            console.groupEnd();

            // Step 5: Show Success to the User
            const finalOrderAction = await dispatch(fetchOrderByIdAction(dbOrderId));
            const finalOrder = fetchOrderByIdAction.fulfilled.match(finalOrderAction) 
              ? finalOrderAction.payload.data || finalOrderAction.payload
              : orderRes.data;

            setOrderResponse({
              status: "success",
              orderId: dbOrderId,
              orderNumber: finalOrder?.orderNumber || orderRes.data?.orderNumber || "N/A",
              orderDate: finalOrder?.createdAt || orderRes.data?.createdAt || new Date().toISOString(),
              transactionId: response.razorpay_payment_id,
              paymentMethod: "card",
              totalAmount: finalOrder?.total || orderRes.data?.total || orderTotal,
              shippingAddress: shippingAddress!,
              trackingNumber: finalOrder?.trackingNumber || "TBD",
              estimatedDelivery: "3-5 Days",
            });
            setCurrentStep("success");
            
            // Clear cart/buyNow
            if (buyNowProduct) {
              dispatch(clearBuyNowProduct());
            } else {
              await cartService.clearCart();
            }
            dispatch(fetchCart());
          } catch (err: any) {
            console.error("Payment verification failed:", err);
            setOrderResponse({
              status: "failed",
              orderId: dbOrderId,
              orderNumber: orderRes.data?.orderNumber || "N/A",
              orderDate: orderRes.data?.createdAt || new Date().toISOString(),
              errorMessage: err?.message || "Payment verification failed. Please contact support.",
              totalAmount: orderTotal,
              paymentMethod: "card",
              shippingAddress: shippingAddress!,
            });

            setCurrentStep("failed");
          } finally {
            setLocalIsProcessing(false);
          }
        },
        prefill: {
          name: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').name : "",
          email: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').email : "",
          contact: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').phone : "",
        },
        theme: {
          color: "#ec4899",
        },
        modal: {
          ondismiss: function () {
            setLocalIsProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error("Checkout process failed:", error);
      // Show failure if order creation failed or Razorpay failed to open
      setOrderResponse({
        status: "failed",
        orderId: "",
        orderNumber: "N/A",
        orderDate: new Date().toISOString(),
        errorMessage: error?.message || "Something went wrong during checkout",
        totalAmount: orderTotal,
        paymentMethod: paymentMethod,
        shippingAddress: shippingAddress!,
      });

      setCurrentStep("failed");
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
              orderResponse={orderResponse}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
