import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import ClassModel from '@/src/models/Class';
import SubjectModel from '@/src/models/Subject';
import NoteModel from '@/src/models/Note';
import UserModel from '@/src/models/User';

export const dynamic = 'force-dynamic'; // Taki hamesha fresh data aaye

export async function GET() {
  try {
    await dbConnect();
    
    // Ek sath 4 query chalayenge time bachane ke liye
    const [totalClasses, totalSubjects, totalNotes, totalUsers] = await Promise.all([
      ClassModel.countDocuments(),
      SubjectModel.countDocuments(),
      NoteModel.countDocuments(),
      UserModel.countDocuments(),
    ]);

    return NextResponse.json({ 
      totalClasses,
      totalSubjects,
      totalNotes,
      totalUsers,
      totalRevenue: 0 // Abhi isko 0 rakhte hain, jab Payment Gateway lagega tab isko active karenge
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}