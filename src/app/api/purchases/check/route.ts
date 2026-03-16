import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import PurchaseModel from '@/src/models/Purchase';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { userId, noteId } = await request.json();

    if (!userId || !noteId) {
      return NextResponse.json({ hasPurchased: false }, { status: 400 });
    }

    const purchase = await PurchaseModel.findOne({ userId, noteId });
    
    // Agar purchase mil gayi matlab usne kharida hai (true), warna false
    return NextResponse.json({ hasPurchased: !!purchase }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}