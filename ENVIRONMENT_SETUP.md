# Environment Setup Guide

## Issue Resolution: Login Credentials & Email Configuration

### 🔐 **Login Credentials**
The "Invalid credentials" error occurs because you need to use the correct login credentials:

**Admin Login Details:**
- **Username/Email**: `admin@lms.com` OR `admin`
- **Password**: `Adminlms123`
- **URL**: http://localhost:3001/login

### 📧 **Email Configuration Fix**
The Gmail credentials you provided are for SMTP email sending, not login authentication.

### 🛠️ **Environment Variables Setup**

Create a `.env.local` file in your project root with the following content:

```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string_here
MONGODB_DB=lms

# JWT Secret for authentication (make this long and random)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-at-least-32-characters

# SMTP Configuration for sending emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=visitrackoffical@gmail.com
SMTP_PASS=ojadmobcwskreljt
SMTP_FROM=visitrackoffical@gmail.com

# App URL for email links
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 🔧 **Step-by-Step Fix**

1. **Create `.env.local` file** in your project root directory
2. **Copy the environment variables** from above
3. **Replace `your_mongodb_connection_string_here`** with your actual MongoDB URI
4. **Generate a strong JWT secret** (at least 32 characters)
5. **Restart your development server**: `npm run dev`

### 🎯 **Login Process**

1. Go to: http://localhost:3001/login
2. Enter:
   - **Username**: `admin` OR `admin@lms.com`
   - **Password**: `Adminlms123`
3. Click "Sign In"

### 📝 **Common Issues & Solutions**

#### Issue 1: "Invalid credentials"
- **Cause**: Using wrong username/password
- **Solution**: Use `admin` / `Adminlms123`

#### Issue 2: "Failed to connect to database"
- **Cause**: Missing or incorrect MONGODB_URI
- **Solution**: Add your MongoDB connection string to `.env.local`

#### Issue 3: "JWT error"
- **Cause**: Missing JWT_SECRET
- **Solution**: Add a strong JWT secret to `.env.local`

#### Issue 4: Email sending errors
- **Cause**: Missing SMTP configuration
- **Solution**: Add the SMTP variables to `.env.local`

### 🔒 **Security Notes**

1. **Never commit `.env.local`** to version control (it's already in .gitignore)
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Use Gmail App Passwords** instead of regular passwords for SMTP
4. **Keep your environment variables secure**

### 🚀 **Quick Test**

After setting up `.env.local`:

1. Stop your dev server (`Ctrl+C`)
2. Start it again: `npm run dev`
3. Go to login page
4. Use admin credentials
5. Should login successfully

### 📞 **Need Help?**

If you're still having issues:
1. Check your MongoDB connection is working
2. Verify your `.env.local` file has all required variables
3. Make sure there are no typos in the credentials
4. Check the browser console for any JavaScript errors 