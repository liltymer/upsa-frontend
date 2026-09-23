import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerStudent } from "../services/api";
import { authErrorMessage, homeFor, startSession } from "../services/session";
import useReferenceData from "../hooks/useReferenceData";
import AuthLayout from "../components/auth/AuthLayout";
import { Alert, PasswordField, SelectField, TextField } from "../components/auth/fields";

const LEVELS = [100, 200, 300, 400];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLOW_AFTER_MS = 5000;

const STEPS = [
  { title: "About you", subtitle: "Your name and the details you will sign in with." },
  { title: "Your programme", subtitle: "The UPSA programme you are on now." },
  { title: "Your diploma", subtitle: "Optional. Record the diploma you completed before your top-up." },
];

const EMPTY = {
  name: "", email: "", password: "", confirm: "",
  is_top_up: false, programme: "", level: "", academic_year: "", index_number: "",
  prev_programme: "", prev_index_number: "", prev_start_year: "",
};

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { programmes, academic_years: academicYears, current_academic_year: currentYear } = useReferenceData();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const slowTimer = useRef(null);
  const headingRef = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => () => clearTimeout(slowTimer.current), []);

  // Move focus to the new step heading for keyboard and screen reader users
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus();
  }, [step]);

  const academicYear = form.academic_year || currentYear || "";
  const totalSteps = form.is_top_up ? 3 : 2;
  const isDiploma = form.programme.toLowerCase().startsWith("diploma");
  const programmeOptions = programmes
    .filter((p) => !form.is_top_up || p.award_type === "degree")
    .map((p) => p.name);
  const diplomaOptions = programmes.filter((p) => p.award_type === "diploma").map((p) => p.name);
  const levelOptions = LEVELS
    .filter((l) => (form.is_top_up ? l >= 300 : !isDiploma || l <= 200))
    .map((l) => ({ value: String(l), label: `Level ${l}` }));

  const update = (name, value) => {
    setForm((f) => {
      const next = { ...f, [name]: value };
      if (name === "is_top_up") {
        next.level = value ? "300" : "";
        if (value && next.programme.toLowerCase().startsWith("diploma")) next.programme = "";
      }
      if (name === "programme" && value.toLowerCase().startsWith("diploma") && Number(next.level) > 200) {
        next.level = "";
      }
      return next;
    });
    setErrors((e) => ({ ...e, [name]: "" }));
    setServerError("");
  };
  const onInput = (e) => update(e.target.name, e.target.value);

  const validateStep = (index) => {
    const e = {};
    if (index === 0) {
      if (form.name.trim().length < 2) e.name = "Enter your full name.";
      if (!EMAIL_PATTERN.test(form.email.trim())) e.email = "Enter a valid email address.";
      if (form.password.length < 8) e.password = "Use at least 8 characters.";
      if (form.confirm !== form.password) e.confirm = "The passwords do not match.";
    }
    if (index === 1) {
      if (!form.programme) e.programme = "Choose your programme.";
      if (!form.level) e.level = "Choose your level.";
      if (!academicYear) e.academic_year = "Choose the current academic year.";
      if (!form.index_number.trim()) e.index_number = "Enter your index number.";
    }
    if (index === 2 && form.prev_programme) {
      if (!form.prev_start_year) e.prev_start_year = "Choose the year your diploma started.";
      if (form.prev_index_number.trim() && form.prev_index_number.trim() === form.index_number.trim()) {
        e.prev_index_number = "Use a different index number from your degree.";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validateStep(step)) return;
    setLoading(true);
    setServerError("");
    slowTimer.current = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    let registered = false;
    try {
      await registerStudent({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        programme: form.programme,
        level: Number(form.level),
        academic_year: academicYear,
        index_number: form.index_number.trim(),
        is_top_up: form.is_top_up,
        previous_programme: form.is_top_up && form.prev_programme
          ? {
              programme: form.prev_programme,
              index_number: form.prev_index_number.trim() || null,
              start_academic_year: form.prev_start_year,
            }
          : null,
      });
      registered = true;
      // Account created: sign straight in
      const userData = await startSession(login, form.email.trim(), form.password);
      navigate(homeFor(userData));
    } catch (err) {
      if (registered) {
        // The account exists; only the automatic sign-in failed
        navigate("/login", { state: { registered: true } });
      } else if (err.response?.status === 409) {
        setServerError("An account with this email or index number already exists. Sign in instead, or check the details you entered.");
      } else {
        setServerError(authErrorMessage(err, "We could not create your account. Please check your details and try again."));
      }
    } finally {
      clearTimeout(slowTimer.current);
      setSlow(false);
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (step < totalSteps - 1) {
      if (validateStep(step)) setStep(step + 1);
    } else {
      submit();
    }
  };

  const isLast = step === totalSteps - 1;

  return (
    <AuthLayout
      topbar={
        <>
          <span>Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </>
      }
      panelTitle={<>Start tracking <em>this semester.</em></>}
      panelBody="Create your account, add the results from your result slip, and see where you stand on the UPSA scale."
    >
      <div className="au-step-head">
        <p className="au-eyebrow">Create an account</p>
        <p className="au-step-count">Step {step + 1} of {totalSteps}</p>
      </div>
      <div className="au-steps" role="progressbar" aria-valuemin={1} aria-valuemax={totalSteps} aria-valuenow={step + 1}
        aria-label="Registration progress">
        {Array.from({ length: totalSteps }, (_, i) => (
          <span key={i} className={`au-step-bar${i <= step ? " done" : ""}`} />
        ))}
      </div>

      <h1 className="au-title" tabIndex={-1} ref={headingRef}>{STEPS[step].title}</h1>
      <p className="au-subtitle">{STEPS[step].subtitle}</p>

      <form className="au-form" onSubmit={onSubmit} noValidate>
        {serverError && <Alert>{serverError}</Alert>}

        {step === 0 && (
          <>
            <TextField id="name" label="Full name" autoComplete="name" placeholder="As it appears on your student records"
              value={form.name} onChange={onInput} error={errors.name} />
            <TextField id="email" label="Email address" type="email" autoComplete="email" autoCapitalize="none" spellCheck="false"
              placeholder="you@example.com" value={form.email} onChange={onInput} error={errors.email}
              hint="Password reset links are sent here." />
            <div className="au-row">
              <PasswordField id="password" label="Password" autoComplete="new-password" placeholder="8 or more characters"
                value={form.password} onChange={onInput} error={errors.password} />
              <PasswordField id="confirm" label="Confirm password" autoComplete="new-password" placeholder="Type it again"
                value={form.confirm} onChange={onInput} error={errors.confirm} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <fieldset className="au-choice">
              <legend className="au-label">Are you a top-up student?</legend>
              <div className="au-choice-options">
                {[
                  { value: false, label: "No", note: "I started my programme at Level 100" },
                  { value: true, label: "Yes", note: "I topped up from a UPSA diploma" },
                ].map((opt) => (
                  <label key={opt.label} className={`au-choice-card${form.is_top_up === opt.value ? " selected" : ""}`}>
                    <input type="radio" name="is_top_up" checked={form.is_top_up === opt.value}
                      onChange={() => update("is_top_up", opt.value)} />
                    <span><strong>{opt.label}</strong><small>{opt.note}</small></span>
                  </label>
                ))}
              </div>
            </fieldset>
            <SelectField id="programme" label={form.is_top_up ? "Degree programme" : "Programme"} placeholder="Choose your programme"
              options={programmeOptions} value={form.programme} onChange={onInput} error={errors.programme} />
            <div className="au-row">
              <SelectField id="level" label="Current level" placeholder="Choose level" options={levelOptions}
                value={form.level} onChange={onInput} error={errors.level} />
              <SelectField id="academic_year" label="Academic year" placeholder="Choose year" options={academicYears}
                value={academicYear} onChange={onInput} error={errors.academic_year} />
            </div>
            <TextField id="index_number" label={form.is_top_up ? "Degree index number" : "Index number"}
              autoComplete="off" spellCheck="false" placeholder="e.g. 10324631"
              value={form.index_number} onChange={onInput} error={errors.index_number}
              hint={form.is_top_up ? "The new index number you received for your degree." : "You can sign in with this or your email."} />
          </>
        )}

        {step === 2 && (
          <>
            <SelectField id="prev_programme" label="Diploma programme" placeholder="Choose your diploma (optional)"
              options={diplomaOptions} value={form.prev_programme} onChange={onInput} error={errors.prev_programme} />
            <div className="au-row">
              <TextField id="prev_index_number" label="Diploma index number" autoComplete="off" spellCheck="false"
                placeholder="Optional" value={form.prev_index_number} onChange={onInput} error={errors.prev_index_number} />
              <SelectField id="prev_start_year" label="Diploma started" placeholder="Choose year" options={academicYears}
                value={form.prev_start_year} onChange={onInput} error={errors.prev_start_year} />
            </div>
            <Alert tone="info">Your diploma keeps its own CGPA and class. You can also add it later from your profile.</Alert>
          </>
        )}

        <div className="au-actions">
          {step > 0 && (
            <button type="button" className="au-back" onClick={() => { setServerError(""); setStep(step - 1); }} disabled={loading}>
              Back
            </button>
          )}
          <button type="submit" className="au-submit" disabled={loading}>
            {loading && <span className="au-spinner" aria-hidden="true" />}
            {loading ? "Creating your account..." : isLast ? "Create account" : "Continue"}
          </button>
        </div>

        {slow && (
          <Alert tone="info">The server is starting up after a quiet period. This can take up to a minute, please keep this page open.</Alert>
        )}
      </form>

      <p className="au-note">
        GradeIQ is an independent student project, not an official UPSA service. Only you can see the results you enter.
      </p>
    </AuthLayout>
  );
}
