const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
taskSchema.index({ createdAt: -1 });
taskSchema.index({ completed: 1, createdAt: -1 });

// Virtual for task status
taskSchema.virtual('status').get(function() {
  return this.completed ? 'completed' : 'pending';
});

// Instance method to toggle completion status
taskSchema.methods.toggleComplete = function() {
  this.completed = !this.completed;
  return this.save();
};

// Static method to get task statistics
taskSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: ['$completed', 1, 0] }
        },
        pendingTasks: {
          $sum: { $cond: ['$completed', 0, 1] }
        }
      }
    }
  ]);

  return stats[0] || {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  };
};

module.exports = mongoose.model('Task', taskSchema);
