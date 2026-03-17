import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import PurchaseModel from '@/src/models/Purchase';
import '@/src/models/Note'; 
import '@/src/models/Class'; 
import '@/src/models/Subject'; 

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // URL se page number aur limit nikalna (Default: Page 1, Limit 10)
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Kitne records chhodne hain (Skip logic)
    const skip = (page - 1) * limit;

    // Database se data nikalna with Pagination
    const purchases = await PurchaseModel.find({})
      .populate({
        path: 'noteId',
        select: 'title price thumbnailUrl classId subjectId',
        populate: [
          { path: 'classId', select: 'name' },
          { path: 'subjectId', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 }) // Sabse nayi payment sabse upar
      .skip(skip)
      .limit(limit);

    // Total kitni payments hui hain aaj tak
    const totalPurchases = await PurchaseModel.countDocuments();
    
    // Kya aur bhi records baaki hain?
    const hasMore = totalPurchases > (skip + purchases.length);

    return NextResponse.json({ 
      purchases, 
      hasMore, 
      totalPurchases 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Admin Purchases Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}