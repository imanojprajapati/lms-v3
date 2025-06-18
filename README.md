# LMS v3 - Lead Management System

A modern, professional Lead Management System built with Next.js 15, TypeScript, Tailwind CSS, and MongoDB Atlas. Designed specifically for visa consultants and immigration services.

## ✨ Features

### 🎨 **Modern Professional UI**
- Clean, responsive design with shadcn/ui components
- Professional color schemes and typography
- Smooth animations and micro-interactions
- Mobile-first responsive design
- Dark mode support (coming soon)

### 📊 **Comprehensive Dashboard**
- Real-time analytics and lead statistics
- Interactive charts with Recharts
- Lead conversion tracking
- Performance metrics visualization
- Quick action buttons and navigation

### 👥 **Advanced Lead Management**
- **Full CRUD Operations**: Create, Read, Update, Delete leads
- **Smart Search & Filter**: Multi-field search with advanced filtering
- **Status Tracking**: Track leads through 5 stages (New → Contacted → Interested → Converted → Lost)
- **Lead Details**: Comprehensive lead profiles with contact information
- **Notes System**: Add and manage notes for each lead
- **Bulk Operations**: Handle multiple leads efficiently

### 🔄 **Sales Pipeline**
- **Kanban Board**: Visual pipeline with drag-and-drop functionality
- **Stage Management**: Track leads through sales stages
- **Performance Insights**: Monitor conversion rates and bottlenecks
- **Quick Actions**: Update lead status with one click
- **Pipeline Analytics**: Understand your sales flow

### 📅 **Follow-up Management**
- **Schedule Follow-ups**: Never miss an important contact
- **Priority System**: High, Medium, Low priority levels
- **Overdue Tracking**: Identify missed follow-ups
- **Communication Methods**: Phone, Email, Meeting options
- **Smart Notifications**: Get notified about upcoming follow-ups

### 🔍 **Powerful Search**
- **Global Search**: Find leads across all fields
- **Advanced Filters**: Filter by status, visa type, country, priority
- **Real-time Results**: Instant search results as you type
- **Export Options**: Export filtered results (coming soon)

### ⚙️ **Settings & Configuration**
- **Company Settings**: Configure company information
- **Notification Preferences**: Manage email notifications
- **User Preferences**: Customize your experience
- **Data Management**: Import/Export capabilities (coming soon)

### 🔐 **Data Security & Validation**
- **Input Validation**: Comprehensive form validation
- **Data Sanitization**: Clean and secure data handling
- **Error Handling**: Graceful error management with user feedback
- **Database Indexing**: Optimized database performance

## 🛠 Tech Stack

### **Frontend**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Tailwind Animate

### **Backend**
- **API**: Next.js API Routes
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Validation**: Zod schemas
- **Authentication**: NextAuth.js (coming soon)

### **Development**
- **Type Safety**: Full TypeScript coverage
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **Testing**: Jest + React Testing Library (coming soon)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd lms-v3
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Update `.env.local` with your MongoDB connection string:
```bash
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/?retryWrites=true&w=majority&appName=YourCluster
MONGODB_DB=lms
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 📁 Project Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── api/                # API routes
│   │   ├── leads/          # Lead CRUD operations
│   │   ├── followups/      # Follow-up management
│   │   └── settings/       # Application settings
│   ├── dashboard/          # Main dashboard
│   ├── leads/             # Lead management pages
│   │   ├── [id]/          # Individual lead pages
│   │   └── add/           # Add new lead
│   ├── pipeline/          # Sales pipeline view
│   ├── followup/          # Follow-up management
│   ├── search/            # Advanced search
│   ├── settings/          # Application settings
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── LeadChart.tsx     # Chart component
│   └── Sidebar.tsx       # Navigation sidebar
├── hooks/                # Custom React hooks
│   └── use-toast.ts      # Toast notification hook
├── lib/                  # Utility functions
│   ├── db.ts            # Database connection
│   └── utils.ts         # Helper functions
└── models/               # Mongoose models
    ├── Lead.ts          # Lead schema
    ├── Followup.ts      # Follow-up schema
    └── Settings.ts      # Settings schema
```

## 🔌 API Endpoints

### **Leads Management**
```
GET    /api/leads           # Get all leads
POST   /api/leads           # Create a new lead
GET    /api/leads/[id]      # Get a specific lead
PUT    /api/leads/[id]      # Update a lead
DELETE /api/leads/[id]      # Delete a lead
```

### **Follow-ups Management**
```
GET    /api/followups       # Get all follow-ups
POST   /api/followups       # Create a new follow-up
GET    /api/followups/[id]  # Get a specific follow-up
PUT    /api/followups/[id]  # Update a follow-up
DELETE /api/followups/[id]  # Delete a follow-up
```

### **Settings Management**
```
GET    /api/settings        # Get application settings
PUT    /api/settings        # Update application settings
```

## 🗄️ Database Schema

### **Lead Model**
```typescript
{
  name: string (required, max 100 chars),
  email: string (required, unique, validated),
  phone: string (required, max 20 chars),
  visaType: enum ['Student', 'Work', 'Tourist', 'Business', 'Family', 'Other'],
  destinationCountry: string (required, max 50 chars),
  status: enum ['New', 'Contacted', 'Interested', 'Converted', 'Lost'],
  notes: string (optional, max 1000 chars),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### **Follow-up Model**
```typescript
{
  leadId: ObjectId (ref: Lead),
  title: string (required),
  nextFollowupDate: Date (required),
  communicationMethod: string (required),
  priority: enum ['low', 'medium', 'high'],
  status: enum ['New', 'Contacted', 'Interested', 'Converted', 'Lost'],
  notes: string (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### **Settings Model**
```typescript
{
  companyName: string (optional, max 100 chars),
  contactEmail: string (optional, validated),
  phone: string (optional, max 20 chars),
  notificationPreferences: {
    emailNotifications: boolean,
    notificationEmail: string (validated)
  },
  appearance: {
    darkMode: boolean
  },
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## 🎯 Key Features Implemented

### ✅ **Professional UI/UX**
- Modern, clean design with consistent branding
- Responsive layout that works on all devices
- Professional color schemes and typography
- Smooth animations and loading states
- Error handling with user-friendly messages

### ✅ **Complete CRUD Operations**
- **Create**: Add new leads with form validation
- **Read**: View leads list and individual details
- **Update**: Edit lead information with real-time updates
- **Delete**: Remove leads with confirmation dialogs

### ✅ **Advanced Data Management**
- Real-time search across multiple fields
- Advanced filtering by status, type, country
- Sorting and pagination capabilities
- Data validation and sanitization
- Error handling and user feedback

### ✅ **Business Logic**
- Lead status progression tracking
- Follow-up scheduling and management
- Priority-based task organization
- Performance analytics and reporting

### ✅ **Developer Experience**
- Full TypeScript coverage for type safety
- Comprehensive error handling
- Clean, maintainable code structure
- Extensive documentation
- Environment-based configuration

## 📋 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🚀 Deployment

### **Vercel Deployment**
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### **Manual Deployment**
1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

## 🔧 Configuration

### **Environment Variables**
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB`: Database name
- `NODE_ENV`: Environment (development/production)
- `NEXTAUTH_URL`: Application URL
- `NEXTAUTH_SECRET`: Authentication secret

### **Database Indexes**
The application automatically creates optimized indexes for:
- Email uniqueness
- Status filtering
- Creation date sorting
- Country grouping

## 🎨 Design System

### **Colors**
- Primary: Blue (#3B82F6)
- Secondary: Gray (#6B7280)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)

### **Typography**
- Font Family: Inter (Google Fonts)
- Headings: Semibold with tight letter spacing
- Body: Regular with optimized line height

### **Components**
All UI components follow shadcn/ui design principles with:
- Consistent spacing and sizing
- Accessible color contrasts
- Keyboard navigation support
- Mobile-optimized interactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Provide steps to reproduce any bugs
4. Include your environment details

## 🚧 Roadmap

### **Phase 1: Core Features** ✅
- ✅ Lead Management System
- ✅ Professional UI/UX Design
- ✅ Database Integration
- ✅ API Development
- ✅ Search & Filter Functionality

### **Phase 2: Advanced Features** (Coming Soon)
- 🔄 User Authentication & Authorization
- 🔄 Email Templates & Automation
- 🔄 File Upload & Document Management
- 🔄 Advanced Reporting & Analytics
- 🔄 Data Export/Import Capabilities

### **Phase 3: Enterprise Features** (Future)
- 🔄 Multi-user Support & Permissions
- 🔄 API Integrations (CRM, Email services)
- 🔄 Advanced Workflow Automation
- 🔄 Custom Fields & Forms
- 🔄 Mobile Application

---

**Built with ❤️ for the visa consulting industry**
