# 🚀 LMS v3 User Management - Quick Start Guide

## 📍 Login Page Location

The login page is available at: **http://localhost:3001/login**

## 🔧 Quick Setup

### 1. Environment Variables
Create a `.env.local` file in your project root:

```env
# Required
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key

# Optional (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 2. Create Admin User
Run this command to create the admin user:

```bash
npm run create-admin
```

This creates:
- **Email/Username**: `admin@lms.com` or `admin`
- **Password**: `Adminlms123`
- **Role**: `admin` (full access)

### 3. Login
1. Go to: http://localhost:3001/login
2. Enter: `admin@lms.com` or `admin`
3. Password: `Adminlms123`

## 🔐 Role-Based Access

### Dashboard Access by Role:
- ✅ **Admin**: Full access to dashboard
- ✅ **Sub Admin**: Full access to dashboard  
- ✅ **Manager**: Full access to dashboard
- ❌ **Staff**: No dashboard access (redirected to leads)
- ❌ **Customer Support**: No dashboard access (redirected to pipeline)

### Complete Role Permissions:

| Page | Admin | Sub Admin | Manager | Staff | Customer Support |
|------|-------|-----------|---------|-------|------------------|
| Dashboard | ✅ | ✅ | ✅ | ❌ | ❌ |
| Leads | ✅ | ✅ | ✅ | ✅ | ❌ |
| Add Leads | ✅ | ✅ | ✅ | ✅ | ❌ |
| Pipeline | ✅ | ✅ | ✅ | ✅ | ✅ |
| Follow Up | ✅ | ✅ | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ❌ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ |

## 👥 Managing Users

### Access User Management:
1. Login as **admin**
2. Go to **Settings** page
3. Click **Users** tab
4. Create, edit, or manage users

### Creating New Users:
1. Click "Add User" button
2. Fill in details:
   - Username (unique)
   - Email (unique) 
   - Password (auto-generate or custom)
   - Role (staff, customer-support, manager, sub-admin, admin)
3. User receives welcome email with login details

## 🛡️ Security Features

- **Route Protection**: Users redirected if no permission
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt encryption
- **Role-Based Navigation**: Sidebar shows only accessible pages
- **API Protection**: Endpoints check permissions

## 🔧 Troubleshooting

### Can't Access Dashboard?
- Check your user role
- Staff and Customer Support don't have dashboard access
- They're automatically redirected to accessible pages

### Forgot Admin Password?
```bash
# Delete existing admin and recreate
npm run create-admin
```

### Login Issues?
1. Check `.env.local` file exists
2. Verify `JWT_SECRET` is set
3. Ensure MongoDB connection works
4. Try creating admin user again

### Permission Denied?
- Each role has specific page access
- Check role permissions table above
- Admin can change user roles in Settings → Users

## 📱 Navigation

The sidebar automatically shows/hides menu items based on your role:
- **Red Crown**: Admin role
- **Orange Shield**: Sub Admin role  
- **Blue Briefcase**: Manager role
- **Green User**: Staff role
- **Purple Headphones**: Customer Support role

## 🚨 Important Notes

1. **First Time Setup**: Visit `/setup` if no admin exists
2. **Login Page**: Always at `/login` 
3. **Auto-Redirect**: Unauthorized users redirected automatically
4. **Admin Creation**: Use `npm run create-admin` command
5. **Role Management**: Only admins can create other admins

## 📞 Support

If you encounter issues:
1. Check console for error messages
2. Verify environment variables
3. Ensure MongoDB connection
4. Try recreating admin user 