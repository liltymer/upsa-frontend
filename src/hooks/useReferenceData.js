import { useEffect, useState } from "react";
import { getReferenceData } from "../services/api";

// Programmes, academic years, grade scale and class bands rarely change —
// fetch once per page load and share the result.
let cache = null;
let pending = null;

// Academic years the way the API builds them (UPSA's year starts in August)
function fallbackYears() {
  const now = new Date();
  const start = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return Array.from({ length: 9 }, (_, i) => `${start - i}/${start - i + 1}`);
}

// Official UPSA scale, identical to the API's. Used until the API answers
// (the free Render instance can take ~50s to wake) or if it is unreachable.
const FALLBACK = {
  // Official UPSA list, same as the API's
  programmes: [
    { name: "Diploma in Accounting", award_type: "diploma" },
    { name: "Diploma in Information Technology Management", award_type: "diploma" },
    { name: "Diploma in Management", award_type: "diploma" },
    { name: "Diploma in Marketing", award_type: "diploma" },
    { name: "Diploma in Public Relations", award_type: "diploma" },
    { name: "Bachelor of Arts in Applied French and Communications", award_type: "degree" },
    { name: "Bachelor of Arts in Communication Studies", award_type: "degree" },
    { name: "Bachelor of Arts in Public Relations Management", award_type: "degree" },
    { name: "Bachelor of Business Administration", award_type: "degree" },
    { name: "Bachelor of Laws (LLB)", award_type: "degree" },
    { name: "Bachelor of Science in Accounting", award_type: "degree" },
    { name: "Bachelor of Science in Accounting and Finance", award_type: "degree" },
    { name: "Bachelor of Science in Actuarial Science", award_type: "degree" },
    { name: "Bachelor of Science in Agribusiness and Finance", award_type: "degree" },
    { name: "Bachelor of Science in Applied Marketing", award_type: "degree" },
    { name: "Bachelor of Science in Applied Statistics", award_type: "degree" },
    { name: "Bachelor of Science in Banking and Finance", award_type: "degree" },
    { name: "Bachelor of Science in Business Economics", award_type: "degree" },
    { name: "Bachelor of Science in Data Science and Analytics", award_type: "degree" },
    { name: "Bachelor of Science in Information Technology", award_type: "degree" },
    { name: "Bachelor of Science in Logistics and Transport Management", award_type: "degree" },
    { name: "Bachelor of Science in Real Estate Management and Finance", award_type: "degree" },
  ],
  academic_years: fallbackYears(),
  current_academic_year: fallbackYears()[0],
  grade_scale: [
    { grade: "A", marks: "80-100", interpretation: "Excellent", grade_point: 4.0 },
    { grade: "B+", marks: "75-79", interpretation: "Very Good", grade_point: 3.5 },
    { grade: "B", marks: "70-74", interpretation: "Good", grade_point: 3.0 },
    { grade: "B-", marks: "65-69", interpretation: "Above Average", grade_point: 2.5 },
    { grade: "C+", marks: "60-64", interpretation: "Average", grade_point: 2.0 },
    { grade: "C", marks: "55-59", interpretation: "Below Average", grade_point: 1.5 },
    { grade: "C-", marks: "50-54", interpretation: "Marginal Pass", grade_point: 1.0 },
    { grade: "D", marks: "45-49", interpretation: "Unsatisfactory", grade_point: 0.5 },
    { grade: "F", marks: "0-44", interpretation: "Fail", grade_point: 0.0 },
  ],
  classification_bands: {
    degree: [
      { label: "First Class", min: 3.6, range: "3.60 - 4.00" },
      { label: "Second Class Upper", min: 3.0, range: "3.00 - 3.59" },
      { label: "Second Class Lower", min: 2.5, range: "2.50 - 2.99" },
      { label: "Third Class", min: 2.0, range: "2.00 - 2.49" },
      { label: "Pass", min: 1.0, range: "1.00 - 1.99" },
      { label: "Fail", min: 0.0, range: "below 1.00" },
    ],
    diploma: [
      { label: "Distinction", min: 3.5, range: "3.50 - 4.00" },
      { label: "Credit", min: 2.5, range: "2.50 - 3.49" },
      { label: "Pass", min: 1.0, range: "1.00 - 2.49" },
      { label: "Fail", min: 0.0, range: "below 1.00" },
    ],
  },
  max_level: { diploma: 200, degree: 400 },
  top_up_entry_levels: [200, 300],
};

export default function useReferenceData() {
  const [data, setData] = useState(cache || FALLBACK);

  useEffect(() => {
    if (cache) return;
    pending = pending || getReferenceData();
    let active = true;
    pending
      .then((result) => {
        cache = result;
        if (active) setData(result);
      })
      .catch(() => {
        pending = null;
      });
    return () => {
      active = false;
    };
  }, []);

  return data;
}
