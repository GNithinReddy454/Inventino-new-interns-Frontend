import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount } = body;

    // Validate amount field presence
    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(Number(amount));

    // Razorpay minimum is 100 paise (₹1)
    if (amountInPaise < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise (₹1)" },
        { status: 400 }
      );
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { error: "Razorpay credentials not found in environment variables" },
        { status: 500 }
      );
    }

    // Use official Razorpay SDK
    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    return NextResponse.json({
      order_id: order.id,
      ...order,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);

    // Handle Razorpay API auth failures
    if (error?.statusCode === 401) {
      return NextResponse.json(
        { error: "Razorpay authentication failed. Check your credentials." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error?.error?.description || "Internal server error" },
      { status: 500 }
    );
  }
}

