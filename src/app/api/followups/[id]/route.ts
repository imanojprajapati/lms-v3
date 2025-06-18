import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Followup from "@/models/Followup";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop();
  
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid followup ID' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const followup = await Followup.findById(id).populate('leadId', 'name email phone');
    
    if (!followup) {
      return NextResponse.json(
        { success: false, error: 'Followup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: followup });
  } catch (error) {
    console.error('Error fetching followup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch followup' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop();
  
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid followup ID' },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    
    // Validate required fields
    const requiredFields = ['leadId', 'title', 'nextFollowupDate', 'communicationMethod', 'priority', 'status'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    await dbConnect();

    const followup = await Followup.findByIdAndUpdate(
      id,
      {
        leadId: body.leadId,
        title: body.title.trim(),
        nextFollowupDate: new Date(body.nextFollowupDate),
        communicationMethod: body.communicationMethod,
        priority: body.priority,
        status: body.status,
        notes: body.notes?.trim() || '',
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('leadId', 'name email phone');

    if (!followup) {
      return NextResponse.json(
        { success: false, error: 'Followup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: followup });
  } catch (error: unknown) {
    console.error('Error updating followup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update followup' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop();
  
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid followup ID' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const followup = await Followup.findByIdAndDelete(id);

    if (!followup) {
      return NextResponse.json(
        { success: false, error: 'Followup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Followup deleted successfully',
      data: { id: followup._id }
    });
  } catch (error) {
    console.error('Error deleting followup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete followup' },
      { status: 500 }
    );
  }
}
