import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Lead from "@/models/Lead";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop();
  
  // Validate ObjectId format
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid lead ID' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const lead = await Lead.findById(id);
    
    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop();
  
  // Validate ObjectId format
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid lead ID' },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    
    // Check if this is a status-only update (from followup form)
    const isStatusOnlyUpdate = Object.keys(body).length === 1 && body.status;
    
    if (!isStatusOnlyUpdate) {
      // Full update validation - require all fields
      const requiredFields = ['name', 'email', 'phone', 'visaType', 'destinationCountry'];
      for (const field of requiredFields) {
        if (!body[field] || body[field].trim() === '') {
          return NextResponse.json(
            { success: false, error: `${field} is required` },
            { status: 400 }
          );
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    await dbConnect();

    let updateData;
    
    if (isStatusOnlyUpdate) {
      // Status-only update
      updateData = {
        status: body.status,
        updatedAt: new Date()
      };
    } else {
      // Full update
      updateData = {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone.trim(),
        visaType: body.visaType.trim(),
        destinationCountry: body.destinationCountry.trim(),
        city: body.city ? body.city.trim() : undefined,
        state: body.state ? body.state.trim() : undefined,
        country: body.country ? body.country.trim() : undefined,
        status: body.status,
        notes: body.notes || '',
        updatedAt: new Date()
      };
    }

    const lead = await Lead.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: lead });
  } catch (error: unknown) {
    console.error('Error updating lead:', error);
    
    // Handle duplicate email error
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop();
  
  // Validate ObjectId format
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid lead ID' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    
    // First, check if the lead exists
    const lead = await Lead.findById(id);
    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Delete associated followups first
    const Followup = (await import('@/models/Followup')).default;
    const followupDeleteResult = await Followup.deleteMany({ leadId: id });
    
    // Then delete the lead
    await Lead.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true, 
      message: 'Lead and associated followups deleted successfully',
      data: { 
        id: lead._id,
        name: lead.name,
        deletedFollowups: followupDeleteResult.deletedCount
      }
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
