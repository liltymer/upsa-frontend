import { Link } from "react-router-dom";
import { CONTACT, FOOTER, NAV_LINKS } from "./content";

export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="lp-footer">
      <div className="lp-container">
        <div className="lp-footer-grid">
          <div>
            <a href="#top" className="lp-brand" aria-label="GradeIQ UPSA, back to top">
              <img src="/upsa-logo.png" alt="" width="40" height="40" />
              <span className="lp-brand-name">GradeIQ <span>UPSA</span></span>
            </a>
            <p className="lp-footer-tagline">{FOOTER.tagline}</p>
          </div>

          <nav aria-label="Footer">
            <h2>Explore</h2>
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.href}><a href={link.href}>{link.label}</a></li>
              ))}
              <li><Link to="/register">Create an account</Link></li>
              <li><Link to="/login">Sign in</Link></li>
            </ul>
          </nav>

          <div>
            <h2>Contact</h2>
            <ul>
              <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              <li><a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer">{CONTACT.phoneDisplay}</a></li>
            </ul>
          </div>
        </div>

        <p className="lp-disclaimer">{FOOTER.disclaimer}</p>

        <div className="lp-footer-bottom">
          <span>{year} GradeIQ UPSA</span>
          <span>{FOOTER.credit}</span>
        </div>
      </div>
    </footer>
  );
}
