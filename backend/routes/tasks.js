const express = require('express');
const Task = require('../models/Task');

const router = express.Router();

// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid task ID format'
    });
  }
  next();
};

// @route   GET /api/tasks
// @desc    Get all tasks
// @access  Public
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
});

// @route   GET /api/tasks/stats
// @desc    Get task statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = await Task.getStats();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching task stats:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json(task);
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task'
    });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    const newTask = new Task({
      title: title.trim(),
      description: description ? description.trim() : '',
      completed: completed || false
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    console.error('Error creating task:', err);

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating task'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Public
router.put('/:id', validateObjectId, async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    // Validation
    if (title !== undefined && (!title || title.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Task title cannot be empty'
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : '';
    if (completed !== undefined) updateData.completed = completed;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json(task);
  } catch (err) {
    console.error('Error updating task:', err);

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating task'
    });
  }
});

// @route   PATCH /api/tasks/:id/toggle
// @desc    Toggle task completion status
// @access  Public
router.patch('/:id/toggle', validateObjectId, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.completed = !task.completed;
    await task.save();

    res.json(task);
  } catch (err) {
    console.error('Error toggling task:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling task status'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Public
router.delete('/:id', validateObjectId, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting task'
    });
  }
});

module.exports = router;
