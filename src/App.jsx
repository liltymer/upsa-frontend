import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Results from "./pages/Results";
import GPA from "./pages/GPA";
import Transcript from "./pages/Transcript";
import Simulator from "./pages/Simulator";
import Risk from "./pages/Risk";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminCourses from "./pages/AdminCourses";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function NotFound() {
  const { isAuthenticated } = useAuth();
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-page)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      fontFamily: "var(--font-body)",
    }}>
      <p style={{
        fontFamily: "var(--font-heading)",
        fontWeight: 900, fontSize: 80,
        color: "var(--navy)", lineHeight: 1,
      }}>404</p>
      <p style={{
        fontFamily: "var(--font-heading)",
        fontWeight: 600, fontSize: 18,
        color: "var(--text-secondary)",
      }}>
        Page not found
      </p>
      <Link
        to={isAuthenticated ? "/dashboard" : "/"}
        className="btn btn-primary"
        style={{ marginTop: 8 }}
      >
        Go Home
      </Link>
    </div>
  );
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Hide student navbar on admin pages
  const isAdminPage = location.pathname.startsWith("/admin");

  // Where to redirect after login based on role
  const homeRoute = isAuthenticated
    ? user?.role === "admin" ? "/admin" : "/dashboard"
    : "/";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)" }}>

      {/* Navbar — only show when logged in and NOT on admin pages */}
      {isAuthenticated && !isAdminPage && <Navbar />}

      <Routes>

        {/* Landing — root URL */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to={user?.role === "admin" ? "/admin" : "/dashboard"} replace />
              : <Landing />
          }
        />

        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to={user?.role === "admin" ? "/admin" : "/dashboard"} replace />
              : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated
              ? <Navigate to={user?.role === "admin" ? "/admin" : "/dashboard"} replace />
              : <Register />
          }
        />

        {/* Protected Student Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/gpa" element={<ProtectedRoute><GPA /></ProtectedRoute>} />
        <Route path="/transcript" element={<ProtectedRoute><Transcript /></ProtectedRoute>} />
        <Route path="/simulator" element={<ProtectedRoute><Simulator /></ProtectedRoute>} />
        <Route path="/risk" element={<ProtectedRoute><Risk /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />
        <Route path="/admin/courses" element={<AdminRoute><AdminCourses /></AdminRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </div>
  );
}