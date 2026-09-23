import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword, verifyResetToken } from "../services/api";
import { authErrorMessage } from "../services/session";
import AuthLayout from "../components/auth/AuthLayout";
import { Alert, PasswordField, PasswordStrength } from "../components/auth/fields";
import Icon from "../components/landing/Icon";
import { isStrongPassword, passwordChecks, passwordScore } from "../utils/password";

const REDIRECT_AFTER_MS = 3000;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  // checking | ready | invalid | done
  const [status, setStatus] = useState(token ? "checking" : "invalid");
  const [invalidReason, setInvalidReason] = useState(token ? "" : "This reset link is incomplete.");
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check the link before showing the form
  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    verifyResetToken(token)
      .then(() => active && setStatus("ready"))
      .catch((err) => {
        if (!active) return;
        setInvalidReason(authErrorMessage(err, "This reset link is invalid or has expired."));
        setStatus("invalid");
      });
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    if (status !== "done") return undefined;
    const timer = setTimeout(() => navigate("/login"), REDIRECT_AFTER_MS);
    return () => clearTimeout(timer);
  }, [status, navigate]);

  const onInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!isStrongPassword(form.password)) next.password = "Choose a stronger password that meets every rule below.";
    if (form.confirm !== form.password) next.confirm = "The passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setError("");
    try {
      await resetPassword(token, form.password);
      setStatus("done");
    } catch (err) {
      const message = authErrorMessage(err, "We could not reset your password. Please try again.");
      // An expired or already used link cannot be retried
      if (/expired|invalid/i.test(message)) {
        setInvalidReason(message);
        setStatus("invalid");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const topbar = (
    <>
      <span>Remembered it?</span>
      <Link to="/login">Sign in</Link>
    </>
  );

  return (
    <AuthLayout
      topbar={topbar}
      panelTitle={<>A fresh start for <em>your account.</em></>}
      panelBody="Choose a strong password you have not used here before. Your results and programmes stay exactly as they are."
    >
      {status === "checking" && (
        <div className="au-state" role="status">
          <div className="au-state-icon info"><span className="au-spinner" aria-hidden="true" /></div>
          <h1 className="au-title">Checking your link</h1>
          <p className="au-subtitle">This only takes a moment.</p>
        </div>
      )}

      {status === "invalid" && (
        <div className="au-state">
          <div className="au-state-icon error"><Icon name="alert" size={28} strokeWidth={1.8} /></div>
          <h1 className="au-title">This link cannot be used</h1>
          <p className="au-subtitle">{invalidReason} Reset links work once and expire after one hour.</p>
          <div className="au-state-actions">
            <Link to="/forgot-password" className="au-submit" style={{ textDecoration: "none" }}>Request a new link</Link>
            <Link to="/login" className="au-secondary">Back to sign in</Link>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="au-state" role="status">
          <div className="au-state-icon success"><Icon name="check" size={30} strokeWidth={2.4} /></div>
          <h1 className="au-title">Password changed</h1>
          <p className="au-subtitle">You can now sign in with your new password. Taking you to sign in...</p>
          <Link to="/login" className="au-submit" style={{ textDecoration: "none" }}>Sign in now</Link>
          <div className="au-countdown" aria-hidden="true"><span /></div>
        </div>
      )}

      {status === "ready" && (
        <>
          <p className="au-eyebrow">Reset password</p>
          <h1 className="au-title">Choose a new password</h1>
          <p className="au-subtitle">It must be different from your current password.</p>

          <form className="au-form" onSubmit={handleSubmit} noValidate>
            {error && <Alert>{error}</Alert>}
            <PasswordField id="password" label="New password" autoComplete="new-password"
              value={form.password} onChange={onInput} error={errors.password} />
            <PasswordStrength checks={passwordChecks(form.password)} score={passwordScore(form.password)} />
            <PasswordField id="confirm" label="Confirm new password" autoComplete="new-password"
              value={form.confirm} onChange={onInput} error={errors.confirm} />
            <button type="submit" className="au-submit" disabled={loading}>
              {loading && <span className="au-spinner" aria-hidden="true" />}
              {loading ? "Saving..." : "Save new password"}
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
