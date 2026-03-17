import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import mongoose from 'mongoose';
import NoteModel from '@/src/models/Note';
import ClassModel from '@/src/models/Class';
import PurchaseModel from '@/src/models/Purchase';

// Hamesha taaza data (Live Revenue) laane ke liye
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    // 1. Total Notes & Classes Count
    const totalNotes = await NoteModel.countDocuments();
    const totalClasses = await ClassModel.countDocuments();

    // 2. Total Revenue Calculation
    const purchases = await PurchaseModel.find({}).populate('noteId', 'price');
    
    let totalRevenue = 0;
    let uniqueBuyers = new Set();

    purchases.forEach((purchase: any) => {
      // Har purchase mein jo Note hai, uska price jod lo
      if (purchase.noteId && purchase.noteId.price) {
        totalRevenue += purchase.noteId.price;
      }
      // Unique students count karne ke liye
      if (purchase.userId) uniqueBuyers.add(purchase.userId);
    });

    // 3. Total Students (Agar User model hai toh wahan se, warna unique buyers)
    let totalStudents = 0;
    if (mongoose.models.User) {
      totalStudents = await mongoose.models.User.countDocuments();
    } else {
      totalStudents = uniqueBuyers.size;
    }

    return NextResponse.json({
      totalStudents,
      totalNotes,
      totalClasses,
      totalRevenue
    }, { status: 200 });

  } catch (error: any) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}