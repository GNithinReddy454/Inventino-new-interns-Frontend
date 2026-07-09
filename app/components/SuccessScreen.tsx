"use client";

import { Button } from "./ui/button";
import { OrderResponse } from "@/lib/types";
import { CheckCircle2, Package, MapPin, Truck, Lock } from "lucide-react";

interface SuccessScreenProps {
  order: OrderResponse;
  onViewTracking: () => void;
  items?: any[];
  subtotal?: number;
  discount?: number;
}

export function SuccessScreen({
  order,
  onViewTracking,
  items = [],
  subtotal,
  discount,
}: SuccessScreenProps) {
  const isCOD = order.paymentMethod === "cod";

  const trackingSteps = [
    {
      status: "Confirmed",
      completed: true,
      icon: CheckCircle2,
    },
    {
      status: "Packed",
      completed: false,
      icon: Package,
    },
    {
      status: "Shipped",
      completed: false,
      icon: Truck,
    },
    {
      status: "Delivered",
      completed: false,
      icon: MapPin,
    },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide Navbar, Footer, BackToTop and scrollbars */
          header, footer, nav, button, .no-print, [class*="back-to-top"] {
            display: none !important;
          }
          
          /* Force body background white and clear margins */
          body, html {
            background-color: #ffffff !important;
            background-image: none !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
          }

          /* Remove container shadow and border */
          #printable-invoice {
            display: block !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}} />
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 print:hidden">
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
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold shadow-md">
              ✓
            </div>
            <p className="text-xs font-medium text-green-600 mt-2">Payment</p>
          </div>

          {/* Complete - Step 4 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-semibold shadow-md">
              ✓
            </div>
            <p className="text-xs font-medium text-pink-600 mt-2">Complete</p>
          </div>

          {/* Progress Line */}
          <div
            className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2"
            style={{ zIndex: 0 }}
          >
            <div
              className="h-full bg-gradient-to-r from-green-500 via-green-500 to-pink-500"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* Success Icon */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 mb-4">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {isCOD ? "ORDER PLACED SUCCESSFULLY! 🎉" : "PAYMENT SUCCESSFUL! ❤️"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {isCOD
            ? "Thank you for choosing Thread of Hope. Your order will be delivered soon. Pay cash upon delivery."
            : "Thank you for choosing Thread of Hope. Your bracelet is being prepared with love."}
        </p>
        {isCOD && order.codMessage && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              💰 {order.codMessage}
            </p>
          </div>
        )}
      </div>

      {/* Order Details */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 mb-6 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Order Number</span>
          <span className="font-semibold text-gray-900">
            {order.orderNumber}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Order Date</span>
          <span className="font-semibold text-gray-900">
            {new Date(order.orderDate).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Payment Method</span>
          <span className="font-semibold text-gray-900 capitalize">
            {isCOD
              ? "Cash on Delivery"
              : order.paymentMethod === "card"
                ? `Visa •••• 4242`
                : order.paymentMethod}
          </span>
        </div>
        {!isCOD && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Transaction ID</span>
            <span className="font-mono text-xs text-gray-700">
              {order.transactionId}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center pt-3 border-t border-pink-200">
          <span className="text-sm text-gray-600">
            {isCOD ? "Amount (Pay on Delivery)" : "Amount Paid"}
          </span>
          <span className="text-xl font-bold text-pink-600">
            ₹{(order.totalAmount || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {isCOD && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">💵</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">
                Cash on Delivery Instructions
              </h3>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>
                  • Please keep exact cash ready: ₹
                  {(order.totalAmount || 0).toFixed(2)}
                </li>
                <li>• Payment accepted in cash only at the time of delivery</li>
                <li>• You can inspect the product before payment</li>
                <li>• Our delivery partner will provide a receipt</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Order Tracking Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-pink-500" />
          Track Your Order
        </h2>

        {/* Tracking Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center sm:text-left">
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Courier</p>
            <p className="font-semibold text-gray-900">
              {order.courier || "BlueDart"}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Tracking ID</p>
            <p className="font-semibold text-gray-900 font-mono text-sm">
              {order.trackingNumber}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Estimated Delivery</p>
            <p className="font-semibold text-pink-600">
              {order.estimatedDelivery}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div
            className="absolute left-4 top-0 w-0.5 bg-pink-500 transition-all duration-500"
            style={{ height: "0%" }}
          />

          {/* Steps */}
          <div className="space-y-6">
            {trackingSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${step.completed
                        ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30"
                        : "bg-gray-200 text-gray-400"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p
                      className={`font-semibold text-sm ${step.completed ? "text-gray-900" : "text-gray-400"
                        }`}
                    >
                      {step.status}
                    </p>
                    {index === 0 && step.completed && (
                      <p className="text-xs text-pink-600 font-medium mt-0.5">
                        Order confirmed
                      </p>
                    )}
                  </div>

                  {/* Checkmark for completed */}
                  {step.completed && (
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-pink-500" />
          Delivery Address
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
          <p className="font-medium text-gray-900">
            {order.shippingAddress.fullName || `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}
          </p>
          <p className="text-gray-600">{order.shippingAddress.street || order.shippingAddress.streetAddress}</p>
          <p className="text-gray-600">
            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
            {order.shippingAddress.pincode || order.shippingAddress.zipCode}
          </p>
          <p className="text-gray-600">{order.shippingAddress.country}</p>
          <p className="text-gray-600">Phone: {order.shippingAddress.phone}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => (window.location.href = "/")}
          className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-6 text-base font-semibold rounded-lg shadow-lg shadow-pink-500/30"
        >
          Continue Shopping
        </Button>

        <Button
          variant="outline"
          onClick={() => window.print()}
          className="flex-1 border-pink-200 text-pink-600 hover:bg-pink-50 py-6"
        >
          <Package className="mr-2 h-5 w-5" />
          Print Receipt
        </Button>
      </div>
    </div>

    {/* Printable Invoice */}
    <div id="printable-invoice" className="hidden print:block p-8 bg-white text-gray-900 font-sans w-full max-w-4xl mx-auto border border-gray-200 rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">INVENTINO JEWELS</h1>
          <p className="text-sm text-gray-500 mt-1">Premium Handcrafted Bracelets & Luxury Jewelry</p>
          <p className="text-xs text-gray-400 mt-2">Email: hr@ggstinnovations.com</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900 uppercase">Invoice</h2>
          <p className="text-sm text-gray-600 mt-1">Invoice #: {order.orderNumber}</p>
          <p className="text-sm text-gray-600">Date: {new Date(order.orderDate).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric"
          })}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed & Shipped To</h3>
          <p className="text-sm font-semibold text-gray-800">
            {order.shippingAddress.fullName || `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {order.shippingAddress.street || order.shippingAddress.streetAddress}
          </p>
          <p className="text-sm text-gray-600">
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode || order.shippingAddress.zipCode}
          </p>
          <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
          <p className="text-sm text-gray-600 mt-2">Phone: {order.shippingAddress.phone}</p>
          {order.shippingAddress.email && (
            <p className="text-sm text-gray-600">Email: {order.shippingAddress.email}</p>
          )}
        </div>
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Details</h3>
          <p className="text-sm text-gray-800 font-semibold">
            Payment Method: <span className="capitalize">{isCOD ? "Cash on Delivery" : order.paymentMethod}</span>
          </p>
          {order.transactionId && (
            <p className="text-sm text-gray-600 mt-1 font-mono text-xs">
              Transaction ID: {order.transactionId}
            </p>
          )}
          {order.trackingNumber && (
            <p className="text-sm text-gray-600 mt-1">
              Tracking ID: {order.trackingNumber}
            </p>
          )}
          {order.estimatedDelivery && (
            <p className="text-sm text-gray-600 mt-1">
              Estimated Delivery: {order.estimatedDelivery}
            </p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Item Description</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Options</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Qty</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Price</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item, idx) => {
              const name = item.name || item.product?.name || "Product";
              const price = Number(item.price || item.product?.price || 0);
              const qty = Number(item.quantity || 1);
              const variantParts = [];
              if (item.color) variantParts.push(`Color: ${item.color}`);
              if (item.size) variantParts.push(`Size: ${item.size}`);
              const variantDesc = variantParts.join(" | ") || "—";

              return (
                <tr key={idx} className="text-sm">
                  <td className="px-4 py-3 font-medium text-gray-900">{name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{variantDesc}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{qty}</td>
                  <td className="px-4 py-3 text-right text-gray-700">₹{price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">₹{(price * qty).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2.5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{(subtotal || order.totalAmount || 0).toFixed(2)}</span>
          </div>
          {discount ? (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Discount</span>
              <span>-₹{Number(discount).toFixed(2)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span className="text-green-600 font-medium">FREE</span>
          </div>
          <div className="flex justify-between text-gray-600 border-t border-gray-100 pt-2">
            <span>Tax</span>
            <span>₹0.00</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2">
            <span>Total Paid</span>
            <span>₹{(order.totalAmount || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
        <p className="font-semibold text-gray-500 mb-1">Thank you for your purchase!</p>
        <p>This is a computer-generated invoice and does not require a physical signature.</p>
        <p className="mt-1">For support, please contact us at hr@ggstinnovations.com</p>
      </div>
    </div>
  </>
  );
}
