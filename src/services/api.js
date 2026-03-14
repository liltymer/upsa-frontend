import axios from "axios";

// ================================
// BASE INSTANCE
// ================================

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// ================================
// JWT INTERCEPTOR
// Automatically attaches token to
// every request if it exists
// ================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================================
// RESPONSE INTERCEPTOR
// Handles expired token globally
// ================================

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ================================
// AUTH
// ================================

export const registerStudent = async (data) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

export const loginStudent = async (email, password) => {
  const formData = new FormData();
  formData.append("username", email);
  formData.append("password", password);

  const response = await axios.post(
    "http://127.0.0.1:8000/auth/login",
    formData
  );

  return response.data;
};

// ================================
// COURSES
// ================================

export const getCourses = async () => {
  const response = await API.get("/courses/");
  return response.data;
};

export const createCourse = async (data) => {
  const response = await API.post("/courses/", data);
  return response.data;
};

// ================================
// RESULTS
// ================================

export const getMyResults = async () => {
  const response = await API.get("/results/me");
  return response.data;
};

export const addResult = async (data) => {
  // data: { course_code, course_name, credit_hours, grade, year, semester }
  const response = await API.post("/results/", data);
  return response.data;
};

export const updateResult = async (resultId, data) => {
  // data: { grade }
  const response = await API.put(`/results/${resultId}`, data);
  return response.data;
};

export const deleteResult = async (resultId) => {
  const response = await API.delete(`/results/${resultId}`);
  return response.data;
};

// ================================
// GPA
// ================================

export const getCGPA = async () => {
  const response = await API.get("/gpa/cgpa");
  return response.data;
};

export const getGPAHistory = async () => {
  const response = await API.get("/gpa/history");
  return response.data;
};

export const getSemesterGPA = async (year, semester) => {
  const response = await API.get("/gpa/semester", {
    params: { year, semester },
  });
  return response.data;
};

// ================================
// DASHBOARD
// ================================

export const getDashboard = async () => {
  const response = await API.get("/dashboard/me");
  return response.data;
};

// ================================
// TRANSCRIPT
// ================================

export const getTranscript = async () => {
  const response = await API.get("/transcript/me");
  return response.data;
};

export const downloadTranscript = async () => {
  const response = await API.get("/transcript/download", {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "transcript.pdf");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// ================================
// TRENDS
// ================================

export const getTrends = async () => {
  const response = await API.get("/trends/me");
  return response.data;
};

// ================================
// RISK
// ================================

export const getRisk = async () => {
  const response = await API.get("/risk/me");
  return response.data;
};

// ================================
// PROJECTION
// ================================

export const simulateCGPA = async (projectedCourses) => {
  const response = await API.post("/projection/simulate", projectedCourses);
  return response.data;
};

export const getTargetGrade = async (targetCgpa, remainingCredits) => {
  const response = await API.get("/projection/target", {
    params: {
      target_cgpa: targetCgpa,
      remaining_credits: remainingCredits,
    },
  });
  return response.data;
};

export default API;