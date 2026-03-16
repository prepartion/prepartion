import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import CouponModel from '@/src/models/Coupon';

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
    const { code, discountPercentage, expiryDate, isActive } = await request.json();

    if (!code || !discountPercentage) {
      return NextResponse.json({ message: 'Code and Discount Percentage are required' }, { status: 400 });
    }

    const newCoupon = await CouponModel.create({ 
      code: code.toUpperCase(), 
      discountPercentage, 
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      isActive 
    });
    
    return NextResponse.json({ message: 'Coupon created successfully', coupon: newCoupon }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) return NextResponse.json({ message: 'This Coupon code already exists' }, { status: 409 });
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { id, code, discountPercentage, expiryDate, isActive } = await request.json();

    if (!id || !code) return NextResponse.json({ message: 'ID and Code are required' }, { status: 400 });

    const updatedCoupon = await CouponModel.findByIdAndUpdate(
      id, 
      { 
        code: code.toUpperCase(), 
        discountPercentage, 
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive 
      }, 
      { new: true }
    );
    
    return NextResponse.json({ message: 'Coupon updated', coupon: updatedCoupon }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'Coupon ID is required' }, { status: 400 });

    await CouponModel.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Coupon deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}