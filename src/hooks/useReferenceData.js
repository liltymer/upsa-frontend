import { useEffect, useState } from "react";
import { getReferenceData } from "../services/api";

// Programmes, academic years, grade scale and class bands rarely change —
// fetch once per page load and share the result.
let cache = null;
let pending = null;

// Official UPSA scale, identical to the API's. Used until the API answers
// (the free Render instance can take ~50s to wake) or if it is unreachable.
const FALLBACK = {
  programmes: [],
  academic_years: [],
  current_academic_year: "",
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
      { label: "Distinction", min: 3.6, range: "3.60 - 4.00" },
      { label: "Credit", min: 2.5, range: "2.50 - 3.59" },
      { label: "Pass", min: 1.0, range: "1.00 - 2.49" },
      { label: "Fail", min: 0.0, range: "below 1.00" },
    ],
  },
  max_level: { diploma: 200, degree: 400 },
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
