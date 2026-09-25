// Admin API calls. Every endpoint checks the admin role on the server.
import API from "./api";

const data = (promise) => promise.then((res) => res.data);

export const getAdminStats = () => data(API.get("/admin/stats"));
export const getAdminAnalytics = () => data(API.get("/admin/analytics"));
export const getAdminInsights = () => data(API.get("/admin/insights"));

export const getUsers = () => data(API.get("/admin/users"));
export const deleteUser = (id) => data(API.delete(`/admin/users/${id}`));
export const setUserRole = (id, role) => data(API.put(`/admin/users/${id}/role`, { role }));

export const getAdminCourses = () => data(API.get("/admin/courses"));
export const updateCourse = (id, body) => data(API.put(`/admin/courses/${id}`, body));

export const getOfferings = (programme, level, semester) =>
  data(API.get("/admin/offerings", { params: { programme, level, semester } }));
export const addOffering = (body) => data(API.post("/admin/offerings", body));
export const setOfferingHidden = (id, hidden) => data(API.put(`/admin/offerings/${id}`, { hidden }));

export const getAnnouncements = () => data(API.get("/admin/announcements"));
export const createAnnouncement = (body) => data(API.post("/admin/announcements", body));
export const updateAnnouncement = (id, body) => data(API.put(`/admin/announcements/${id}`, body));
export const deleteAnnouncement = (id) => data(API.delete(`/admin/announcements/${id}`));
