import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/landing/Icon";
import { PageSkeleton } from "../components/ui/Loading";
import useCached, { resultsKey } from "../hooks/useCached";
import { TrendChart } from "../components/dashboard/charts";
import "../components/dashboard/dashboard.css";
import "../components/results/results.css";
import "../components/gpa/gpa.css";
import { useProgrammes } from "../context/ProgrammeContext";
import useReferenceData from "../hooks/useReferenceData";
import { getErrorMessage, getMyResults } from "../services/api";
import { SEMESTER_NAMES, classifyWithBands, semesterTitle, shortSemester, truncateGpa } from "../utils/academic";

const signed = (n) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(2)}`;
const threeDp = (n) => (Math.floor(n * 1000 + 1e-9) / 1000).toFixed(3);

export default function GPA() {
  const { selectedEnrollmentId } = useProgrammes();
  const { grade_scale: gradeScale } = useReferenceData();
  const { data, error: fetchError } = useCached(resultsKey(selectedEnrollmentId), () => getMyResults(selectedEnrollmentId));
  const error = fetchError ? getErrorMessage(fetchError, "Could not load your GPA.") : "";
  const [showWorking, setShowWorking] = useState(false);

  const semesters = useMemo(() => data?.semesters || [], [data]);
  const enrollment = data?.enrollment;
  const bands = useMemo(() => enrollment?.classification_bands || [], [enrollment]);

  if (error && !data) {
    return <div className="db rs"><div className="db-card rs-empty"><p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p></div></div>;
  }
  if (!data) {
    return <PageSkeleton variant="summary" label="Loading your GPA" />;
  }

  const header = (
    <header className="db-header">
      <div>
        <p className="db-eyebrow">GPA</p>
        <h1 className="db-title">Your GPA and CGPA</h1>
        <p className="db-meta">{enrollment?.programme} · {enrollment?.level_label}</p>
      </div>
    </header>
  );

  if (!semesters.length) {
    return (
      <div className="db rs gp">
        {header}
        <section className="db-card rs-empty">
          <span className="rs-empty-icon"><Icon name="chart" size={28} /></span>
          <h2 className="db-h2">No GPA to show yet</h2>
          <p className="gp-muted">Add your first semester of results and this page will show your GPA, your CGPA and how each semester moves it.</p>
          <Link to="/results" className="db-btn"><Icon name="plus" size={18} /> Add results</Link>
        </section>
      </div>
    );
  }

  const latest = semesters[semesters.length - 1];
  const previous = semesters[semesters.length - 2];
  const change = previous ? latest.gpa - previous.gpa : null;
  const best = semesters.reduce((a, b) => (b.gpa > a.gpa ? b : a));
  const lowest = semesters.reduce((a, b) => (b.gpa < a.gpa ? b : a));

  // How much each semester moved the CGPA (the first one sets the starting point)
  const impacts = semesters.map((s, i) => ({ ...s, impact: i ? s.cgpa - semesters[i - 1].cgpa : null }));
  const maxImpact = Math.max(0.01, ...impacts.filter((s) => s.impact !== null).map((s) => Math.abs(s.impact)));

  const history = semesters.map((s) => ({
    title: `${s.academic_year} ${SEMESTER_NAMES[s.semester]}`,
    gpa: s.gpa,
    cgpa: s.cgpa,
    credits: s.total_credits,
  }));

  const currentClass = enrollment.classification;
  const ladder = bands.filter((b) => b.label !== "Fail");
  const currentIndex = ladder.findIndex((b) => b.label === currentClass);
  const next = currentIndex > 0 ? ladder[currentIndex - 1] : null;

  const allPoints = semesters.reduce((sum, s) => sum + s.total_grade_points, 0);
  const allCredits = semesters.reduce((sum, s) => sum + s.total_credits, 0);

  return (
    <div className="db rs gp">
      {header}

      {/* ---------- Summary ---------- */}
      <section className="rs-summary" aria-label="Summary">
        <div className="rs-sum rs-sum-main">
          <span className="rs-sum-icon"><Icon name="target" size={22} /></span>
          <div>
            <p>CGPA</p>
            <strong>{enrollment.cgpa.toFixed(2)}</strong>
            {currentClass && <span className="rs-sum-pill">{currentClass}</span>}
          </div>
        </div>
        <div className="rs-sum">
          <span className="rs-sum-icon"><Icon name="chart" size={22} /></span>
          <div>
            <p>Latest semester</p>
            <strong>{latest.gpa.toFixed(2)}</strong>
            {change !== null && Math.abs(change) >= 0.005 && (
              <span className={`gp-delta ${change > 0 ? "up" : "down"}`}>
                <Icon name={change > 0 ? "arrowUp" : "arrowDownRight"} size={13} strokeWidth={2.4} />
                {change > 0 ? "Up" : "Down"} {Math.abs(change).toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <div className="rs-sum">
          <span className="rs-sum-icon"><Icon name="arrowUp" size={22} /></span>
          <div>
            <p>Best semester</p>
            <strong>{best.gpa.toFixed(2)}</strong>
            <span className="gp-sum-sub">{shortSemester(best.academic_year, best.semester)}</span>
          </div>
        </div>
        <div className="rs-sum">
          <span className="rs-sum-icon"><Icon name="arrowDownRight" size={22} /></span>
          <div>
            <p>Lowest semester</p>
            <strong>{lowest.gpa.toFixed(2)}</strong>
            <span className="gp-sum-sub">{shortSemester(lowest.academic_year, lowest.semester)}</span>
          </div>
        </div>
      </section>

      {/* ---------- Chart ---------- */}
      <section className="db-card gp-chart" aria-labelledby="gp-trend">
        <div className="db-card-head">
          <h2 id="gp-trend" className="db-h2">
            <span className="db-h2-icon" aria-hidden="true"><Icon name="chart" size={16} /></span>
            GPA and CGPA over time
          </h2>
        </div>
        {semesters.length >= 2 ? (
          <TrendChart history={history} bands={bands} />
        ) : (
          <p className="gp-muted">Your chart appears once you have two semesters. So far: semester GPA {latest.gpa.toFixed(2)}.</p>
        )}
      </section>

      <div className="gp-two">
        {/* ---------- Impact ---------- */}
        <section className="db-card" aria-labelledby="gp-impact">
          <div className="db-card-head">
            <h2 id="gp-impact" className="db-h2">
              <span className="db-h2-icon" aria-hidden="true"><Icon name="layers" size={16} /></span>
              How each semester moved your CGPA
            </h2>
          </div>
          <ol className="gp-impacts">
            {impacts.map((s) => {
              const up = s.impact > 0.004;
              const down = s.impact < -0.004;
              const width = s.impact === null ? 0 : (Math.abs(s.impact) / maxImpact) * 50;
              return (
                <li key={`${s.academic_year}-${s.semester}`} className="gp-impact">
                  <span className="gp-impact-name">
                    <strong>{shortSemester(s.academic_year, s.semester)}</strong>
                    <span>GPA {s.gpa.toFixed(2)}</span>
                  </span>
                  <span className="gp-impact-track" aria-hidden="true">
                    <span className="gp-impact-zero" />
                    {s.impact !== null && (
                      <span className={`gp-impact-bar ${up ? "up" : down ? "down" : "flat"}`}
                        style={up ? { left: "50%", width: `${width}%` } : { right: "50%", width: `${width}%` }} />
                    )}
                  </span>
                  <span className={`gp-impact-value ${up ? "up" : down ? "down" : ""}`}>
                    {s.impact === null ? "Start" : signed(Math.abs(s.impact) < 0.005 ? 0 : s.impact)}
                    <span className="db-sr">
                      {s.impact === null ? `: your CGPA started at ${s.cgpa.toFixed(2)}` : up ? " raised your CGPA" : down ? " lowered your CGPA" : " kept your CGPA the same"}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="gp-note">
            Later semesters move your CGPA less, because it averages more credits each time.
          </p>
        </section>

        {/* ---------- Where you stand ---------- */}
        <section className="db-card" aria-labelledby="gp-stand">
          <div className="db-card-head">
            <h2 id="gp-stand" className="db-h2">
              <span className="db-h2-icon" aria-hidden="true"><Icon name="target" size={16} /></span>
              Where you stand
            </h2>
          </div>
          <ol className="gp-ladder">
            {ladder.map((b) => {
              const here = b.label === currentClass;
              return (
                <li key={b.label} className={here ? "here" : ""}>
                  <span className="gp-ladder-name">{b.label}</span>
                  <span className="gp-ladder-range">{b.range}</span>
                  {here && <span className="gp-here">You are here · {enrollment.cgpa.toFixed(2)}</span>}
                </li>
              );
            })}
          </ol>
          {next ? (
            <p className="gp-next">
              <Icon name="arrowUp" size={16} strokeWidth={2.2} />
              <span><strong>{next.label}</strong> starts at {next.min.toFixed(2)}, {(next.min - enrollment.cgpa).toFixed(2)} away.</span>
            </p>
          ) : currentClass && (
            <p className="gp-next"><Icon name="check" size={16} strokeWidth={2.4} /><span>You are in the top class. Keep it there.</span></p>
          )}
        </section>
      </div>

      {/* ---------- The numbers ---------- */}
      <section className="db-card" aria-labelledby="gp-table">
        <div className="db-card-head">
          <h2 id="gp-table" className="db-h2">
            <span className="db-h2-icon" aria-hidden="true"><Icon name="document" size={16} /></span>
            The numbers behind it
          </h2>
        </div>
        <div className="gp-table-wrap">
          <table className="gp-table">
            <thead>
              <tr>
                <th scope="col">Semester</th>
                <th scope="col">Level</th>
                <th scope="col">Credits</th>
                <th scope="col">Grade points</th>
                <th scope="col">Semester GPA</th>
                <th scope="col">CGPA after</th>
                <th scope="col">Class after</th>
              </tr>
            </thead>
            <tbody>
              {semesters.map((s) => (
                <tr key={`${s.academic_year}-${s.semester}`}>
                  <th scope="row">{semesterTitle(s.academic_year, s.semester)}</th>
                  <td data-label="Level">{s.level}</td>
                  <td data-label="Credits">{s.total_credits}</td>
                  <td data-label="Grade points">{s.total_grade_points.toFixed(1)}</td>
                  <td data-label="GPA"><strong>{s.gpa.toFixed(2)}</strong></td>
                  <td data-label="CGPA after"><strong>{s.cgpa.toFixed(2)}</strong></td>
                  <td data-label="Class after">{classifyWithBands(s.cgpa, bands)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">All semesters</th>
                <td className="gp-empty" />
                <td data-label="Credits">{allCredits}</td>
                <td data-label="Grade points">{allPoints.toFixed(1)}</td>
                <td className="gp-empty" />
                <td data-label="CGPA"><strong>{enrollment.cgpa.toFixed(2)}</strong></td>
                <td data-label="Class">{currentClass}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* ---------- How it is worked out ---------- */}
      <section className="db-card gp-working" aria-labelledby="gp-how">
        <button type="button" className="gp-working-toggle" aria-expanded={showWorking} aria-controls="gp-working-body"
          onClick={() => setShowWorking(!showWorking)}>
          <span className="db-h2" id="gp-how">
            <span className="db-h2-icon" aria-hidden="true"><Icon name="help" size={16} /></span>
            How is this worked out?
          </span>
          <span className={`gp-chev${showWorking ? " open" : ""}`}><Icon name="chevronDown" size={18} /></span>
        </button>
        {showWorking && (
          <div id="gp-working-body" className="gp-working-body">
            <p>
              <strong>Semester GPA</strong> is your total grade points divided by your total credits. Each course gives
              grade points equal to its grade's value times its credits. Here is your latest semester,{" "}
              {semesterTitle(latest.academic_year, latest.semester)}:
            </p>
            <ul className="gp-sums">
              {latest.results.map((r) => (
                <li key={r.result_id}>
                  <span>{r.course_code}</span>
                  <span>{r.grade} ({r.grade_point.toFixed(1)}) × {r.credit_hours} credits</span>
                  <strong>{(r.grade_point * r.credit_hours).toFixed(1)}</strong>
                </li>
              ))}
              <li className="gp-sums-total">
                <span>Total</span>
                <span>{latest.total_credits} credits</span>
                <strong>{latest.total_grade_points.toFixed(1)}</strong>
              </li>
            </ul>
            <p className="gp-formula">
              {latest.total_grade_points.toFixed(1)} ÷ {latest.total_credits} = {threeDp(latest.total_grade_points / latest.total_credits)}
              {" "}<Icon name="arrowRight" size={16} /> <strong>{truncateGpa(latest.total_grade_points, latest.total_credits).toFixed(2)}</strong>
            </p>
            <p>
              <strong>UPSA cuts off after two decimals instead of rounding.</strong> A GPA of 3.029 is recorded as 3.02, not 3.03.
            </p>
            <p>
              <strong>CGPA</strong> works the same way across every semester of this programme:{" "}
              {allPoints.toFixed(1)} grade points ÷ {allCredits} credits = {threeDp(allPoints / allCredits)}, recorded as{" "}
              <strong>{enrollment.cgpa.toFixed(2)}</strong>.
            </p>
            {enrollment.award_type === "degree" && enrollment.is_top_up && (
              <p className="gp-muted">Your degree CGPA only counts your degree results. Your diploma keeps its own CGPA.</p>
            )}
          </div>
        )}
      </section>

      {/* ---------- Grading scale ---------- */}
      <section className="db-card" aria-labelledby="gp-scale">
        <div className="db-card-head">
          <h2 id="gp-scale" className="db-h2">
            <span className="db-h2-icon" aria-hidden="true"><Icon name="results" size={16} /></span>
            UPSA grading scale
          </h2>
        </div>
        <ul className="gp-scale">
          {(gradeScale || []).map((g) => (
            <li key={g.grade} className={`rs-g-${g.grade.replace("+", "p").replace("-", "m")}`}>
              <strong>{g.grade}</strong>
              <span>{g.marks}%</span>
              <em>{g.grade_point.toFixed(1)}</em>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
