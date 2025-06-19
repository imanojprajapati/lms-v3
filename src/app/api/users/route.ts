import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import nodemailer from 'nodemailer';

// GET - Fetch all users
export async function GET() {
  try {
    await dbConnect();
    
    const users = await User.find({ isActive: true })
      .select('-password')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error: unknown) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { username, email, password, role, createdBy } = body;

    // Validate required fields
    if (!username || !email || !password || !role || !createdBy) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password, // Will be hashed by the pre-save middleware
      role,
      createdBy
    });

    await newUser.save();

    // Send email notification
    await sendWelcomeEmail(email, username, password, role);

    // Return user without password
    const userResponse = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt
    };

    return NextResponse.json({ user: userResponse }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// Function to send welcome email
async function sendWelcomeEmail(email: string, username: string, password: string, role: string) {
  try {
    // Create transporter (you'll need to configure this with your email service)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || process.env.GMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Define role permissions for email
    const rolePermissions = {
      admin: 'Full access to all pages including Dashboard, Leads, Add Leads, Pipeline, Follow Up, Search, Settings',
      'sub-admin': 'Access to Dashboard, Leads, Add Leads, Pipeline, Follow Up, Search, Settings',
      manager: 'Access to Dashboard, Leads, Add Leads, Pipeline, Follow Up, Search',
      staff: 'Access to Leads, Add Leads, Pipeline, Follow Up, Search',
      'customer-support': 'Access to Pipeline, Follow Up, Search'
    };

    const emailContent = `
      <h2>Welcome to LMS v3!</h2>
      <p>Dear ${username},</p>
      <p>Your account has been created successfully. Here are your login details:</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
      </div>
      
      <p><strong>Your Access Permissions:</strong></p>
      <p>${rolePermissions[role as keyof typeof rolePermissions]}</p>
      
      <p>Please login at: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/login">${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/login</a></p>
      
      <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
      
      <p>Best regards,<br>LMS v3 Team</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@lms.com',
      to: email,
      subject: 'Welcome to LMS v3 - Your Account Details',
      html: emailContent,
    });

    console.log('Welcome email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw error as user creation should succeed even if email fails
  }
} 