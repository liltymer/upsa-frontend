// UPSA academic standing rules, from the Undergraduate Students' Handbook (2018)
// and the 2025/2026 supplementary re-sit guidelines. Section numbers are quoted
// on the Standing page so students can check them.

export const HANDBOOK_URL = "https://upsa.edu.gh/students/students-handbook/";
export const RESIT_URL = "https://upsa.edu.gh/revised-guidelines-for-supplementary-resit-examinations-2025-2026-academic-year/";

export const PROGRESSION_CGPA = 1.0; // 4.16 and 4.19
export const MAX_TRAILING = 2; // 4.16: not more than two failed courses, for three semesters
export const TRAIL_SEMESTERS = 3;
export const MAX_REPEATS = 1; // 4.16: a course may be repeated only once

// 4.15.1 (new course structure): minimum credits passed, and concessionary (D) credits allowed
export function graduationRule(awardType, entryLevel) {
  if (awardType === "diploma") return { minPassed: 60, concessionary: 12 };
  if (entryLevel >= 300) return { minPassed: 69, concessionary: 0 };
  if (entryLevel >= 200) return { minPassed: 99, concessionary: 0 };
  return { minPassed: 120, concessionary: 9 };
}

// 2.24: diploma FCGPA decides the level a top-up starts at
export function topUpLevel(fcgpa) {
  if (fcgpa >= 2.5) return 300;
  if (fcgpa >= 1.0) return 200;
  return null;
}

// 2025/2026 supplementary re-sits
export const RESIT = {
  maxCredits: 15,
  maxCourses: 5,
  feePerCredit: 160,
  failedGrades: ["D", "F"],
};

// Probation length by level (4.19)
export const probationSemesters = (level) => (level <= 100 ? 2 : 1);
