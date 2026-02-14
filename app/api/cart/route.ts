import { NextResponse } from 'next/server';

export async function GET() {
  // Mock cart data
  const cart = [
    {
      id: '1',
      name: 'Rose Bracelet',
      price: 34.99,
      quantity: 1,
      color: 'Rose Gold',
      size: 'M',
    },
    {
      id: '2',
      name: 'Rose Bracelet',
      price: 34.99,
      quantity: 2,
      color: 'Sage Green',
      size: 'L',
    },
    {
      id: '3',
      name: 'Rose Bracelet',
      price: 34.99,
      quantity: 1,
      color: 'Honey Yellow',
      size: 'S',
    },
  ];

  return NextResponse.json(cart);
}
