import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Settings from "@/models/Settings";

export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne();
    
    // If no settings exist, create default ones
    if (!settings) {
      settings = await Settings.create({
        companyName: "",
        contactEmail: "",
        phone: "",
        notificationPreferences: {
          emailNotifications: true,
          notificationEmail: "",
        },
        appearance: {
          darkMode: false,
        },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    await dbConnect();
    
    // Update or create settings (upsert)
    const settings = await Settings.findOneAndUpdate(
      {},
      {
        companyName: body.companyName?.trim() || "",
        contactEmail: body.contactEmail?.trim() || "",
        phone: body.phone?.trim() || "",
        notificationPreferences: {
          emailNotifications: body.notificationPreferences?.emailNotifications ?? true,
          notificationEmail: body.notificationPreferences?.notificationEmail?.trim() || "",
        },
        appearance: {
          darkMode: body.appearance?.darkMode ?? false,
        },
        updatedAt: new Date()
      },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: settings });
  } catch (error: unknown) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
