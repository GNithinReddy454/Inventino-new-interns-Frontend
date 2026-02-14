'use client';

import { Button } from './ui/button';
import { OrderResponse } from '@/lib/types';
import { Package, CheckCircle2, Truck, MapPin, Home, Lock } from 'lucide-react';

interface TrackingScreenProps {
  order: OrderResponse;
}

export function TrackingScreen({ order }: TrackingScreenProps) {
  const trackingSteps = [
    {
      status: 'Confirmed',
      completed: true,
      icon: CheckCircle2,
    },
    {
      status: 'Packed',
      completed: true,
      icon: Package,
    },
    {
      status: 'Shipped',
      completed: true,
      icon: Truck,
    },
    {
      status: 'Delivered',
      completed: false,
      icon: Home,
    },
  ];

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
            <p className="text-xs font-medium text-green-600 mt-2">Information</p>
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
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2" style={{ zIndex: 0 }}>
            <div className="h-full bg-gradient-to-r from-green-500 via-green-500 to-pink-500" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 mb-4">
          <Package className="h-8 w-8 text-pink-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Track Your Bracelet 📦
        </h1>
        <p className="text-gray-600 text-sm">Order #{order.orderNumber}</p>
      </div>

      {/* Tracking Info */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div>
            <p className="text-xs text-gray-600 mb-1">Courier</p>
            <p className="font-semibold text-gray-900">{order.courier || 'BlueDart'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Tracking ID</p>
            <p className="font-semibold text-gray-900 font-mono text-sm">
              {order.trackingNumber || 'BD0938475621'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Estimated Delivery</p>
            <p className="font-semibold text-pink-600">
              {order.estimatedDelivery || '12 Feb 2026'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div
            className="absolute left-6 top-0 w-0.5 bg-pink-500 transition-all duration-500"
            style={{ height: '66.67%' }}
          />

          {/* Steps */}
          <div className="space-y-8">
            {trackingSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      step.completed
                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p
                      className={`font-semibold ${
                        step.completed ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.status}
                    </p>
                    {index === trackingSteps.findIndex((s) => !s.completed) && (
                      <p className="text-xs text-pink-600 font-medium mt-1">
                        In progress
                      </p>
                    )}
                  </div>

                  {/* Checkmark for completed */}
                  {step.completed && (
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-pink-500" />
          Shipping Address
        </h3>
        <div className="text-sm space-y-1 text-gray-600">
          <p className="font-medium text-gray-900">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </p>
          <p>{order.shippingAddress.streetAddress}</p>
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
            {order.shippingAddress.zipCode}
          </p>
          <p>{order.shippingAddress.country}</p>
          <p className="pt-2">Phone: {order.shippingAddress.phone}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => window.location.href = '/'}
          className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-6 text-base font-semibold rounded-lg shadow-lg shadow-pink-500/30"
        >
          Back to Home
        </Button>

        <Button
          variant="outline"
          onClick={() => window.location.href = '/support'}
          className="flex-1 border-pink-200 text-pink-600 hover:bg-pink-50 py-6"
        >
          Contact Support
        </Button>
      </div>
    </div>
  );
}
