import mongoose from 'mongoose';

const lostFoundSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    location: {
      type: String,
      required: [true, 'Please provide the location'],
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: [true, 'Please specify if item is lost or found'],
    },
    status: {
      type: String,
      enum: ['Open', 'Claimed', 'Returned'],
      default: 'Open',
    },
    contactInfo: {
      type: String,
      required: [true, 'Please provide contact information'],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search functionality
lostFoundSchema.index({ title: 'text', description: 'text', location: 'text' });

export default mongoose.model('LostFound', lostFoundSchema);
