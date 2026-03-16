import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/src/lib/mongodb';
import PurchaseModel from '@/src/models/Purchase'; // Naya model import kiya

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, noteId, userId } = await request.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      await dbConnect();
      
      // YAHAN HUM DATABASE MEIN SAVE KAR RAHE HAIN
      await PurchaseModel.create({
        userId: userId,
        noteId: noteId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });
      
      return NextResponse.json({ message: "Payment verified successfully", success: true }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Payment verification failed", success: false }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}