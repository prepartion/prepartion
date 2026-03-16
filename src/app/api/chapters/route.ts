import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import ChapterModel from '@/src/models/Chapter';
import SubjectModel from '@/src/models/Subject'; // For population

export async function GET() {
  try {
    await dbConnect();
    // Populate se hume Subject ka naam aur uske andar ki Class/Stream ki details bhi mil jayengi
    const chapters = await ChapterModel.find({})
      .populate({
        path: 'subjectId',
        populate: [
          { path: 'classId', select: 'name hasStream' },
          { path: 'streamId', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 });
      
    return NextResponse.json({ chapters }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { name, subjectId } = await request.json();

    if (!name || !subjectId) {
      return NextResponse.json({ message: 'Chapter name and Subject are required' }, { status: 400 });
    }

    const newChapter = await ChapterModel.create({ name, subjectId });
    return NextResponse.json({ message: 'Chapter created successfully', chapter: newChapter }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { id, name, subjectId } = await request.json();

    if (!id || !name || !subjectId) {
      return NextResponse.json({ message: 'ID, Name, and Subject are required' }, { status: 400 });
    }

    const updatedChapter = await ChapterModel.findByIdAndUpdate(
      id, 
      { name, subjectId }, 
      { new: true }
    );
    
    return NextResponse.json({ message: 'Chapter updated', chapter: updatedChapter }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Chapter ID is required' }, { status: 400 });
    }

    await ChapterModel.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Chapter deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}