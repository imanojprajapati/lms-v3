# LMS v3 User Management System Setup Guide

## Overview

This document provides instructions for setting up and using the comprehensive user management system in LMS v3. The system includes role-based access control, email notifications, and protected routes.

## Features

### 🔐 Role-Based Access Control
- **Admin**: Full access to all pages including user management
- **Sub Admin**: Access to all pages except user management
- **Manager**: Dashboard, Leads, Add Leads, Pipeline, Follow Up, Search
- **Staff**: Leads, Add Leads, Pipeline, Follow Up, Search
- **Customer Support**: Pipeline, Follow Up, Search

### 📧 Email Notifications
- Automatic welcome emails when users are created
- Login credentials and role permissions included in emails

### 🛡️ Route Protection
- Automatic redirection for unauthorized access
- Role-based navigation filtering
- Protected API endpoints

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
MONGODB_DB=lms

# JWT Secret Key (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (optional - for user welcome emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Initial Setup

### 1. Install Dependencies

The required dependencies are already included in package.json:
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT authentication
- `nodemailer`: Email functionality

### 2. First Time Setup

1. Start your application: `npm run dev`
2. Visit `/setup` in your browser
3. Create your first administrator account
4. Login with your admin credentials

### 3. Email Configuration (Optional)

For Gmail SMTP:
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password (not your regular password)
3. Use the App Password in the `SMTP_PASS` environment variable

## User Management

### Creating Users

1. Login as an admin user
2. Go to Settings → Users tab
3. Click "Add User"
4. Fill in the user details:
   - Username (unique)
   - Email (unique)
   - Password (auto-generated or custom)
   - Role (staff, customer-support, manager, sub-admin, admin)
5. The user will receive a welcome email with login details

### Managing Users

- **View Users**: See all active users with their roles and creation dates
- **Edit Users**: Update username, email, role, and active status
- **Delete Users**: Soft delete (deactivate) users
- **Role Restrictions**: Only admins can create other admin users

### Role Permissions

| Feature | Admin | Sub Admin | Manager | Staff | Customer Support |
|---------|-------|-----------|---------|-------|------------------|
| Dashboard | ✅ | ✅ | ✅ | ❌ | ❌ |
| Leads | ✅ | ✅ | ✅ | ✅ | ❌ |
| Add Leads | ✅ | ✅ | ✅ | ✅ | ❌ |
| Pipeline | ✅ | ✅ | ✅ | ✅ | ✅ |
| Follow Up | ✅ | ✅ | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ❌ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### User Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get single user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Soft delete user

### Setup
- `GET /api/setup` - Check if setup is required
- `POST /api/setup` - Create initial admin user

## Global Context

The `UserContext` provides global state management:

```tsx
import { useUser } from '@/contexts/UserContext';

function MyComponent() {
  const { user, hasPermission, logout } = useUser();
  
  // Check if user has specific permissions
  if (hasPermission(['user-management'])) {
    // Show admin features
  }
  
  return (
    <div>
      <p>Welcome, {user?.username}!</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

## Route Protection

Routes are automatically protected based on user roles. The `RouteProtection` component handles:
- Authentication checks
- Permission validation
- Automatic redirects

### Adding New Protected Routes

Update the `ROUTE_PERMISSIONS` object in `src/components/RouteProtection.tsx`:

```tsx
const ROUTE_PERMISSIONS = {
  '/dashboard': ['dashboard'],
  '/leads': ['leads'],
  '/new-feature': ['new-permission'],
  // Add your routes here
};
```

## Components

### UserManagement
Main component for user administration (Settings → Users tab)

### RouteProtection
Wrapper component that protects routes based on user permissions

### Sidebar
Updated to show role-based navigation and user info

## Troubleshooting

### Common Issues

1. **Cannot access user management**: Ensure you're logged in as an admin user
2. **Email not sending**: Check SMTP configuration and credentials
3. **Route access denied**: Verify user role has required permissions
4. **Setup page not showing**: Clear browser cache and ensure no users exist in database

### Database Issues

If you need to reset the system:
1. Delete all documents from the `users` collection in MongoDB
2. Visit `/setup` to create a new admin user

### Email Issues

- Gmail: Use App Password, not regular password
- Other providers: Check SMTP settings and port numbers
- Firewall: Ensure SMTP ports are not blocked

## Security Considerations

- JWT tokens expire after 7 days
- Passwords are hashed using bcrypt
- HTTP-only cookies for token storage
- Route-level permission checks
- API endpoint protection

## Development

### Adding New Roles

1. Update the `UserRole` type in `src/contexts/UserContext.tsx`
2. Add role permissions to `ROLE_PERMISSIONS`
3. Update role colors and icons in components
4. Add role to User model enum values

### Adding New Permissions

1. Add permission to role definitions in `UserContext`
2. Update route protection mappings
3. Add UI checks where needed

## Support

For issues with the user management system:
1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure MongoDB connection is working
4. Check that all required dependencies are installed

## Migration

If upgrading from a version without user management:
1. Run `npm install` to install new dependencies
2. Add required environment variables
3. Visit `/setup` to create your first admin user
4. Existing data will be preserved 