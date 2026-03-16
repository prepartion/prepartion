import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import PurchaseModel from '@/src/models/Purchase';
import NoteModel from '@/src/models/Note'; 
import '@/src/models/Subject'; 
import '@/src/models/Class'; 

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Database se is user ki saari purchases nikalenge, aur uske andar 'noteId' ka pura data bhar (populate) denge
    const purchases = await PurchaseModel.find({ userId })
      .populate({
        path: 'noteId',
        populate: [
          { path: 'subjectId', select: 'name' },
          { path: 'classId', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 });

    // Sirf actual notes ko alag nikal lenge ek array mein
    const myNotes = purchases.map(p => p.noteId).filter(note => note != null);

    return NextResponse.json({ notes: myNotes }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}