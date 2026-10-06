import Project from '../models/Project.js';

// @desc Get all research projects
// @route GET /api/projects
export const getProjects = async (req, res) => {
  try {
    const { departmentId } = req.query;
    const filter = departmentId ? { departmentId } : {};

    const projects = await Project.find(filter)
      .populate('departmentId', 'name code')
      .populate('principalInvestigatorId', 'name email employeeId');

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

// @desc Get project by ID
// @route GET /api/projects/:id
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('departmentId', 'name code')
      .populate('principalInvestigatorId', 'name email employeeId');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project details', error: error.message });
  }
};

// @desc Create new research project
// @route POST /api/projects
export const createProject = async (req, res) => {
  try {
    const { name, code, departmentId, principalInvestigatorId, budget, breakdown } = req.body;

    const numBudget = Number(budget);
    const project = new Project({
      name,
      code,
      departmentId,
      principalInvestigatorId,
      budget: numBudget,
      spentBudget: 0,
      remainingBudget: numBudget,
      breakdown: breakdown || {
        equipment: { allocated: numBudget * 0.3, spent: 0 },
        software: { allocated: numBudget * 0.1, spent: 0 },
        travel: { allocated: numBudget * 0.1, spent: 0 },
        research: { allocated: numBudget * 0.4, spent: 0 },
        other: { allocated: numBudget * 0.1, spent: 0 },
      },
    });

    await project.save();
    const populated = await Project.findById(project._id)
      .populate('departmentId', 'name code')
      .populate('principalInvestigatorId', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};
