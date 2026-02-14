import { NextResponse } from 'next/server';

export async function GET() {
  // Mock order summary
  const summary = {
    subtotal: 104.97,
    shipping: 0,
    tax: 12.60,
    discount: 0,
    total: 161.96,
  };

  return NextResponse.json(summary);
}
