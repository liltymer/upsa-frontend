import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import useReferenceData from "../../hooks/useReferenceData";
import {
  CLOSING,
  CONTACT,
  FACTS,
  FAQS,
  FEATURES,
  FEATURES_INTRO,
  GRADING,
  STEPS,
  SUPPORT,
  TOP_UP,
} from "./content";

export function Facts() {
  return (
    <section className="lp-facts" aria-label="Key facts">
      <div className="lp-container">
        <ul className="lp-facts-list">
          {FACTS.map((fact) => (
            <li key={fact.label}>
              <span className="lp-fact-value">{fact.value}</span>
              <span className="lp-fact-label">{fact.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Features() {
  return (
    <section id="features" className="lp-section lp-section-soft" aria-labelledby="lp-features-title">
      <div className="lp-container">
        <div className="lp-section-head">
          <p className="lp-eyebrow">{FEATURES_INTRO.eyebrow}</p>
          <h2 id="lp-features-title" className="lp-h2">{FEATURES_INTRO.title}</h2>
          <p className="lp-lead">{FEATURES_INTRO.body}</p>
        </div>
        <div className="lp-feature-grid">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="lp-feature">
              <div className="lp-icon"><Icon name={feature.icon} /></div>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TopUp() {
  const { example } = TOP_UP;
  return (
    <section id="top-up" className="lp-section lp-section-navy lp-topup" aria-labelledby="lp-topup-title">
      <div className="lp-container lp-topup-grid">
        <div>
          <p className="lp-eyebrow">{TOP_UP.eyebrow}</p>
          <h2 id="lp-topup-title" className="lp-h2">{TOP_UP.title}</h2>
          <p className="lp-lead">{TOP_UP.body}</p>
          <ul className="lp-checklist">
            {TOP_UP.points.map((point) => (
              <li key={point}>
                <Icon name="check" size={20} strokeWidth={2.4} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lp-journey" aria-label="Example of a diploma and a top-up degree on one account">
          <span className="lp-journey-tag">{example.label}</span>
          <div className="lp-programme-card">
            <div>
              <h3>{example.diploma.title}</h3>
              <p className="lp-programme-meta">{example.diploma.meta}</p>
            </div>
            <div className="lp-programme-score">
              <strong>{example.diploma.cgpa}</strong>
              <span>{example.diploma.classLabel}</span>
            </div>
          </div>
          <div className="lp-journey-arrow">
            <Icon name="arrowDown" size={18} strokeWidth={2.2} />
            <span>Top-up with a new index number</span>
          </div>
          <div className="lp-programme-card current">
            <div>
              <h3>{example.degree.title}</h3>
              <p className="lp-programme-meta">{example.degree.meta}</p>
            </div>
            <div className="lp-programme-score">
              <strong>{example.degree.cgpa}</strong>
              <span>{example.degree.classLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="lp-section" aria-labelledby="lp-steps-title">
      <div className="lp-container">
        <div className="lp-section-head">
          <p className="lp-eyebrow">How it works</p>
          <h2 id="lp-steps-title" className="lp-h2">Ready in three steps</h2>
          <p className="lp-lead">If you have your result slip, you have everything you need.</p>
        </div>
        <ol className="lp-steps">
          {STEPS.map((step) => (
            <li key={step.title} className="lp-step">
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Grading() {
  const { grade_scale: gradeScale, classification_bands: bands } = useReferenceData();
  const [scale, setScale] = useState("degree");
  const shownBands = bands[scale] || [];

  return (
    <section id="grading" className="lp-section lp-section-soft" aria-labelledby="lp-grading-title">
      <div className="lp-container">
        <div className="lp-section-head">
          <p className="lp-eyebrow">{GRADING.eyebrow}</p>
          <h2 id="lp-grading-title" className="lp-h2">{GRADING.title}</h2>
          <p className="lp-lead">{GRADING.body}</p>
        </div>

        <div className="lp-grading-grid">
          <div className="lp-panel">
            <h3 className="lp-panel-title">Grade points</h3>
            <table className="lp-table">
              <thead>
                <tr>
                  <th scope="col">Grade</th>
                  <th scope="col">Marks (%)</th>
                  <th scope="col">Interpretation</th>
                  <th scope="col">Point</th>
                </tr>
              </thead>
              <tbody>
                {gradeScale.map((g) => (
                  <tr key={g.grade}>
                    <td>{g.grade}</td>
                    <td>{g.marks}</td>
                    <td>{g.interpretation}</td>
                    <td>{g.grade_point.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <div className="lp-panel">
              <h3 className="lp-panel-title">Class on your final CGPA</h3>
              <div className="lp-tabs" role="tablist" aria-label="Programme type">
                {[
                  { id: "degree", label: "Degree" },
                  { id: "diploma", label: "Diploma" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`lp-tab-${tab.id}`}
                    aria-selected={scale === tab.id}
                    aria-controls="lp-bands"
                    className="lp-tab"
                    onClick={() => setScale(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <ul id="lp-bands" className="lp-bands" role="tabpanel" aria-labelledby={`lp-tab-${scale}`}>
                {shownBands.map((band, i) => (
                  <li key={band.label} className={`lp-band${i === 0 ? " top" : ""}`}>
                    <strong>{band.label}</strong>
                    <span>{band.range}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="lp-method">{GRADING.method}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="lp-section" aria-labelledby="lp-faq-title">
      <div className="lp-container">
        <div className="lp-section-head center">
          <p className="lp-eyebrow">Questions</p>
          <h2 id="lp-faq-title" className="lp-h2">Frequently asked questions</h2>
        </div>
        <div className="lp-faq">
          {FAQS.map((item, i) => (
            <details key={item.q} open={i === 0}>
              <summary>
                <span>{item.q}</span>
                <Icon name="plus" size={20} strokeWidth={2} />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Support() {
  return (
    <section id="support" className="lp-section lp-section-soft" aria-labelledby="lp-support-title">
      <div className="lp-container lp-support-grid">
        <div>
          <p className="lp-eyebrow">{SUPPORT.eyebrow}</p>
          <h2 id="lp-support-title" className="lp-h2">{SUPPORT.title}</h2>
          <p className="lp-lead">{SUPPORT.body}</p>
        </div>
        <div className="lp-contact-list">
          <a className="lp-contact" href={`mailto:${CONTACT.email}`}>
            <span className="lp-icon"><Icon name="mail" /></span>
            <span>
              <small>Email</small>
              <strong>{CONTACT.email}</strong>
            </span>
          </a>
          <a className="lp-contact" href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer">
            <span className="lp-icon"><Icon name="phone" /></span>
            <span>
              <small>Phone and WhatsApp</small>
              <strong>{CONTACT.phoneDisplay}</strong>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

export function Closing() {
  return (
    <section className="lp-section lp-section-navy" aria-labelledby="lp-closing-title">
      <div className="lp-container lp-closing">
        <h2 id="lp-closing-title" className="lp-h2">{CLOSING.title}</h2>
        <p className="lp-lead">{CLOSING.body}</p>
        <Link to="/register" className="lp-btn lp-btn-gold">{CLOSING.cta}</Link>
      </div>
    </section>
  );
}
