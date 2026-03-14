import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Results from "./pages/Results";
import GPA from "./pages/GPA";
import Transcript from "./pages/Transcript";
import Simulator from "./pages/Simulator";
import Risk from "./pages/Risk";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function NotFound() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-light-bg flex flex-col items-center justify-center gap-4">
      <p className="font-heading font-extrabold text-6xl text-navy">404</p>
      <p className="font-heading font-semibold text-lg" style={{ color: "rgba(8,28,70,0.6)" }}>
        Page not found
      </p>
      <Link
        to={isAuthenticated ? "/dashboard" : "/login"}
        className="btn-primary mt-4"
      >
        Go Home
      </Link>
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-light-bg">

      {/* Navbar — only show when logged in */}
      {isAuthenticated && <Navbar />}

      <Routes>

        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gpa"
          element={
            <ProtectedRoute>
              <GPA />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transcript"
          element={
            <ProtectedRoute>
              <Transcript />
            </ProtectedRoute>
          }
        />

        <Route
          path="/simulator"
          element={
            <ProtectedRoute>
              <Simulator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/risk"
          element={
            <ProtectedRoute>
              <Risk />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </div>
  );
}