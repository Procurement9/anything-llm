import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://g8h3ilcqvdjd.manus.space/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Assets API functions
export const assetsAPI = {
  getAssets: () => api.get('/assets'),
  createAsset: (assetData) => api.post('/assets', assetData),
  updateAsset: (id, assetData) => api.put(`/assets/${id}`, assetData),
  deleteAsset: (id) => api.delete(`/assets/${id}`),
  getLiabilities: () => api.get('/liabilities'),
  createLiability: (liabilityData) => api.post('/liabilities', liabilityData),
  updateLiability: (id, liabilityData) => api.put(`/liabilities/${id}`, liabilityData),
  deleteLiability: (id) => api.delete(`/liabilities/${id}`),
  getNetWorth: () => api.get('/net-worth'),
};

// Beneficiaries API functions
export const beneficiariesAPI = {
  getBeneficiaries: () => api.get('/beneficiaries'),
  createBeneficiary: (beneficiaryData) => api.post('/beneficiaries', beneficiaryData),
  updateBeneficiary: (id, beneficiaryData) => api.put(`/beneficiaries/${id}`, beneficiaryData),
  deleteBeneficiary: (id) => api.delete(`/beneficiaries/${id}`),
  getBeneficiariesSummary: () => api.get('/beneficiaries/summary'),
};

// Tax API functions
export const taxAPI = {
  calculateTaxes: (taxData) => api.post('/tax/calculate', taxData),
  getTaxCalculations: () => api.get('/tax/calculations'),
  getTaxCalculation: (id) => api.get(`/tax/calculations/${id}`),
  getOptimizationSuggestions: (data) => api.post('/tax/optimization', data),
  generateForm706: () => api.post('/tax/forms/706'),
};

// Terminal API functions
export const terminalAPI = {
  getStockData: (symbol) => api.get(`/terminal/stock/${symbol}`),
  getMarketData: (symbols) => api.get('/terminal/market', { params: { symbols } }),
  getNews: (query) => api.get('/terminal/news', { params: { query } }),
  getStockHolders: (symbol) => api.get(`/terminal/holders/${symbol}`),
  getStockInsights: (symbol) => api.get(`/terminal/insights/${symbol}`),
  getSecFilings: (symbol) => api.get(`/terminal/sec-filings/${symbol}`),
};

export default api;

