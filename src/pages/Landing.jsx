import { useEffect, useRef } from "react";
import "../components/landing/landing.css";
import LandingNav from "../components/landing/LandingNav";
import Hero from "../components/landing/Hero";
import LandingFooter from "../components/landing/LandingFooter";
import {
  Closing,
  Facts,
  Faq,
  Features,
  Grading,
  HowItWorks,
  Support,
  TopUp,
} from "../components/landing/Sections";

// Public landing page. Copy lives in components/landing/content.js.
export default function Landing() {
  const rootRef = useRef(null);

  // Reveal sections as they scroll into view. Content is only hidden once this
  // runs (the lp-js class), so the page stays readable if JavaScript is slow.
  useEffect(() => {
    const root = rootRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!root || reduceMotion || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    root.classList.add("lp-js");
    root.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      root.classList.remove("lp-js");
    };
  }, []);

  return (
    <div className="lp" id="top" ref={rootRef}>
      <a className="lp-skip" href="#main">Skip to content</a>
      <LandingNav />
      <main id="main">
        <Hero />
        <Facts />
        <Features />
        <HowItWorks />
        <Grading />
        <TopUp />
        <Faq />
        <Support />
        <Closing />
      </main>
      <LandingFooter />
    </div>
  );
}
