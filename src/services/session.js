import { loginStudent, getDashboard, getErrorMessage } from "./api";

// Signs in, loads the profile summary the app keeps in AuthContext, and
// returns it. A failure never leaves a half-finished session behind.
export async function startSession(login, username, password) {
  try {
    const tokenData = await loginStudent(username, password);
    localStorage.setItem("token", tokenData.access_token);
    const userData = await getDashboard();
    login(tokenData.access_token, {
      name: userData.name,
      index_number: userData.index_number,
      cgpa: userData.cgpa,
      classification: userData.classification,
      role: userData.role,
      academic_year: userData.academic_year,
      programme: userData.programme,
      level: userData.level,
    });
    return userData;
  } catch (err) {
    localStorage.removeItem("token");
    throw err;
  }
}

export const homeFor = (userData) => (userData.role === "admin" ? "/admin" : "/dashboard");

// Friendly message for any request error on the auth pages
export function authErrorMessage(err, fallback) {
  if (!err.response) return "We could not reach the server. Check your internet connection and try again.";
  if (err.response.status === 429) return "Too many attempts. Please wait a few minutes and try again.";
  return getErrorMessage(err, fallback);
}
