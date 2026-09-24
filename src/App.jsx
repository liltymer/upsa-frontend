import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ProgrammeProvider } from "./context/ProgrammeContext";

// Pages — loaded on demand so each route ships its own chunk
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Results = lazy(() => import("./pages/Results"));
const GPA = lazy(() => import("./pages/GPA"));
const Transcript = lazy(() => import("./pages/Transcript"));
const Planner = lazy(() => import("./pages/Planner"));
const Risk = lazy(() => import("./pages/Risk"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminAnnouncements = lazy(() => import("./pages/AdminAnnouncements"));
const AdminCourses = lazy(() => import("./pages/AdminCourses"));

// Components
import AppLayout from "./components/app/AppLayout";
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

function PageLoader() {
  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-navy border-t-gold rounded-full animate-spin" />
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
  const { isAuthenticated, user, token } = useAuth();

  return (
    // Keyed by token so a different login never sees the previous student's programmes
    <ProgrammeProvider key={token || "signed-out"}>
    <div style={{ minHeight: "100vh", background: "var(--bg-page)" }}>

      <Suspense fallback={<PageLoader />}>
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

        {/* Signed-in student pages share the sidebar layout */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/results" element={<Results />} />
          <Route path="/gpa" element={<GPA />} />
          <Route path="/transcript" element={<Transcript />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/standing" element={<Risk />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        {/* Old addresses keep working */}
        <Route path="/simulator" element={<Navigate to="/planner" replace />} />
        <Route path="/risk" element={<Navigate to="/standing" replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />
        <Route path="/admin/courses" element={<AdminRoute><AdminCourses /></AdminRoute>} />

        {/* Password Reset Routes */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
      </Suspense>
    </div>
    </ProgrammeProvider>
  );
}