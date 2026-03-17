import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb'; 
import ClassModel from '@/src/models/Class'; // 🚨 Path Fix

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const classes = await ClassModel.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ classes }, { status: 200 });
  } catch (error: any) {
    console.error("Classes GET Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { name, hasStream } = await request.json();

    if (!name) return NextResponse.json({ message: 'Class name is required' }, { status: 400 });

    const newClass = await ClassModel.create({ name, hasStream });
    return NextResponse.json({ message: 'Class created successfully', class: newClass }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) return NextResponse.json({ message: 'This class already exists' }, { status: 409 });
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { id, name, hasStream } = await request.json();

    if (!id || !name) return NextResponse.json({ message: 'ID and Name are required' }, { status: 400 });

    const updatedClass = await ClassModel.findByIdAndUpdate(
      id, { name, hasStream }, { new: true }
    );
    return NextResponse.json({ message: 'Class updated', class: updatedClass }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'Class ID is required' }, { status: 400 });

    await ClassModel.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Class deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}