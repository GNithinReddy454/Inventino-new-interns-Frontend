import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shippingAddress, paymentMethod, cardDetails } = body;

    // For Cash on Delivery, place order immediately without payment processing
    if (paymentMethod === 'cod') {
      const orderNumber = `4RN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const orderId = `order_${Date.now()}`;

      return NextResponse.json({
        orderId,
        orderNumber,
        orderDate: new Date().toISOString(),
        transactionId: 'COD-' + Date.now(),
        paymentMethod,
        totalAmount: 161.96,
        status: 'success',
        shippingAddress,
        trackingNumber: 'BD' + Math.floor(1000000000 + Math.random() * 9000000000),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        courier: 'BlueDart',
        codMessage: 'Your order has been placed successfully! Pay cash upon delivery.',
      });
    }

    // For other payment methods, simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate 20% failure rate for demo purposes (only for card payments)
    const shouldFail = paymentMethod === 'card' && Math.random() < 0.2;

    if (shouldFail) {
      return NextResponse.json(
        {
          orderId: '',
          orderNumber: '',
          orderDate: new Date().toISOString(),
          transactionId: '',
          paymentMethod,
          totalAmount: 161.96,
          status: 'failed',
          errorCode: 'PAYMENT_DECLINED_4001',
          errorMessage: 'Insufficient funds or invalid card',
          shippingAddress,
        },
        { status: 200 }
      );
    }

    // Success response for other payment methods
    const orderNumber = `4RN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = `order_${Date.now()}`;
    const transactionId = `TXN${Date.now()}`;

    return NextResponse.json({
      orderId,
      orderNumber,
      orderDate: new Date().toISOString(),
      transactionId,
      paymentMethod,
      totalAmount: 161.96,
      status: 'success',
      shippingAddress,
      trackingNumber: 'BD' + Math.floor(1000000000 + Math.random() * 9000000000),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      courier: 'BlueDart',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    );
  }
}
