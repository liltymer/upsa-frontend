import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../services/api";
import { authErrorMessage } from "../services/session";
import AuthLayout from "../components/auth/AuthLayout";
import { Alert, TextField } from "../components/auth/fields";
import Icon from "../components/landing/Icon";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_AFTER_SECONDS = 60;
const SUPPORT_EMAIL = "ahenkorajoshuaowusu@outlook.com";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const timer = useRef(null);

  useEffect(() => () => clearInterval(timer.current), []);

  const startCooldown = () => {
    setCooldown(RESEND_AFTER_SECONDS);
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) clearInterval(timer.current);
        return Math.max(s - 1, 0);
      });
    }, 1000);
  };

  const send = async (address) => {
    setLoading(true);
    setError("");
    try {
      await requestPasswordReset(address);
      setSentTo(address);
      startCooldown();
    } catch (err) {
      setError(authErrorMessage(err, "We could not send the reset link. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const address = email.trim();
    if (!EMAIL_PATTERN.test(address)) {
      setFieldError("Enter the email address you registered with.");
      return;
    }
    send(address);
  };

  return (
    <AuthLayout
      topbar={
        <>
          <span>Remembered it?</span>
          <Link to="/login">Sign in</Link>
        </>
      }
      panelTitle={<>Locked out? <em>Let us fix that.</em></>}
      panelBody="Reset your password with the email address on your account. Your results and programmes stay exactly as they are."
    >
      {sentTo ? (
        <div className="au-state">
          <div className="au-state-icon info"><Icon name="mail" size={28} strokeWidth={1.8} /></div>
          <h1 className="au-title">Check your email</h1>
          <p className="au-subtitle">
            If an account uses <strong>{sentTo}</strong>, a reset link is on its way. The link works once and expires after one hour.
          </p>

          {error && <Alert>{error}</Alert>}

          <ul className="au-tips">
            <li><Icon name="check" size={16} strokeWidth={2.4} /><span>It can take a few minutes to arrive.</span></li>
            <li><Icon name="check" size={16} strokeWidth={2.4} /><span>Check your spam or promotions folder.</span></li>
            <li><Icon name="check" size={16} strokeWidth={2.4} /><span>Make sure this is the email you registered with.</span></li>
          </ul>

          <div className="au-state-actions">
            <Link to="/login" className="au-submit" style={{ textDecoration: "none" }}>Back to sign in</Link>
          </div>

          <p className="au-note">
            Did not get it?{" "}
            <button type="button" className="au-linkbutton" disabled={cooldown > 0 || loading} onClick={() => send(sentTo)}>
              {cooldown > 0 ? `Send again in ${cooldown}s` : loading ? "Sending..." : "Send the link again"}
            </button>
            {" "}or{" "}
            <button type="button" className="au-linkbutton" onClick={() => { setSentTo(""); setError(""); }}>
              use a different email
            </button>
            .
            <br />
            Still nothing? Email <a className="au-link" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your index number.
          </p>
        </div>
      ) : (
        <>
          <p className="au-eyebrow">Reset password</p>
          <h1 className="au-title">Forgot your password?</h1>
          <p className="au-subtitle">Enter the email address on your account and we will send you a link to choose a new password.</p>

          <form className="au-form" onSubmit={handleSubmit} noValidate>
            {error && <Alert>{error}</Alert>}
            <TextField
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldError(""); setError(""); }}
              error={fieldError}
              hint="Use the email you registered with, not your index number."
            />
            <button type="submit" className="au-submit" disabled={loading}>
              {loading && <span className="au-spinner" aria-hidden="true" />}
              {loading ? "Sending link..." : "Send reset link"}
            </button>
          </form>

          <p className="au-note">
            Forgot which email you used? Email <a className="au-link" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your index number.
          </p>
        </>
      )}
    </AuthLayout>
  );
}
