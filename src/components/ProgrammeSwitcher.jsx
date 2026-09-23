import { useProgrammes } from "../context/ProgrammeContext";

// Lets a student with more than one programme (e.g. diploma + top-up degree)
// choose which one a page shows. Renders nothing for single-programme students.
export default function ProgrammeSwitcher({ tone = "dark" }) {
  const { enrollments, selected, setSelectedId, hasMultiple } = useProgrammes();

  if (!hasMultiple || !selected) return null;

  const onDark = tone === "dark";

  return (
    <div
      role="tablist"
      aria-label="Programme"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 12,
      }}
    >
      {enrollments.map((e) => {
        const active = e.id === selected.id;
        return (
          <button
            key={e.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setSelectedId(e.is_current ? null : e.id)}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              border: "1px solid " + (active ? "var(--gold)" : onDark ? "rgba(255,255,255,0.15)" : "var(--border)"),
              background: active ? "var(--gold)" : "transparent",
              color: active ? "var(--navy)" : onDark ? "rgba(255,255,255,0.75)" : "var(--navy)",
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              maxWidth: "100%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={e.programme}
          >
            {e.award_type === "diploma" ? "Diploma" : e.is_top_up ? "Degree (Top-up)" : "Degree"}
            {" · "}
            {e.index_number || "index needed"}
            {e.is_current ? " · Current" : ""}
          </button>
        );
      })}
    </div>
  );
}
