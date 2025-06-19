import mongoose from 'mongoose';

const followupSchema = new mongoose.Schema({
  leadId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true 
  },
  title: { type: String, required: true },
  nextFollowupDate: { type: Date, required: true },
  communicationMethod: { type: String, required: true },
  priority: { 
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Interested', 'Converted', 'Lost'],
    default: 'New'
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Followup = mongoose.models.Followup || mongoose.model('Followup', followupSchema);

export default Followup;
