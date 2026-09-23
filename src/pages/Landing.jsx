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
  return (
    <div className="lp" id="top">
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
