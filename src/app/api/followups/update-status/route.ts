import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Followup from "@/models/Followup";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.leadId || !body.status) {
      return NextResponse.json(
        { success: false, error: 'leadId and status are required' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Update all followups for this lead with the new status
    const result = await Followup.updateMany(
      { leadId: body.leadId },
      { 
        status: body.status,
        updatedAt: new Date()
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${result.modifiedCount} followups`,
      data: { 
        leadId: body.leadId,
        status: body.status,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error: unknown) {
    console.error('Error updating followup statuses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update followup statuses' },
      { status: 500 }
    );
  }
} 