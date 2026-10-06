import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach JWT token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const loginApi = (email, password) => API.post('/auth/login', { email, password });
export const demoLoginApi = (role) => API.post('/auth/demo-login', { role });
export const getMeApi = () => API.get('/auth/me');
export const getUsersApi = () => API.get('/auth/users');

// Expense APIs
export const getExpensesApi = (params) => API.get('/expenses', { params });
export const getExpenseByIdApi = (id) => API.get(`/expenses/${id}`);
export const createExpenseApi = (formData) =>
  API.post('/expenses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const hodReviewExpenseApi = (id, data) => API.put(`/expenses/${id}/hod-review`, data);
export const financeVerifyExpenseApi = (id, data) => API.put(`/expenses/${id}/finance-verify`, data);
export const registrarApproveExpenseApi = (id, data) => API.put(`/expenses/${id}/registrar-approve`, data);
export const disburseExpenseApi = (id, data) => API.post(`/expenses/${id}/disburse`, data);

// Budget APIs
export const getBudgetsApi = (params) => API.get('/budgets', { params });
export const getDepartmentBudgetApi = (departmentId) => API.get(`/budgets/department/${departmentId}`);
export const saveBudgetApi = (data) => API.post('/budgets', data);

// Research Project APIs
export const getProjectsApi = (params) => API.get('/projects', { params });
export const getProjectByIdApi = (id) => API.get(`/projects/${id}`);
export const createProjectApi = (data) => API.post('/projects', data);

// Department APIs
export const getDepartmentsApi = () => API.get('/departments');
export const createDepartmentApi = (data) => API.post('/departments', data);

// Stats APIs
export const getDashboardStatsApi = () => API.get('/stats/dashboard');

export default API;
