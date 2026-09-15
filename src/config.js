const API_BASE_URL = import.meta.env.VITE_API_URL || "https://domiflex-backend-production.up.railway.app";
const API_URL = `${API_BASE_URL}/api`;
const OPTIMIZER_URL = import.meta.env.VITE_OPTIMIZER_URL || "";

export { API_BASE_URL, API_URL, OPTIMIZER_URL };
export default API_URL;
