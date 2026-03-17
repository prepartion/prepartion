import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import CouponModel from '@/src/models/Coupon';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { code } = await request.json();
    
    // Database mein check karo ki kya ye code exist karta hai aur active hai
    const coupon = await CouponModel.findOne({ 
      code: code.toUpperCase(), 
      isActive: true 
    });

    if (coupon) {
      return NextResponse.json({ 
        valid: true, 
        discountPercentage: coupon.discountPercentage 
      }, { status: 200 });
    } else {
      // 🌟 UPDATED MESSAGE
      return NextResponse.json({ 
        valid: false, 
        message: 'Invalid or expired coupon code on Prepartion.' 
      }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}