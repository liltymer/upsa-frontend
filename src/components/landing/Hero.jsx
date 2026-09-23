import { Link } from "react-router-dom";
import Icon from "./Icon";
import { HERO } from "./content";
// Campus photo: swap these two files to change the hero image.
import campus1400 from "../../assets/landing/campus-1400.webp";
import campus800 from "../../assets/landing/campus-800.webp";

export default function Hero() {
  return (
    <section className="lp-hero" aria-labelledby="lp-hero-title">
      <div className="lp-hero-copy">
        <p className="lp-hero-eyebrow">{HERO.eyebrow}</p>
        <h1 id="lp-hero-title">
          {HERO.titleLead} <em>{HERO.titleEmphasis}</em>
        </h1>
        <p className="lp-hero-body">{HERO.body}</p>
        <div className="lp-hero-ctas">
          <Link to="/register" className="lp-btn lp-btn-gold">{HERO.primaryCta}</Link>
          <Link to="/login" className="lp-btn lp-btn-outline-light">{HERO.secondaryCta}</Link>
        </div>
        <p className="lp-hero-proof">
          <Icon name="check" size={18} strokeWidth={2.4} />
          <span>{HERO.proof}</span>
        </p>
      </div>

      <div className="lp-hero-media">
        <figure className="lp-hero-frame">
          <div className="lp-hero-photo">
            <img
              src={campus1400}
              srcSet={`${campus800} 800w, ${campus1400} 1330w`}
              sizes="(max-width: 860px) 92vw, 46vw"
              width="1330"
              height="900"
              alt="Campus buildings at the University of Professional Studies, Accra"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </figure>
      </div>
    </section>
  );
}
