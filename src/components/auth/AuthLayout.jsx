import { Link } from "react-router-dom";
import "./auth.css";
import Icon from "../landing/Icon";
import campus1400 from "../../assets/landing/campus-1400.webp";
import campus800 from "../../assets/landing/campus-800.webp";

const DEFAULT_POINTS = [
  "Semester GPA and CGPA on the official UPSA scale",
  "Early warnings when your class is at risk",
  "Separate records for diploma and degree programmes",
];

/**
 * Shared frame for sign-in, registration and password pages:
 * navy brand panel with the campus photo on the left, form on the right.
 * On small screens the panel shrinks to a header bar.
 */
export default function AuthLayout({ topbar, panelTitle, panelBody, points = DEFAULT_POINTS, children }) {
  return (
    <div className="au">
      <aside className="au-panel" aria-label="About GradeIQ UPSA">
        <Link to="/" className="au-brand" aria-label="GradeIQ UPSA home">
          <img src="/upsa-logo.png" alt="" width="40" height="40" />
          <span className="au-brand-name">
            GradeIQ <span>UPSA</span>
            <span className="au-brand-sub">GPA and CGPA tracker</span>
          </span>
        </Link>

        <div className="au-panel-body">
          <figure className="au-frame">
            <div className="au-photo">
              <img
                src={campus1400}
                srcSet={`${campus800} 800w, ${campus1400} 1330w`}
                sizes="(max-width: 960px) 0px, 560px"
                width="1330"
                height="900"
                alt="Campus buildings at the University of Professional Studies, Accra"
                decoding="async"
              />
            </div>
          </figure>
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
        </div>

        <p className="au-panel-foot">
          An independent student project. Not operated or endorsed by the University of Professional Studies, Accra.
        </p>
      </aside>

      <main className="au-main">
        {topbar && <div className="au-topbar">{topbar}</div>}
        <div className="au-content">{children}</div>
      </main>
    </div>
  );
}
