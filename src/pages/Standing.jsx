import { useMemo } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/landing/Icon";
import { PageSkeleton } from "../components/ui/Loading";
import useCached, { resultsKey } from "../hooks/useCached";
import "../components/dashboard/dashboard.css";
import "../components/results/results.css";
import "../components/gpa/gpa.css";
import "../components/standing/standing.css";
import { useProgrammes } from "../context/ProgrammeContext";
import { getErrorMessage, getMyResults } from "../services/api";
import { semesterTitle } from "../utils/academic";
import {
  HANDBOOK_URL, MAX_REPEATS, MAX_TRAILING, PROGRESSION_CGPA, RESIT, RESIT_URL, TRAIL_SEMESTERS,
  graduationRule, probationSemesters, topUpLevel,
} from "../utils/upsaRules";

const RULES = [
  { icon: "arrowUp", title: "Progression", section: "4.16", text: "You need a CGPA of at least 1.00 to move from one semester to the next." },
  { icon: "alert", title: "Probation", section: "4.19", text: "Below 1.00 at the end of a semester means probation: two semesters at Level 100, one at Level 200 and above. Still below 1.00 after it means withdrawal." },
  { icon: "layers", title: "Trailing", section: "4.16", text: "Trail at most two failed courses at a time, for up to three semesters. Prerequisites cannot be trailed." },
  { icon: "swap", title: "Repeating", section: "4.16, 4.10", text: "A course can be repeated only once, and both attempts count in your FCGPA." },
  { icon: "check", title: "Graduation", section: "4.15", text: "Diploma: 60 credits passed. Degree: 120, 99 or 69 by entry level. Limited D passes, nothing below C- in internship or dissertation." },
  { icon: "target", title: "Top-up entry", section: "2.24", text: "A diploma FCGPA of 2.50 or more means Level 300. 1.00 to 2.49 means Level 200." },
];

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const termKey = (r) => `${r.academic_year}-${r.semester}`;

/** Every course's attempts, and what they mean under UPSA's rules. */
function analyseCourses(results, semesters, awardType) {
  const order = semesters.map((s) => `${s.academic_year}-${s.semester}`);
  const byCode = new Map();
  results.forEach((r) => byCode.set(r.course_code, [...(byCode.get(r.course_code) || []), r]));

  // A degree D only counts as a (concessionary) pass at Level 100 under the new structure
  const fails = (r) => r.grade === "F" || (r.grade === "D" && awardType === "degree" && r.level > 100);

  return [...byCode.values()].map((attempts) => {
    attempts.sort((a, b) => order.indexOf(termKey(a)) - order.indexOf(termKey(b)));
    const last = attempts[attempts.length - 1];
    const firstFail = attempts.find((r) => fails(r) || r.grade === "D");
    let status = "passed";
    if (fails(last)) status = "failed";
    else if (last.grade === "D") status = "concessionary";
    else if (firstFail) status = "cleared";
    const since = firstFail ? order.length - 1 - order.indexOf(termKey(firstFail)) : 0;
    return { code: last.course_code, name: last.course_name, credits: last.credit_hours, last, attempts, status, since };
  });
}

export default function Standing() {
  const { selectedEnrollmentId, enrollments } = useProgrammes();
  const { data, error: fetchError } = useCached(resultsKey(selectedEnrollmentId), () => getMyResults(selectedEnrollmentId));
  const error = fetchError ? getErrorMessage(fetchError, "Could not load your standing.") : "";

  const enrollment = data?.enrollment;
  const courses = useMemo(
    () => (data ? analyseCourses(data.results || [], data.semesters || [], data.enrollment.award_type) : []),
    [data],
  );

  if (error && !data) {
    return <div className="db rs"><div className="db-card rs-empty"><p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p></div></div>;
  }
  if (!data) {
    return <PageSkeleton variant="summary" label="Checking your standing" />;
  }

  const header = (
    <header className="db-header">
      <div>
        <p className="db-eyebrow">Standing</p>
        <h1 className="db-title">Your academic standing</h1>
        <p className="db-meta">Checked against UPSA's rules on progression, failed courses and graduation.</p>
      </div>
    </header>
  );

  if (!data.semesters.length) {
    return (
      <div className="db rs st">
        {header}
        <section className="db-card rs-empty">
          <span className="rs-empty-icon"><Icon name="shield" size={28} /></span>
          <h2 className="db-h2">No results yet</h2>
          <p className="st-muted">Add your first semester and this page will check your standing against UPSA's rules.</p>
          <Link to="/results" className="db-btn"><Icon name="plus" size={18} /> Add results</Link>
        </section>
      </div>
    );
  }

  const award = enrollment.award_type;
  // Rules depend on the level actually reached: the latest recorded semester's
  const level = Math.max(enrollment.current_level, data.semesters[data.semesters.length - 1].level);
  const cgpa = enrollment.cgpa;
  const trailing = courses.filter((c) => c.status === "failed");
  const concessionary = courses.filter((c) => c.status === "concessionary");
  const cleared = courses.filter((c) => c.status === "cleared");
  const rule = graduationRule(award, enrollment.entry_level);
  const creditsPassed = courses.filter((c) => c.status !== "failed").reduce((s, c) => s + c.credits, 0);
  const concessionaryCredits = concessionary.reduce((s, c) => s + c.credits, 0);
  const finalYear = award === "diploma" ? level >= 200 : level >= 400;
  const margin = cgpa - PROGRESSION_CGPA;
  const repeatedOut = trailing.filter((c) => c.attempts.length > MAX_REPEATS);
  const overdue = trailing.filter((c) => c.since >= TRAIL_SEMESTERS);

  let state;
  if (cgpa < PROGRESSION_CGPA) {
    state = {
      key: "bad", title: "On probation",
      text: level <= 100
        ? `Your CGPA is below ${PROGRESSION_CGPA.toFixed(2)}. At Level 100 that means ${plural(probationSemesters(level), "semester")} of probation, and a CGPA below 1.00 at the end of the first year leads to withdrawal.`
        : `Your CGPA is below ${PROGRESSION_CGPA.toFixed(2)}. At Level 200 and above that means one semester of probation. Reach 1.00 by the end of it, or you will be asked to withdraw.`,
    };
  } else if (trailing.length > MAX_TRAILING || repeatedOut.length || overdue.length) {
    state = {
      key: "bad", title: "Over a UPSA limit",
      text: "You are past a limit on failed courses. See the details below and speak to your department or academic advisor soon.",
    };
  } else if (margin < 0.2 || trailing.length === MAX_TRAILING) {
    state = {
      key: "warn", title: "Needs attention",
      text: trailing.length === MAX_TRAILING
        ? `You are trailing ${MAX_TRAILING} failed courses, the most UPSA allows at once. Clear one before failing another.`
        : `Your CGPA is only ${margin.toFixed(2)} above the ${PROGRESSION_CGPA.toFixed(2)} you need to progress. A weak semester could put you on probation.`,
    };
  } else {
    state = {
      key: "good", title: "Good standing",
      text: trailing.length
        ? `You meet UPSA's progression rule. Clear your ${plural(trailing.length, "failed course")} within ${TRAIL_SEMESTERS} semesters.`
        : "You meet UPSA's progression rule and have no failed courses to clear.",
    };
  }

  const hasIssues = trailing.length + concessionary.length + cleared.length > 0;
  // Credits still to earn is normal mid-programme; only real problems count
  const toWatch = [concessionaryCredits > rule.concessionary, cgpa < PROGRESSION_CGPA].filter(Boolean).length;
  const degree = enrollments.find((e) => e.award_type === "degree");
  const topUp = award === "diploma" ? topUpLevel(cgpa) : null;

  return (
    <div className="db rs st">
      {header}

      {/* ---------- Status ---------- */}
      <section className={`st-status st-${state.key}`} aria-labelledby="st-state">
        <div className="st-status-main">
          <span className="st-badge"><Icon name={state.key === "good" ? "check" : "alert"} size={22} strokeWidth={2.4} /></span>
          <div>
            <p className="st-label">{enrollment.programme} · {enrollment.completed ? "Completed" : `Level ${level}`}</p>
            <h2 id="st-state">{state.title}</h2>
            <p className="st-text">{state.text}</p>
          </div>
        </div>
        <dl className="st-figures">
          <div><dt>CGPA</dt><dd>{cgpa.toFixed(2)}</dd><span>{margin >= 0 ? `${margin.toFixed(2)} above the 1.00 line` : `${Math.abs(margin).toFixed(2)} below the 1.00 line`}</span></div>
          <div><dt>Trailing</dt><dd>{trailing.length}<small> of {MAX_TRAILING}</small></dd><span>failed courses allowed</span></div>
          <div><dt>Credits passed</dt><dd>{creditsPassed}<small> of {rule.minPassed}</small></dd><span>needed to graduate</span></div>
        </dl>
      </section>

      {/* ---------- Failed courses (or a clean record) ---------- */}
      {hasIssues ? (
        <section className="db-card" aria-labelledby="st-failed">
          <div className="db-card-head">
            <h2 id="st-failed" className="db-h2">
              <span className="db-h2-icon" aria-hidden="true"><Icon name="alert" size={16} /></span>
              Failed courses and re-sits
            </h2>
          </div>
          <ul className="st-courses">
            {[...trailing, ...concessionary, ...cleared].map((c) => (
              <li key={c.code} className={`st-course st-course-${c.status}`}>
                <span className={`rs-grade-chip rs-g-${c.last.grade.replace("+", "p").replace("-", "m")}`}>{c.last.grade}</span>
                <span className="st-course-name">
                  <strong>{c.code}</strong> {c.name}
                  <small>
                    {c.status === "failed" && <>Failed in {semesterTitle(c.last.academic_year, c.last.semester)}. {c.attempts.length > MAX_REPEATS
                      ? "Already repeated once, the most UPSA allows."
                      : c.since ? `Trailing for ${plural(c.since, "semester")} of the ${TRAIL_SEMESTERS} allowed.` : `Clear it within ${TRAIL_SEMESTERS} semesters.`}</>}
                    {c.status === "concessionary" && <>Concessionary pass. Counts toward your limit and can be re-sat to improve it.</>}
                    {c.status === "cleared" && <>Cleared on a later attempt. Both attempts count in your CGPA.</>}
                  </small>
                </span>
                <span className={`st-tag st-tag-${c.status}`}>
                  {c.status === "failed" ? "To clear" : c.status === "concessionary" ? "Concessionary" : "Cleared"}
                </span>
              </li>
            ))}
          </ul>
          {(trailing.length > 0 || concessionary.length > 0) && (
            <div className="st-note">
              <Icon name="info" size={18} />
              <p>
                <strong>Re-sits.</strong>{" "}
                {finalYear
                  ? `As a final-year student you can register for supplementary re-sits: up to ${RESIT.maxCredits} credit hours (${RESIT.maxCourses} courses), GH₵${RESIT.feePerCredit} per credit hour in 2025/2026.`
                  : "Re-write a failed course when it is next offered in the right semester (handbook 4.32). Supplementary re-sits are only for final-year students."}
                {" "}<a href={RESIT_URL} target="_blank" rel="noreferrer" className="db-link">UPSA re-sit guidelines</a>
              </p>
            </div>
          )}
        </section>
      ) : (
        <section className="st-clean" aria-label="Failed courses">
          <span className="st-clean-icon"><Icon name="check" size={26} strokeWidth={2.6} /></span>
          <div>
            <h2>Clean record</h2>
            <p>All {plural(courses.length, "course")} passed on the first attempt. Nothing to re-sit, nothing trailing.</p>
          </div>
        </section>
      )}

      {/* ---------- Graduation checklist ---------- */}
      <section className="db-card" aria-labelledby="st-grad">
        <div className="db-card-head">
          <h2 id="st-grad" className="db-h2">
            <span className="db-h2-icon" aria-hidden="true"><Icon name="check" size={16} /></span>
            Graduation checklist
          </h2>
          <span className={`st-count${toWatch ? " st-count-bad" : " st-count-good"}`}>{toWatch ? `${toWatch} to watch` : "All on track"}</span>
        </div>
        <ul className="st-tiles">
          <li className="st-tile">
            <span className="st-tile-icon st-blue"><Icon name="layers" size={20} /></span>
            <p className="st-tile-label">Credits passed</p>
            <p className="st-tile-value">{creditsPassed}<small> / {rule.minPassed}</small></p>
            <span className="st-bar" aria-hidden="true"><span style={{ width: `${Math.min(100, (creditsPassed / rule.minPassed) * 100)}%` }} /></span>
            <p className="st-tile-note">
              {creditsPassed >= rule.minPassed ? "Minimum reached. " : `${rule.minPassed - creditsPassed} more to go. `}
              The minimum for {award === "diploma" ? "a diploma" : `a Level ${enrollment.entry_level} entry degree`} (4.15).
            </p>
          </li>
          <li className="st-tile">
            <span className={`st-tile-icon ${concessionaryCredits > rule.concessionary ? "st-red" : "st-gold"}`}><Icon name="alert" size={20} /></span>
            <p className="st-tile-label">Concessionary passes (D)</p>
            <p className={`st-tile-value${concessionaryCredits > rule.concessionary ? " st-over" : ""}`}>{concessionaryCredits}<small> / {rule.concessionary} credits</small></p>
            {rule.concessionary > 0 && (
              <span className="st-bar st-bar-gold" aria-hidden="true"><span style={{ width: `${Math.min(100, (concessionaryCredits / rule.concessionary) * 100)}%` }} /></span>
            )}
            <p className="st-tile-note">
              {rule.concessionary
                ? `Up to ${rule.concessionary} credits of D${award === "degree" ? ", only at Level 100 and not in core courses" : ""}.`
                : "None allowed for your entry level, so a D has to be re-sat."}
            </p>
          </li>
          <li className="st-tile">
            <span className={`st-tile-icon ${cgpa >= PROGRESSION_CGPA ? "st-green" : "st-red"}`}><Icon name="arrowUp" size={20} /></span>
            <p className="st-tile-label">Progression</p>
            <p className={`st-tile-value ${cgpa >= PROGRESSION_CGPA ? "st-ok" : "st-over"}`}>{cgpa >= PROGRESSION_CGPA ? "Met" : "Not met"}</p>
            <p className="st-tile-note">A CGPA of at least 1.00 at the end of every semester (4.16). Yours is {cgpa.toFixed(2)}.</p>
          </li>
          <li className="st-tile">
            <span className="st-tile-icon st-navy"><Icon name="document" size={20} /></span>
            <p className="st-tile-label">Internship and dissertation</p>
            <p className="st-tile-value">C-<small> or better</small></p>
            <p className="st-tile-note">No grade below C- is accepted in these, even as a concessionary pass.</p>
          </li>
        </ul>
      </section>

      {/* ---------- Top-up guidance ---------- */}
      {award === "diploma" && (
        <section className="st-topup" aria-labelledby="st-topup">
          <span className="st-topup-icon"><Icon name="arrowUp" size={24} strokeWidth={2.2} /></span>
          <div className="st-topup-body">
            <h2 id="st-topup">Topping up to a degree</h2>
            {topUp ? (
              <p>
                With a diploma FCGPA of <strong>{cgpa.toFixed(2)}</strong> you qualify for <strong>Level {topUp}</strong> of a related
                bachelor's degree at UPSA{topUp === 300 ? " (2.50 or more)" : " (1.00 to 2.49; 2.50 or more would mean Level 300)"}.
              </p>
            ) : (
              <p>A diploma FCGPA of at least 1.00 is needed to top up to a degree.</p>
            )}
            {degree && <p className="st-muted">You have already added {degree.programme}. Switch to it from the sidebar.</p>}
          </div>
          {topUp && !degree && <Link to="/profile" className="db-btn">Add my top-up <Icon name="arrowRight" size={16} /></Link>}
        </section>
      )}

      {/* ---------- Rules at a glance ---------- */}
      <section className="db-card" aria-labelledby="st-rules">
        <div className="db-card-head">
          <h2 id="st-rules" className="db-h2">
            <span className="db-h2-icon" aria-hidden="true"><Icon name="document" size={16} /></span>
            UPSA rules at a glance
          </h2>
          <a href={HANDBOOK_URL} target="_blank" rel="noreferrer" className="db-link">Students' handbook</a>
        </div>
        <ul className="st-rules">
          {RULES.map((r) => (
            <li key={r.title} className="st-rule">
              <span className="st-rule-icon"><Icon name={r.icon} size={18} /></span>
              <div>
                <p className="st-rule-head"><strong>{r.title}</strong><span>{r.section}</span></p>
                <p>{r.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="st-muted st-source">
          From UPSA's Undergraduate Students' Handbook (2018) and the 2025/2026 re-sit guidelines. Rules can change, so check the current handbook or your department when it matters.
        </p>
      </section>
    </div>
  );
}
