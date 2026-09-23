import { useEffect, useState } from "react";
import { getReferenceData } from "../services/api";

// Programmes, academic years, grade scale and class bands rarely change —
// fetch once per page load and share the result.
let cache = null;
let pending = null;

const FALLBACK = {
  programmes: [],
  academic_years: [],
  current_academic_year: "",
  grade_scale: [],
  classification_bands: { degree: [], diploma: [] },
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
