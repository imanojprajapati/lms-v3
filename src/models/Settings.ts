import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  companyName: { 
    type: String, 
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  contactEmail: { 
    type: String, 
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  phone: { 
    type: String, 
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  notificationPreferences: {
    emailNotifications: { type: Boolean, default: true },
    notificationEmail: { 
      type: String, 
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid notification email address']
    }
  },
  appearance: {
    darkMode: { type: Boolean, default: false }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
settingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Update the updatedAt field before updating
settingsSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

export default Settings;
