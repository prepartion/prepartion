import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import CouponModel from '@/src/models/Coupon';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const coupons = await CouponModel.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ coupons }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { code, discountPercentage } = await request.json();
    
    if (!code || !discountPercentage) {
      return NextResponse.json({ message: 'Code and Discount are required' }, { status: 400 });
    }

    const newCoupon = await CouponModel.create({ 
      code: code.toUpperCase(), 
      discountPercentage 
    });
    // 🌟 UPDATED MESSAGE
    return NextResponse.json({ message: 'Prepartion Coupon created', coupon: newCoupon }, { status: 201 });
  } catch (error: any) {
    // 🌟 UPDATED MESSAGE
    if (error.code === 11000) return NextResponse.json({ message: 'This Prepartion Coupon code already exists' }, { status: 409 });
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    await CouponModel.findByIdAndDelete(id);
    // 🌟 UPDATED MESSAGE
    return NextResponse.json({ message: 'Prepartion Coupon deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}