import { Link } from "react-router-dom";
import { CONTACT, FOOTER, LINKS } from "./content";

function FooterLink({ link }) {
  return link.to
    ? <Link to={link.to}>{link.label}</Link>
    : <a href={link.href}>{link.label}</a>;
}

export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="lp-footer">
      <div className="lp-container">
        <div className="lp-footer-grid">
          <div className="lp-footer-brand">
            <a href="#top" className="lp-brand" aria-label="GradeIQ UPSA, back to top">
              <img src="/upsa-logo.png" alt="" width="40" height="40" />
              <span className="lp-brand-name">GradeIQ <span>UPSA</span></span>
            </a>
            <p className="lp-footer-tagline">{FOOTER.tagline}</p>
            <ul className="lp-social" aria-label="Developer profiles">
              <li><a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
              <li><a href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>

          {FOOTER.columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}><FooterLink link={link} /></li>
                ))}
                {column.title === "Help" && (
                  <>
                    <li><a href={`mailto:${CONTACT.email}`}>Email support</a></li>
                    <li>
                      <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer">
                        WhatsApp {CONTACT.phoneDisplay}
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          ))}
        </div>

        <div className="lp-disclaimer" role="note">
          <strong>{FOOTER.disclaimerTitle}</strong>
          <p>{FOOTER.disclaimer}</p>
        </div>

        <div className="lp-footer-bottom">
          <span>&copy; {year} {FOOTER.copyright}</span>
          <span>{FOOTER.credit}</span>
          <a href="#top" className="lp-to-top">Back to top</a>
        </div>
      </div>
    </footer>
  );
}
