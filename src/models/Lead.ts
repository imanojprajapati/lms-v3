import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  visaType: { 
    type: String, 
    required: [true, 'Visa type is required'],
    trim: true,
    enum: {
      values: ['Student', 'Work', 'Tourist', 'Business', 'Family', 'Other'],
      message: 'Please select a valid visa type'
    }
  },
  destinationCountry: { 
    type: String, 
    required: [true, 'Destination country is required'],
    trim: true,
    maxlength: [50, 'Country name cannot exceed 50 characters']
  },
  city: {
    type: String,
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters']
  },
  state: {
    type: String,
    trim: true,
    maxlength: [50, 'State name cannot exceed 50 characters']
  },
  country: {
    type: String,
    trim: true,
    maxlength: [50, 'Country name cannot exceed 50 characters']
  },
  status: { 
    type: String, 
    enum: {
      values: ['New', 'Contacted', 'Interested', 'Converted', 'Lost'],
      message: 'Please select a valid status'
    },
    default: 'New'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
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
leadSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Update the updatedAt field before updating
leadSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Create indexes for better performance (email index is already created by unique: true)
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ destinationCountry: 1 });
leadSchema.index({ country: 1 });
leadSchema.index({ city: 1 });

const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);

export default Lead;
