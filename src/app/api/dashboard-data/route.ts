import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb'; 

// Caching Fix
export const dynamic = 'force-dynamic';

// Saare models load karna zaroori hai taaki populate fail na ho
import ClassModel from '@/src/models/Class';
import StreamModel from '@/src/models/Stream';
import SubjectModel from '@/src/models/Subject';
import NoteModel from '@/src/models/Note';
import '@/src/models/Chapter';

export async function GET() {
  try {
    await dbConnect();

    // 🚨 MAGIC: 4 alag API calls ko ek hi connection mein combine kar diya!
    const [classes, streams, subjects, notes] = await Promise.all([
      ClassModel.find({}).lean(),
      StreamModel.find({}).lean(),
      SubjectModel.find({}).lean(),
      NoteModel.find({})
        .populate('classId', 'name hasStream')
        .populate('streamId', 'name')
        .populate('subjectId', 'name')
        .populate('chapterId', 'name')
        .sort({ createdAt: -1 })
        .lean()
    ]);

    return NextResponse.json({
      classes,
      streams,
      subjects,
      notes
    }, { status: 200 });

  } catch (error: any) {
    console.error("Master Dashboard API Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}