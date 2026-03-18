import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb'; 

// 🚨 Caching Fix
export const dynamic = 'force-dynamic';

// 🚨 Path Fix: Sabme @/src/ lagaya hai taaki module not found error na aaye
import NoteModel from '@/src/models/Note';
import '@/src/models/Chapter';
import '@/src/models/Subject';
import '@/src/models/Class';
import '@/src/models/Stream';

// ==========================================
// 1. GET API
// ==========================================
export async function GET() {
  try {
    await dbConnect();
    const notes = await NoteModel.find({})
      .populate('classId', 'name hasStream')
      .populate('streamId', 'name')
      .populate('subjectId', 'name')
      .populate('chapterId', 'name')
      .sort({ createdAt: -1 })
      .lean();
      
    return NextResponse.json({ notes }, { status: 200 });
  } catch (error: any) {
    console.error("Notes GET Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ==========================================
// 2. POST API
// ==========================================
export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    if (!data.title || !data.classId || !data.subjectId || !data.pdfUrl || !data.thumbnailUrl) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const finalChapterId = data.chapterId === "BUNDLE" ? undefined : data.chapterId;

    const newNote = await NoteModel.create({
      title: data.title,
      description: data.description,
      classId: data.classId,
      streamId: data.streamId || undefined,
      subjectId: data.subjectId,
      chapterId: finalChapterId,
      isFree: data.isFree,
      price: data.isFree ? 0 : data.price,
      originalPrice: data.isFree ? 0 : data.originalPrice,
      pdfUrl: data.pdfUrl,
      thumbnailUrl: data.thumbnailUrl
    });

    return NextResponse.json({ message: 'Note uploaded successfully', note: newNote }, { status: 201 });
  } catch (error: any) {
    console.error("Notes POST Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ==========================================
// 3. PUT API
// ==========================================
export async function PUT(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    if (!data.id) return NextResponse.json({ message: 'Note ID is required' }, { status: 400 });

    const finalChapterId = data.chapterId === "BUNDLE" ? null : data.chapterId;

    const updatedNote = await NoteModel.findByIdAndUpdate(
      data.id, 
      {
        title: data.title,
        description: data.description,
        classId: data.classId,
        streamId: data.streamId || undefined,
        subjectId: data.subjectId,
        chapterId: finalChapterId,
        isFree: data.isFree,
        price: data.isFree ? 0 : data.price,
        originalPrice: data.isFree ? 0 : data.originalPrice,
        pdfUrl: data.pdfUrl,
        thumbnailUrl: data.thumbnailUrl
      }, 
      { new: true }
    );
    
    return NextResponse.json({ message: 'Note updated', note: updatedNote }, { status: 200 });
  } catch (error: any) {
    console.error("Notes PUT Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ==========================================
// 4. DELETE API
// ==========================================
export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'Note ID is required' }, { status: 400 });

    await NoteModel.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Note deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error("Notes DELETE Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}