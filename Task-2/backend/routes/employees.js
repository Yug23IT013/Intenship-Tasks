const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/employees
// @desc    Get all employees with search, filter, pagination
// @access  Private
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { position: searchRegex },
      ];
    }

    if (req.query.department && req.query.department !== 'All') {
      filter.department = req.query.department;
    }

    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }

    // Sort
    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const [employees, total] = await Promise.all([
      Employee.find(filter).sort(sort).skip(skip).limit(limit).populate('createdBy', 'name email'),
      Employee.countDocuments(filter),
    ]);

    // Stats
    const stats = await Employee.aggregate([
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          activeEmployees: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
          avgSalary: { $avg: '$salary' },
        },
      },
    ]);

    const deptStats = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: employees,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEmployees: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
      stats: stats[0] || { totalEmployees: 0, activeEmployees: 0, avgSalary: 0 },
      departmentStats: deptStats,
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error fetching employees' });
  }
});

// @route   GET /api/employees/:id
// @desc    Get a single employee by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('createdBy', 'name email');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(500).json({ message: 'Server error fetching employee' });
  }
});

// @route   POST /api/employees
// @desc    Create a new employee
// @access  Private
router.post(
  '/',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
    body('department').notEmpty().withMessage('Department is required').isIn(['HR', 'Engineering', 'Finance', 'Marketing', 'Sales', 'Operations', 'Legal', 'Design']).withMessage('Invalid department'),
    body('position').trim().notEmpty().withMessage('Position is required'),
    body('salary').isNumeric().withMessage('Salary must be a number').custom((val) => val >= 0).withMessage('Salary cannot be negative'),
    body('joinDate').notEmpty().withMessage('Join date is required').isISO8601().withMessage('Invalid date format'),
    body('status').optional().isIn(['Active', 'Inactive', 'On Leave']).withMessage('Invalid status'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    try {
      const existingEmployee = await Employee.findOne({ email: req.body.email.toLowerCase() });
      if (existingEmployee) {
        return res.status(400).json({ message: 'An employee with this email already exists' });
      }

      const employee = await Employee.create({
        ...req.body,
        createdBy: req.user._id,
      });

      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: employee,
      });
    } catch (error) {
      console.error('Create employee error:', error);
      if (error.code === 11000) {
        return res.status(400).json({ message: 'An employee with this email already exists' });
      }
      res.status(500).json({ message: 'Server error creating employee' });
    }
  }
);

// @route   PUT /api/employees/:id
// @desc    Update an employee
// @access  Private
router.put(
  '/:id',
  [
    body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('phone').optional().matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
    body('department').optional().isIn(['HR', 'Engineering', 'Finance', 'Marketing', 'Sales', 'Operations', 'Legal', 'Design']).withMessage('Invalid department'),
    body('salary').optional().isNumeric().withMessage('Salary must be a number').custom((val) => val >= 0).withMessage('Salary cannot be negative'),
    body('joinDate').optional().isISO8601().withMessage('Invalid date format'),
    body('status').optional().isIn(['Active', 'Inactive', 'On Leave']).withMessage('Invalid status'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    try {
      let employee = await Employee.findById(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // Check if email is being changed to an existing one
      if (req.body.email && req.body.email !== employee.email) {
        const emailExists = await Employee.findOne({ email: req.body.email.toLowerCase(), _id: { $ne: req.params.id } });
        if (emailExists) {
          return res.status(400).json({ message: 'An employee with this email already exists' });
        }
      }

      employee = await Employee.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).populate('createdBy', 'name email');

      res.json({
        success: true,
        message: 'Employee updated successfully',
        data: employee,
      });
    } catch (error) {
      console.error('Update employee error:', error);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Employee not found' });
      }
      res.status(500).json({ message: 'Server error updating employee' });
    }
  }
);

// @route   DELETE /api/employees/:id
// @desc    Delete an employee
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Employee ${employee.firstName} ${employee.lastName} has been deleted successfully`,
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(500).json({ message: 'Server error deleting employee' });
  }
});

// @route   GET /api/employees/stats/summary
// @desc    Get aggregated employee statistics
// @access  Private
router.get('/stats/summary', async (req, res) => {
  try {
    const [totalStats, deptStats, statusStats] = await Promise.all([
      Employee.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
            inactive: { $sum: { $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0] } },
            onLeave: { $sum: { $cond: [{ $eq: ['$status', 'On Leave'] }, 1, 0] } },
            avgSalary: { $avg: '$salary' },
            totalPayroll: { $sum: '$salary' },
          },
        },
      ]),
      Employee.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 }, avgSalary: { $avg: '$salary' } } },
        { $sort: { count: -1 } },
      ]),
      Employee.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        overview: totalStats[0] || {},
        byDepartment: deptStats,
        byStatus: statusStats,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

module.exports = router;
