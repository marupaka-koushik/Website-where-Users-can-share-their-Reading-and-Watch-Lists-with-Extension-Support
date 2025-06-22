const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [500, 'Title cannot exceed 500 characters']
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  siteName: {
    type: String,
    required: true,
    trim: true
  },
  source: {
    type: String,
    enum: ['youtube', 'article', 'basic', 'unknown'],
    default: 'unknown'
  },
  
  // User who saved this content
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // YouTube specific fields
  videoId: {
    type: String,
    sparse: true // Only for YouTube content
  },
  channel: {
    type: String,
    trim: true
  },
  
  // Content metadata
  wordCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // in minutes
    default: 0
  },
  
  // AI Summary (now the primary content for privacy)
  summary: {
    text: {
      type: String,
      required: [true, 'Summary is required for privacy-first mode'],
      minlength: [10, 'Summary must be at least 10 characters'],
      maxlength: [5000, 'Summary cannot exceed 5,000 characters']
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    model: {
      type: String, // e.g., 'local-llama', 'fallback', 'gpt-3.5-turbo'
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'not_requested', 'ai_failed', 'too_short', 'fallback_smart', 'generation_failed', 'local_generated'],
      default: 'local_generated'
    },
    wordCount: {
      type: Number,
      default: 0
    },
    originalLength: {
      type: Number, // Word count of original content (never stored)
      default: 0
    },
    processingNote: {
      type: String // For any additional processing info
    }
  },
  
  // Privacy settings
  isPrivacyMode: {
    type: Boolean,
    default: true // Default to privacy mode
  },
  
  // Tags and categories
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    enum: ['technology', 'science', 'business', 'entertainment', 'education', 'news', 'other'],
    default: 'other'
  },
  
  // Privacy settings
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Engagement
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Additional metadata
  extractedAt: {
    type: Date,
    default: Date.now
  },
  language: {
    type: String,
    default: 'en'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
contentSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Calculate word count and reading time before saving
contentSchema.pre('save', function(next) {
  if (this.content) {
    // Calculate word count
    this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;
    
    // Calculate reading time (average 200 words per minute)
    this.readingTime = Math.ceil(this.wordCount / 200);
  }
  
  next();
});

// Index for efficient queries
contentSchema.index({ user: 1, createdAt: -1 });
contentSchema.index({ siteName: 1 });
contentSchema.index({ source: 1 });
contentSchema.index({ isPublic: 1, createdAt: -1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ category: 1 });

// Text search index
contentSchema.index({ 
  title: 'text', 
  content: 'text', 
  'summary.text': 'text' 
});

// Method to check if user has liked this content
contentSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Method to auto-categorize content based on siteName
contentSchema.methods.autoCategorizeBySite = function() {
  const siteName = this.siteName.toLowerCase();
  
  if (siteName.includes('youtube') || siteName.includes('vimeo')) {
    return 'entertainment';
  } else if (siteName.includes('github') || siteName.includes('stackoverflow')) {
    return 'technology';
  } else if (siteName.includes('medium') || siteName.includes('blog')) {
    return 'education';
  } else if (siteName.includes('news') || siteName.includes('cnn') || siteName.includes('bbc')) {
    return 'news';
  }
  
  return 'other';
};

// Pre-save middleware to auto-categorize if not set
contentSchema.pre('save', function(next) {
  if (this.category === 'other' && this.siteName) {
    this.category = this.autoCategorizeBySite();
  }
  next();
});

module.exports = mongoose.model('Content', contentSchema);
