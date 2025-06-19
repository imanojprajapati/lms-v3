import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Followup from "@/models/Followup";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get leadId from query parameters
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    
    // Build query - filter by leadId if provided
    const query = leadId ? { leadId } : {};
    
    const followups = await Followup.find(query)
      .populate('leadId', 'name email phone')
      .sort({ nextFollowupDate: 1 });
      
    return NextResponse.json({ success: true, data: followups });
  } catch (error) {
    console.error('Error fetching followups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch followups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['leadId', 'title', 'nextFollowupDate', 'communicationMethod', 'priority'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    await dbConnect();
    
    const followup = await Followup.create({
      leadId: body.leadId,
      title: body.title.trim(),
      nextFollowupDate: new Date(body.nextFollowupDate),
      communicationMethod: body.communicationMethod,
      priority: body.priority,
      status: body.status || 'New',
      notes: body.notes?.trim() || ''
    });

    const populatedFollowup = await Followup.findById(followup._id)
      .populate('leadId', 'name email phone');

    return NextResponse.json({ success: true, data: populatedFollowup }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating followup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create followup' },
      { status: 500 }
    );
  }
}
