import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// GET - Fetch single user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const id = request.nextUrl.pathname.split('/').pop();
    const user = await User.findById(id)
      .select('-password')
      .populate('createdBy', 'username');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const id = request.nextUrl.pathname.split('/').pop();
    const body = await request.json();
    const { username, email, role, isActive } = body;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email or username is already taken by another user
    if (email !== user.email || username !== user.username) {
      const existingUser = await User.findOne({
        _id: { $ne: id },
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email or username already exists' },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email, role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error: unknown) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete user (set isActive to false)
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const id = request.nextUrl.pathname.split('/').pop();
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    const deletedUser = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');

    return NextResponse.json({ 
      message: 'User deleted successfully',
      user: deletedUser 
    });
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 