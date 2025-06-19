import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// POST - Create initial admin user (only if no users exist)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Check if any users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      return NextResponse.json(
        { error: 'Users already exist. Setup is only allowed for initial installation.' },
        { status: 400 }
      );
    }

    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Create the first admin user
    const adminUser = new User({
      username,
      email,
      password, // Will be hashed by the pre-save middleware
      role: 'admin',
      createdBy: null // First user doesn't have a creator
    });

    await adminUser.save();

    // Set the createdBy field to self-reference for the admin user
    adminUser.createdBy = adminUser._id;
    await adminUser.save();

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}

// GET - Check if setup is needed
export async function GET() {
  try {
    await dbConnect();
    
    const userCount = await User.countDocuments();
    
    return NextResponse.json({
      setupRequired: userCount === 0,
      userCount
    });
  } catch (error: any) {
    console.error('Setup check error:', error);
    return NextResponse.json(
      { error: 'Failed to check setup status' },
      { status: 500 }
    );
  }
} 