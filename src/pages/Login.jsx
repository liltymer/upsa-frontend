import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authErrorMessage, homeFor, startSession } from "../services/session";
import AuthLayout from "../components/auth/AuthLayout";
import Icon from "../components/landing/Icon";

// The API runs on a free instance that sleeps when idle; the first request can take up to a minute.
const SLOW_AFTER_MS = 5000;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const justRegistered = Boolean(useLocation().state?.registered);
  const [form, setForm] = useState({ username: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const slowTimer = useRef(null);

  useEffect(() => () => clearTimeout(slowTimer.current), []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    setError("");
  };

  const validate = () => {
    const errors = {};
    if (!form.username.trim()) errors.username = "Enter your email or index number.";
    if (!form.password) errors.password = "Enter your password.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");
    slowTimer.current = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    try {
      const userData = await startSession(login, form.username.trim(), form.password);
      navigate(homeFor(userData));
    } catch (err) {
      setError(authErrorMessage(err, "The email, index number or password is incorrect."));
    } finally {
      clearTimeout(slowTimer.current);
      setSlow(false);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      topbar={
        <>
          <span>New to GradeIQ?</span>
          <Link to="/register">Create an account</Link>
        </>
      }
      panelTitle={<>Pick up where you <em>left off.</em></>}
      panelBody="Sign in to see your latest GPA, how your CGPA is moving, and what you need in the semesters ahead."
    >
      <p className="au-eyebrow">Sign in</p>
      <h1 className="au-title">Welcome back</h1>
      <p className="au-subtitle">Use your email address or your UPSA index number.</p>

      <form className="au-form" onSubmit={handleSubmit} noValidate>
        {justRegistered && !error && (
          <div className="au-alert au-alert-success" role="status">
            <Icon name="check" size={18} strokeWidth={2} />
            <span>Your account has been created. Sign in to continue.</span>
          </div>
        )}
        {error && (
          <div className="au-alert au-alert-error" role="alert">
            <Icon name="alert" size={18} strokeWidth={2} />
            <span>{error}</span>
          </div>
        )}

        <div className="au-field">
          <label className="au-label" htmlFor="username">Email or index number</label>
          <input
            id="username"
            name="username"
            type="text"
            className="au-input"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck="false"
            placeholder="you@example.com or 10324631"
            value={form.username}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.username)}
            aria-describedby={fieldErrors.username ? "username-error" : "username-hint"}
          />
          {fieldErrors.username ? (
            <p className="au-field-error" id="username-error">{fieldErrors.username}</p>
          ) : (
            <p className="au-hint" id="username-hint">Top-up students can use either their diploma or degree index number.</p>
          )}
        </div>

        <div className="au-field">
          <div className="au-label-row">
            <label className="au-label" htmlFor="password">Password</label>
            <Link to="/forgot-password" className="au-link">Forgot password?</Link>
          </div>
          <div className="au-input-wrap">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="au-input"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              className="au-reveal"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {fieldErrors.password && <p className="au-field-error" id="password-error">{fieldErrors.password}</p>}
        </div>

        <button type="submit" className="au-submit" disabled={loading}>
          {loading && <span className="au-spinner" aria-hidden="true" />}
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {slow && (
          <div className="au-alert au-alert-info" role="status">
            <Icon name="info" size={18} strokeWidth={2} />
            <span>The server is starting up after a quiet period. This can take up to a minute, please keep this page open.</span>
          </div>
        )}
      </form>

      <div className="au-mobile-only">
        <div className="au-divider">New to GradeIQ UPSA?</div>
        <Link to="/register" className="au-secondary">Create an account</Link>
      </div>

      <p className="au-note">
        Having trouble signing in? Email <a className="au-link" href="mailto:ahenkorajoshuaowusu@outlook.com">ahenkorajoshuaowusu@outlook.com</a>
      </p>
    </AuthLayout>
  );
}
