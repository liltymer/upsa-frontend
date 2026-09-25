import "./loading.css";

/** One shimmering placeholder block. */
export function Bone({ w = "100%", h = 14, r, dark = false, circle = false, style }) {
  return (
    <span className={`sk${dark ? " sk-dark" : ""}${circle ? " sk-circle" : ""}`} aria-hidden="true"
      style={{ width: w, height: h, borderRadius: circle ? "50%" : r, ...style }} />
  );
}

/** Thin gold bar across the top of the screen. */
export function TopProgress() {
  return <div className="top-progress" role="progressbar" aria-label="Loading" />;
}

function Head() {
  return (
    <div className="sk-head">
      <Bone w={90} h={12} />
      <Bone w="min(420px, 70%)" h={30} />
      <Bone w="min(560px, 90%)" h={14} />
    </div>
  );
}

function SummaryBand() {
  return (
    <div className="sk-hero">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="sk-row">
          <Bone dark w={42} h={42} r={12} />
          <div style={{ display: "grid", gap: 8, flex: 1 }}><Bone dark w="60%" h={10} /><Bone dark w="45%" h={24} /></div>
        </div>
      ))}
    </div>
  );
}

function Card({ lines = 4 }) {
  return (
    <div className="sk-card">
      <div className="sk-row"><Bone w={28} h={28} r={8} /><Bone w="40%" h={18} /></div>
      {Array.from({ length: lines }, (_, i) => <Bone key={i} w={`${92 - (i % 3) * 14}%`} h={14} />)}
    </div>
  );
}

function Rows({ count = 5 }) {
  return (
    <div className="sk-card">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="sk-row">
          <Bone w={40} h={40} circle />
          <div style={{ display: "grid", gap: 8, flex: 1 }}><Bone w="35%" h={14} /><Bone w="55%" h={11} /></div>
          <Bone w={60} h={24} r={999} />
        </div>
      ))}
    </div>
  );
}

/**
 * The shape of a page while its data loads.
 * variant: dashboard | summary (header, navy band, cards) | list | document | form
 */
export function PageSkeleton({ variant = "summary", label = "Loading" }) {
  return (
    <div className="sk-page" role="status" aria-live="polite">
      <span className="sk-sr">{label}...</span>
      <Head />
      {variant === "dashboard" && (
        <>
          <div className="sk-hero sk-hero-big">
            <Bone dark w={128} h={128} circle />
            <div style={{ display: "grid", gap: 12 }}><Bone dark w="50%" h={22} /><Bone dark w="80%" h={14} /><Bone dark w="70%" h={10} r={999} /></div>
          </div>
          <div className="sk-grid"><Card lines={3} /><Card lines={3} /></div>
          <Card lines={5} />
        </>
      )}
      {variant === "summary" && (
        <>
          <SummaryBand />
          <Card lines={4} />
          <div className="sk-grid"><Card /><Card /></div>
        </>
      )}
      {variant === "list" && (
        <>
          <SummaryBand />
          <Rows />
        </>
      )}
      {variant === "document" && (
        <div className="sk-paper">
          <Bone w="60%" h={22} style={{ justifySelf: "center" }} />
          <Bone w="40%" h={12} style={{ justifySelf: "center" }} />
          {Array.from({ length: 10 }, (_, i) => <Bone key={i} h={i % 4 === 0 ? 26 : 16} r={4} />)}
        </div>
      )}
      {variant === "form" && <div className="sk-grid"><Card lines={5} /><Card lines={5} /></div>}
    </div>
  );
}
