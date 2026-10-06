import Department from '../models/Department.js';
import User from '../models/User.js';

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('hodId', 'name email employeeId designation');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, code, hodId, description } = req.body;
    const dept = new Department({ name, code, hodId, description });
    await dept.save();
    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error: error.message });
  }
};
