const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// User Schema (copying from the model)
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'sub-admin', 'manager', 'staff', 'customer-support'],
      message: 'Please select a valid role'
    },
    required: [true, 'Role is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.model('User', userSchema);

async function debugUser() {
  try {
    console.log('🔍 Starting user debug...');
    
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    const MONGODB_DB = process.env.MONGODB_DB || 'lms';
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName: MONGODB_DB,
    });
    console.log('✅ Connected to MongoDB successfully');

    // Find all users
    console.log('\n📋 All users in database:');
    const allUsers = await User.find({});
    console.log(`Found ${allUsers.length} users:`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. Username: "${user.username}", Email: "${user.email}", Role: "${user.role}", Active: ${user.isActive}`);
    });

    // Find admin user specifically
    console.log('\n🔍 Looking for admin user...');
    const adminUser = await User.findOne({
      $or: [
        { username: 'admin' },
        { email: 'admin@lms.com' }
      ]
    });

    if (!adminUser) {
      console.log('❌ No admin user found!');
      console.log('💡 Try running: npm run create-admin');
      return;
    }

    console.log('✅ Admin user found:');
    console.log(`   Username: "${adminUser.username}"`);
    console.log(`   Email: "${adminUser.email}"`);
    console.log(`   Role: "${adminUser.role}"`);
    console.log(`   Active: ${adminUser.isActive}`);
    console.log(`   Password Hash: ${adminUser.password.substring(0, 20)}...`);

    // Test password comparison
    console.log('\n🔐 Testing password comparison...');
    const testPasswords = ['Adminlms123', 'admin', 'password', 'Admin123'];
    
    for (const testPassword of testPasswords) {
      try {
        const isMatch = await adminUser.comparePassword(testPassword);
        console.log(`   "${testPassword}" → ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
      } catch (error) {
        console.log(`   "${testPassword}" → ❌ ERROR: ${error.message}`);
      }
    }

    // Test manual bcrypt comparison
    console.log('\n🧪 Manual bcrypt test with "Adminlms123":');
    try {
      const manualMatch = await bcrypt.compare('Adminlms123', adminUser.password);
      console.log(`   Manual bcrypt.compare result: ${manualMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    } catch (error) {
      console.log(`   Manual bcrypt error: ${error.message}`);
    }

    // Test login simulation
    console.log('\n🎭 Simulating login process...');
    const loginAttempts = [
      { username: 'admin', password: 'Adminlms123' },
      { username: 'admin@lms.com', password: 'Adminlms123' }
    ];

    for (const attempt of loginAttempts) {
      console.log(`\n   Testing login: "${attempt.username}" / "${attempt.password}"`);
      
      // Find user
      const user = await User.findOne({
        $or: [{ username: attempt.username }, { email: attempt.username }],
        isActive: true
      });

      if (!user) {
        console.log('   ❌ User not found');
        continue;
      }

      console.log(`   ✅ User found: ${user.username}`);
      
      // Check password
      const isValidPassword = await user.comparePassword(attempt.password);
      console.log(`   Password check: ${isValidPassword ? '✅ VALID' : '❌ INVALID'}`);
    }

  } catch (error) {
    console.error('❌ Error during debug:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Run the debug
debugUser().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Debug script failed:', error);
  process.exit(1);
}); 