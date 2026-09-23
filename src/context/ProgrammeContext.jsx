import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getEnrollments } from "../services/api";
import { useAuth } from "./AuthContext";

// Which of the student's programmes the academic pages are showing.
// A top-up student has a completed diploma and a current degree; every GPA
// figure belongs to exactly one of them.

const ProgrammeContext = createContext(null);
const STORAGE_KEY = "selectedEnrollmentId";

const readStored = () => {
  try {
    return Number(sessionStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
};

export function ProgrammeProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [selectedId, setSelectedIdState] = useState(readStored);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const list = await getEnrollments();
      setEnrollments(list);
      return list;
    } catch {
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Signed-out visitors have no programmes; fetching would trigger the 401 redirect
    if (!isAuthenticated) return undefined;
    let active = true;
    getEnrollments()
      .then((list) => active && setEnrollments(list))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const setSelectedId = (id) => {
    setSelectedIdState(id);
    try {
      if (id) sessionStorage.setItem(STORAGE_KEY, String(id));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable — selection just won't persist
    }
  };

  const current = enrollments.find((e) => e.is_current) || enrollments[0] || null;
  const selected = enrollments.find((e) => e.id === selectedId) || current;

  return (
    <ProgrammeContext.Provider
      value={{
        enrollments,
        current,
        selected,
        // undefined → API uses the current programme
        selectedEnrollmentId: selected && !selected.is_current ? selected.id : undefined,
        setSelectedId,
        refresh,
        loading,
        hasMultiple: enrollments.length > 1,
      }}
    >
      {children}
    </ProgrammeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook lives with its provider
export function useProgrammes() {
  const context = useContext(ProgrammeContext);
  if (!context) {
    throw new Error("useProgrammes must be used inside ProgrammeProvider");
  }
  return context;
}
