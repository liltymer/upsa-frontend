import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import { NAV_LINKS } from "./content";

export default function LandingNav() {
  const [open, setOpen] = useState(false);

  // Close the mobile menu with Escape
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="lp-nav">
      <div className="lp-container lp-nav-inner">
        <a href="#top" className="lp-brand" aria-label="GradeIQ UPSA, back to top">
          <img src="/upsa-logo.png" alt="" width="40" height="40" />
          <span className="lp-brand-name">
            GradeIQ <span>UPSA</span>
            <span className="lp-brand-sub">GPA and CGPA tracker</span>
          </span>
        </a>

        <nav aria-label="Main">
          <ul className="lp-nav-links">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lp-nav-actions">
          <Link to="/login" className="lp-nav-signin">Sign in</Link>
          <Link to="/register" className="lp-btn lp-btn-gold lp-btn-sm">Create an account</Link>
          <button
            type="button"
            className="lp-menu-btn"
            aria-expanded={open}
            aria-controls="lp-mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>

      <div id="lp-mobile-menu" className={`lp-mobile-menu${open ? " open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
        ))}
        <div className="lp-mobile-actions">
          <Link to="/login" className="lp-btn lp-btn-outline-light lp-btn-sm">Sign in</Link>
          <Link to="/register" className="lp-btn lp-btn-gold lp-btn-sm">Create an account</Link>
        </div>
      </div>
    </header>
  );
}
