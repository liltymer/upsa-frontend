// Shared academic display helpers.
// Classification LABELS always come from the API (it knows diploma vs degree bands);
// this file only decides how a label looks.

const CLASS_STYLES = {
  // degree
  "First Class": { color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)", bar: "#22C55E" },
  "Second Class Upper": { color: "var(--blue)", bg: "var(--blue-bg)", border: "var(--blue-border)", bar: "#3B82F6" },
  "Second Class Lower": { color: "var(--amber)", bg: "var(--amber-bg)", border: "var(--amber-border)", bar: "#F59E0B" },
  "Third Class": { color: "var(--orange)", bg: "var(--orange-bg)", border: "var(--orange-border)", bar: "#F97316" },
  // diploma
  Distinction: { color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)", bar: "#22C55E" },
  Credit: { color: "var(--blue)", bg: "var(--blue-bg)", border: "var(--blue-border)", bar: "#3B82F6" },
  // both
  Pass: { color: "var(--text-muted)", bg: "#F9FAFB", border: "var(--border)", bar: "#9CA3AF" },
  Fail: { color: "var(--red)", bg: "var(--red-bg)", border: "var(--red-border)", bar: "#EF4444" },
};

const NEUTRAL = { color: "var(--text-muted)", bg: "#F9FAFB", border: "var(--border)", bar: "#9CA3AF" };

export const classStyle = (label) => ({ label, ...(CLASS_STYLES[label] || NEUTRAL) });

// Label for a GPA value using the programme's own bands (highest first, "min" inclusive)
export const classifyWithBands = (gpa, bands = []) =>
  bands.find((b) => gpa >= b.min)?.label ?? "Fail";

export const gradeClass = (grade) => {
  if (grade === "A") return "grade-A";
  if (["B+", "B", "B-"].includes(grade)) return "grade-B";
  if (["C+", "C"].includes(grade)) return "grade-C";
  if (grade === "C-") return "grade-C-";
  if (grade === "D") return "grade-D";
  return "grade-F";
};

export const SEMESTER_NAMES = { 1: "First Semester", 2: "Second Semester" };

export const semesterTitle = (academicYear, semester) =>
  `${SEMESTER_NAMES[semester] || `Semester ${semester}`} ${academicYear}`;

// UPSA truncates GPAs to two decimals instead of rounding (2.989 is 2.98)
export const truncateGpa = (points, credits) =>
  credits ? Math.floor((points / credits) * 100 + 1e-9) / 100 : 0;

export const shortSemester = (academicYear, semester) =>
  `${academicYear.slice(2, 4)}/${academicYear.slice(7, 9)} S${semester}`;

export const programmeLabel = (enrollment) => {
  if (!enrollment) return "";
  const kind = enrollment.award_type === "diploma" ? "Diploma" : enrollment.is_top_up ? "Degree (Top-up)" : "Degree";
  const state = enrollment.is_current ? "Current" : "Completed";
  return `${enrollment.programme} · ${kind} · ${state}`;
};

// Academic years from a programme's start up to the newest selectable one
export const yearsFrom = (startAcademicYear, academicYears = []) =>
  academicYears.filter((y) => !startAcademicYear || y >= startAcademicYear);
