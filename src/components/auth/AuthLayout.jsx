import { Link } from "react-router-dom";
import "./auth.css";
import Icon from "../landing/Icon";
// Wide campus photo (fountain and main buildings). Swap these files to change it.
import campus1200 from "../../assets/landing/campus-13-1200.webp";
import campus800 from "../../assets/landing/campus-13-800.webp";

const DEFAULT_POINTS = [
  "Semester GPA and CGPA on the official UPSA scale",
  "Early warnings when your class is at risk",
  "Separate records for diploma and degree programmes",
];

/**
 * Shared frame for sign-in, registration and password pages:
 * navy panel with the full campus photo across the top on the left, form on the right.
 * On small screens the panel shrinks to a header bar.
 */
export default function AuthLayout({ topbar, panelTitle, panelBody, points = DEFAULT_POINTS, children }) {
  return (
    <div className="au">
      <aside className="au-panel" aria-label="About GradeIQ UPSA">
        <div className="au-hero-photo" aria-hidden="true">
          <img
            src={campus1200}
            srcSet={`${campus800} 800w, ${campus1200} 1200w`}
            sizes="(max-width: 960px) 100vw, 50vw"
            width="1200"
            height="800"
            alt=""
            decoding="async"
          />
        </div>

        <Link to="/" className="au-brand" aria-label="GradeIQ UPSA home">
          <img src="/upsa-logo.png" alt="" width="40" height="40" />
          <span className="au-brand-name">
            GradeIQ <span>UPSA</span>
            <span className="au-brand-sub">GPA and CGPA tracker</span>
          </span>
        </Link>

        <div className="au-panel-body">
          <h2>{panelTitle}</h2>
          <p>{panelBody}</p>
          <ul className="au-points">
            {points.map((point) => (
              <li key={point}>
                <Icon name="check" size={18} strokeWidth={2.4} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="au-panel-foot">
            An independent student project. Not operated or endorsed by the University of Professional Studies, Accra.
          </p>
        </div>
      </aside>

      <main className="au-main">
        {topbar && <div className="au-topbar">{topbar}</div>}
        <div className="au-content">
          <div className="au-card">{children}</div>
        </div>
        <footer className="au-foot">
          <span>&copy; {new Date().getFullYear()} GradeIQ UPSA</span>
          <Link to="/">Back to home</Link>
        </footer>
      </main>
    </div>
  );
}
