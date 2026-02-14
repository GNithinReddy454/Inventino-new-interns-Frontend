import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    // Mock promo code validation
    const validCodes: Record<string, number> = {
      SAVE10: 10,
      SAVE20: 20,
      WELCOME: 15,
    };

    if (validCodes[code.toUpperCase()]) {
      return NextResponse.json({
        success: true,
        discount: validCodes[code.toUpperCase()],
        message: `${validCodes[code.toUpperCase()]}% discount applied!`,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid promo code' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to apply promo code' },
      { status: 500 }
    );
  }
}
