import axios from "axios";

// ================================
// BASE INSTANCE
// ================================

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://gradeiq-api.onrender.com";

const API = axios.create({
  baseURL: API_BASE_URL,
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
    // A failed login is also a 401 — let the login page show the error
    const isLoginRequest = error.config?.url?.startsWith("/auth/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ================================
// ERRORS
// FastAPI returns `detail` as a string for HTTPException
// and as an array of objects for validation (422) errors
// ================================

export const getErrorMessage = (error, fallback = "Something went wrong. Try again.") => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((d) => d?.msg?.replace(/^Value error, /, ""))
      .filter(Boolean)
      .join(" ") || fallback;
  }
  return fallback;
};

// ================================
// AUTH
// ================================

export const registerStudent = async (data) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

export const loginStudent = async (email, password) => {
  // OAuth2 password flow expects form-encoded fields named username/password
  const body = new URLSearchParams({ username: email, password });

  const response = await API.post("/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

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

// Most academic endpoints take an optional enrollmentId (programme).
// Omitted → the student's current programme.
const scoped = (enrollmentId, params = {}) => ({
  params: enrollmentId ? { ...params, enrollment_id: enrollmentId } : params,
});

export const getMyResults = async (enrollmentId) => {
  const response = await API.get("/results/me", scoped(enrollmentId));
  return response.data;
};

export const addResult = async (data) => {
  const response = await API.post("/results/", data);
  return response.data;
};

export const updateResult = async (resultId, data) => {
  const response = await API.put(`/results/${resultId}`, data);
  return response.data;
};

export const deleteResult = async (resultId) => {
  const response = await API.delete(`/results/${resultId}`);
  return response.data;
};

export const moveResults = async (resultIds, enrollmentId) => {
  const response = await API.post("/results/move", {
    result_ids: resultIds,
    enrollment_id: enrollmentId,
  });
  return response.data;
};

// ================================
// GPA
// ================================

export const getCGPA = async (enrollmentId) => {
  const response = await API.get("/gpa/cgpa", scoped(enrollmentId));
  return response.data;
};

export const getGPAHistory = async (enrollmentId) => {
  const response = await API.get("/gpa/history", scoped(enrollmentId));
  return response.data;
};

export const getSemesterGPA = async (academicYear, semester, enrollmentId) => {
  const response = await API.get(
    "/gpa/semester",
    scoped(enrollmentId, { academic_year: academicYear, semester })
  );
  return response.data;
};

// ================================
// DASHBOARD
// ================================

export const getDashboard = async (enrollmentId) => {
  const response = await API.get("/dashboard/me", scoped(enrollmentId));
  return response.data;
};

// ================================
// TRANSCRIPT
// ================================

export const getTranscript = async (enrollmentId) => {
  const response = await API.get("/transcript/me", scoped(enrollmentId));
  return response.data;
};

export const downloadTranscript = async (enrollmentId, filename = "transcript.pdf") => {
  const response = await API.get("/transcript/download", {
    ...scoped(enrollmentId),
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(
    new Blob([response.data], { type: "application/pdf" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// ================================
// TRENDS
// ================================

export const getTrends = async (enrollmentId) => {
  const response = await API.get("/trends/me", scoped(enrollmentId));
  return response.data;
};

// ================================
// RISK
// ================================

export const getRisk = async (enrollmentId) => {
  const response = await API.get("/risk/me", scoped(enrollmentId));
  return response.data;
};

// ================================
// PROJECTION
// ================================

export const simulateCGPA = async (body, enrollmentId) => {
  const response = await API.post("/projection/simulate", body, scoped(enrollmentId));
  return response.data;
};

export const getTargetGrade = async (targetCgpa, remainingCredits, enrollmentId) => {
  const response = await API.get(
    "/projection/target",
    scoped(enrollmentId, {
      target_cgpa: targetCgpa,
      remaining_credits: remainingCredits,
    })
  );
  return response.data;
};

// ================================
// PROGRAMMES (ENROLLMENTS)
// A top-up student has one per programme:
// e.g. completed diploma + current degree
// ================================

export const getReferenceData = async () => {
  const response = await API.get("/reference/academic");
  return response.data;
};

export const getEnrollments = async () => {
  const response = await API.get("/enrollments/me");
  return response.data.enrollments;
};

export const startTopUp = async (data) => {
  const response = await API.post("/enrollments/top-up", data);
  return response.data;
};

export const addPreviousProgramme = async (data) => {
  const response = await API.post("/enrollments/previous", data);
  return response.data;
};

export const updateEnrollment = async (enrollmentId, data) => {
  const response = await API.patch(`/enrollments/${enrollmentId}`, data);
  return response.data;
};

export const deleteEnrollment = async (enrollmentId) => {
  const response = await API.delete(`/enrollments/${enrollmentId}`);
  return response.data;
};

export const linkOldAccount = async (email, password) => {
  const response = await API.post("/enrollments/link-account", { email, password });
  return response.data;
};

export default API;