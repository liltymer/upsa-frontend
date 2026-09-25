import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/landing/Icon";
import { PageSkeleton } from "../components/ui/Loading";
import { Toast } from "../components/results/ui";
import "../components/dashboard/dashboard.css";
import "../components/results/results.css";
import "../components/transcript/transcript.css";
import { useProgrammes } from "../context/ProgrammeContext";
import { downloadTranscript, getErrorMessage, getTranscript, getTranscriptHistory } from "../services/api";

const OFFICIAL_PAGE = "https://upsa.edu.gh/academics/academic-affairs/academic-affairs-documents/";
const TRANSCRIPT_EMAIL = "transcript@upsamail.edu.gh";
const two = (n) => Number(n).toFixed(2);
const AWARD = { diploma: "Diploma", degree: "Degree" };

/** One programme laid out exactly like the PDF. */
function ProgrammeRecord({ record, part, parts }) {
  return (
    <div className="tp-part">
      {parts > 1 && <p className="tp-part-title">Part {part} of {parts}: {AWARD[record.award_type] || "Programme"}</p>}
      <table className="tp-info">
        <tbody>
          <tr>
            <th scope="row">Name:</th><td>{record.student_name}</td>
            <th scope="row">Student Number:</th><td>{record.index_number || "-"}</td>
          </tr>
          <tr>
            <th scope="row">Programme:</th><td>{record.programme}</td>
            <th scope="row">Period:</th><td>{record.period}</td>
          </tr>
        </tbody>
      </table>

      {record.transcript.map((sem) => (
        <section key={`${sem.academic_year}-${sem.semester}`} className="tp-sem">
          <h3>{sem.title}</h3>
          <div className="tp-scroll">
            <table className="tp-courses">
              <thead>
                <tr><th scope="col">Code</th><th scope="col">Course Title</th><th scope="col">Credits</th><th scope="col">Grade</th><th scope="col">Grade Points</th></tr>
              </thead>
              <tbody>
                {sem.courses.map((c) => (
                  <tr key={c.course_code}>
                    <td>{c.course_code}</td>
                    <td className="tp-title">{c.course_title}</td>
                    <td>{two(c.credits)}</td>
                    <td>{c.grade}</td>
                    <td>{two(c.grade_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className="tp-summary">
              <tbody>
                <tr>
                  <td>TCR: {two(sem.total_credits)}</td>
                  <td>TGP: {two(sem.total_grade_points)}</td>
                  <td>GPA: {two(sem.semester_gpa)}</td>
                  <td>CGPA: {two(sem.cgpa)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className="tp-sem">
        <h3>{parts > 1 ? `${record.programme}: Cumulative Standing` : "Overall Cumulative Standing"}</h3>
        <div className="tp-scroll">
          <table className="tp-summary">
            <tbody>
              <tr>
                <td>Cumulative Credits: {two(record.total_credits)}</td>
                <td>Cumulative Grade Points: {two(record.total_grade_points)}</td>
                <td>CGPA: {two(record.cgpa)}</td>
                <td>Class: {record.classification || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function Transcript() {
  const { selectedEnrollmentId, enrollments } = useProgrammes();
  const [scope, setScope] = useState("programme");
  const [records, setRecords] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState(null);
  const clearToast = useCallback(() => setToast(null), []);

  const multiple = enrollments.filter((e) => (e.total_results ?? 1) > 0).length > 1;
  const activeScope = multiple ? scope : "programme";

  useEffect(() => {
    let active = true;
    const load = activeScope === "all"
      ? getTranscriptHistory().then((d) => d.programmes)
      : getTranscript(selectedEnrollmentId).then((t) => (t.transcript.length ? [t] : []));
    load
      .then((list) => { if (active) { setRecords(list); setError(""); } })
      .catch((err) => active && setError(getErrorMessage(err, "Could not load your transcript.")));
    return () => { active = false; };
  }, [activeScope, selectedEnrollmentId]);

  const first = records?.[0];
  const download = async () => {
    setDownloading(true);
    try {
      const id = first?.index_number || "programme";
      await downloadTranscript(
        selectedEnrollmentId,
        activeScope === "all" ? `transcript_full_history_${id}.pdf` : `transcript_${id}.pdf`,
        activeScope,
      );
      setToast({ msg: "Transcript downloaded." });
    } catch (err) {
      setToast({ msg: getErrorMessage(err, "Could not download the transcript."), type: "error" });
    } finally {
      setDownloading(false);
    }
  };

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="db rs tp">
      <header className="db-header tp-no-print">
        <div>
          <p className="db-eyebrow">Transcript</p>
          <h1 className="db-title">Your unofficial transcript</h1>
          <p className="db-meta">A copy of your record in UPSA's transcript layout, built from the results you entered.</p>
        </div>
        {records?.length > 0 && (
          <div className="rs-head-actions">
            <button type="button" className="db-btn db-btn-ghost" onClick={() => window.print()}>
              <Icon name="document" size={18} /> Print
            </button>
            <button type="button" className="db-btn" onClick={download} disabled={downloading}>
              <Icon name="arrowDown" size={18} /> {downloading ? "Preparing..." : "Download PDF"}
            </button>
          </div>
        )}
      </header>

      {multiple && (
        <div className="tp-scope tp-no-print" role="radiogroup" aria-label="What to include">
          {[["programme", "This programme"], ["all", "Full history"]].map(([key, label]) => (
            <button key={key} type="button" role="radio" aria-checked={activeScope === key}
              className={activeScope === key ? "on" : ""} onClick={() => { setRecords(null); setScope(key); }}>
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="tp-layout">
        <div className="tp-main">
          {error && !records && (
            <div className="db-card rs-empty"><p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p></div>
          )}
          {!records && !error && <PageSkeleton variant="document" label="Loading your transcript" />}
          {records?.length === 0 && (
            <section className="db-card rs-empty">
              <span className="rs-empty-icon"><Icon name="document" size={28} /></span>
              <h2 className="db-h2">Nothing to show yet</h2>
              <p className="tp-muted">Your transcript builds itself from your results. Add a semester and it will appear here, ready to download.</p>
              <Link to="/results" className="db-btn"><Icon name="plus" size={18} /> Add results</Link>
            </section>
          )}
          {records?.length > 0 && (
            <article className="tp-paper" aria-label="Transcript preview">
              <span className="tp-watermark" aria-hidden="true">UNOFFICIAL</span>
              <header className="tp-paper-head">
                <h2>UNIVERSITY OF PROFESSIONAL STUDIES, ACCRA</h2>
                <p className="tp-sub">UNOFFICIAL TRANSCRIPT OF ACADEMIC RECORD</p>
                <p className="tp-note">Student copy generated by GradeIQ UPSA. Not issued or verified by the university.</p>
              </header>
              {records.map((r, i) => <ProgrammeRecord key={r.enrollment_id} record={r} part={i + 1} parts={records.length} />)}
              <p className="tp-foot">
                TCR: total credits. TGP: total grade points. GPA and CGPA are cut off after two decimals, not rounded.
                Printed on {today}.
              </p>
            </article>
          )}
        </div>

        <aside className="tp-side tp-no-print">
          <section className="tp-card tp-warn">
            <h2><Icon name="alert" size={18} /> This is not an official transcript</h2>
            <p>
              It is built from results you typed in, and UPSA has not checked it. Use it to review your record,
              plan, or share informally. Employers, scholarships and other schools will ask for the official one.
            </p>
          </section>

          <section className="tp-card">
            <h2><Icon name="document" size={18} /> Getting your official transcript</h2>
            <p className="tp-muted">From UPSA's Academic Affairs Directorate:</p>
            <ol className="tp-steps">
              <li>Pay the transcript fee at <strong>Access Bank</strong> or on the <strong>UFIS</strong> platform.</li>
              <li>In UFIS, disburse the payment to <strong>transcript</strong>.</li>
              <li>Print the disbursement statement from UFIS.</li>
              <li>Email it to <a href={`mailto:${TRANSCRIPT_EMAIL}`}>{TRANSCRIPT_EMAIL}</a>.</li>
              <li>You get an email when it is ready, usually within <strong>three working days</strong>.</li>
            </ol>
            <p className="tp-muted tp-small">
              The fee was GH₵30 per set when we last checked. Fees and steps can change, so confirm on UPSA's page first.
            </p>
            <a className="db-btn db-btn-ghost tp-link" href={OFFICIAL_PAGE} target="_blank" rel="noreferrer">
              UPSA procedures page <Icon name="arrowRight" size={16} />
            </a>
          </section>

          <section className="tp-card">
            <h2><Icon name="check" size={18} /> Before you rely on it</h2>
            <ul className="tp-checks">
              <li>Every semester on your result slips is here.</li>
              <li>Codes, titles and credits match your slips.</li>
              <li>Your GPA and CGPA match the student portal.</li>
            </ul>
            <Link to="/results" className="db-link">Fix something in Results</Link>
          </section>
        </aside>
      </div>

      <Toast toast={toast} onDone={clearToast} />
    </div>
  );
}
