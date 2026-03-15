import { useState, useEffect } from "react";
import { getTranscript, downloadTranscript } from "../services/api";

export default function Transcript() {
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const data = await getTranscript();
        setTranscript(data);
      } catch {
        showToast("Failed to load transcript.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchTranscript();
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadTranscript();
      showToast("Transcript downloaded successfully!");
    } catch {
      showToast("Failed to download transcript.", "error");
    } finally {
      setDownloading(false);
    }
  };

  const getClassStyle = (cgpa) => {
    if (cgpa >= 3.6) return { label: "First Class", color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)" };
    if (cgpa >= 3.0) return { label: "Second Class Upper", color: "var(--blue)", bg: "var(--blue-bg)", border: "var(--blue-border)" };
    if (cgpa >= 2.5) return { label: "Second Class Lower", color: "var(--amber)", bg: "var(--amber-bg)", border: "var(--amber-border)" };
    if (cgpa >= 2.0) return { label: "Third Class", color: "var(--orange)", bg: "var(--orange-bg)", border: "var(--orange-border)" };
    if (cgpa >= 1.0) return { label: "Pass", color: "var(--text-muted)", bg: "#F9FAFB", border: "var(--border)" };
    return { label: "Fail", color: "var(--red)", bg: "var(--red-bg)", border: "var(--red-border)" };
  };

  const gradeClass = (grade) => {
    if (grade === "A") return "grade-A";
    if (["B+", "B", "B-"].includes(grade)) return "grade-B";
    if (["C+", "C"].includes(grade)) return "grade-C";
    if (grade === "C-") return "grade-C-";
    if (grade === "D") return "grade-D";
    return "grade-F";
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner spinner-lg spinner-dark" />
      <p>Loading transcript...</p>
    </div>
  );

  const cgpa = transcript?.cgpa ?? 0;
  const classStyle = getClassStyle(cgpa);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-page)",
      fontFamily: "var(--font-body)",
    }}>

      {/* ================================
          HEADER
      ================================ */}
      <div className="page-header">
        <div className="header-inner" style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}>
          <div className="fade-up">
            <p className="page-eyebrow">Academic Records</p>
            <h1 className="page-title">Academic Transcript</h1>
            <p style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 13,
            }}>
              {transcript?.transcript?.length ?? 0} semester{transcript?.transcript?.length !== 1 ? "s" : ""} on record
            </p>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn btn-gold btn-lg fade-up-1"
            style={{ flexShrink: 0 }}
          >
            {downloading ? (
              <><span className="spinner spinner-dark" />Downloading...</>
            ) : "⬇ Download PDF"}
          </button>
        </div>
      </div>

      {/* ================================
          CONTENT
      ================================ */}
      <div className="overlap-section" style={{ paddingBottom: 60 }}>

        {!transcript || transcript.transcript?.length === 0 ? (
          <div className="card" style={{
            textAlign: "center", padding: "60px 40px",
          }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>📄</p>
            <h3 style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700, fontSize: 18,
              color: "var(--navy)", marginBottom: 8,
            }}>
              No transcript yet
            </h3>
            <p style={{
              color: "var(--text-muted)", fontSize: 14,
              lineHeight: 1.6,
            }}>
              Add your semester results to generate your academic transcript.
            </p>
          </div>
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}>

            {/* ================================
                STUDENT INFO CARD
            ================================ */}
            <div className="card fade-up">
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 20,
                flexWrap: "wrap",
              }}>

                {/* Left — student info */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}>
                  {/* Logo */}
                  <div style={{
                    width: 60, height: 60,
                    borderRadius: "var(--radius-md)",
                    background: "var(--navy)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 8,
                    flexShrink: 0,
                    overflow: "hidden",
                  }}>
                    <img
                      src="/upsa-logo.png"
                      alt="UPSA"
                      style={{
                        width: "100%", height: "100%",
                        objectFit: "contain",
                        filter: "brightness(1.2)",
                      }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </div>

                  <div>
                    <h2 style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800, fontSize: 20,
                      color: "var(--navy)", marginBottom: 4,
                    }}>
                      {transcript.student_name}
                    </h2>
                    <p style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      marginBottom: 2,
                    }}>
                      Index Number: {transcript.index_number}
                    </p>
                    <p style={{
                      fontSize: 13,
                      color: "var(--text-muted)",
                    }}>
                      University of Professional Studies, Accra
                    </p>
                    {transcript.programme && (
                      <p style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        marginTop: 2,
                      }}>
                        {transcript.programme}
                        {transcript.level ? ` · Level ${transcript.level}` : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right — CGPA + Classification */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  flexWrap: "wrap",
                }}>
                  <div style={{ textAlign: "right" }}>
                    <p style={{
                      fontSize: 10, fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      fontFamily: "var(--font-heading)",
                      marginBottom: 4,
                    }}>
                      Final CGPA
                    </p>
                    <p style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 900, fontSize: 40,
                      color: "var(--navy)", lineHeight: 1,
                    }}>
                      {cgpa.toFixed(2)}
                    </p>
                  </div>
                  <div style={{
                    background: classStyle.bg,
                    border: `1.5px solid ${classStyle.border}`,
                    borderRadius: "var(--radius-md)",
                    padding: "14px 20px",
                    textAlign: "center",
                  }}>
                    <p style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800, fontSize: 15,
                      color: classStyle.color,
                      marginBottom: 2,
                    }}>
                      {classStyle.label}
                    </p>
                    <p style={{
                      fontSize: 11,
                      color: classStyle.color,
                      opacity: 0.7,
                      fontFamily: "var(--font-heading)",
                    }}>
                      Degree Classification
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* ================================
                SEMESTER TABLES
            ================================ */}
            {transcript.transcript.map((sem, si) => (
              <div
                key={si}
                className={`fade-up-${Math.min(si + 1, 5)}`}
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-lg)",
                  border: "1.5px solid var(--border)",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                {/* Semester header */}
                <div style={{
                  background: "linear-gradient(135deg, var(--navy), var(--navy-mid))",
                  padding: "16px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                }}>
                  <div>
                    <h3 style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700, fontSize: 15,
                      color: "white", marginBottom: 2,
                    }}>
                      Year {sem.year} — Semester {sem.semester}
                    </h3>
                    <p style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.4)",
                      fontFamily: "var(--font-heading)",
                    }}>
                      {sem.courses?.length} course{sem.courses?.length !== 1 ? "s" : ""}
                      {" · "}
                      {sem.courses?.reduce((s, c) => s + c.credits, 0)} credits
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{
                      fontSize: 10, fontWeight: 700,
                      color: "rgba(255,255,255,0.4)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontFamily: "var(--font-heading)",
                      marginBottom: 2,
                    }}>
                      Semester GPA
                    </p>
                    <p style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 900, fontSize: 24,
                      color: "var(--gold)",
                    }}>
                      {sem.semester_gpa?.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Table header — desktop */}
                <div
                  className="transcript-table-header"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr 100px 80px 80px",
                    padding: "10px 24px",
                    background: "var(--bg-page)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {["Code", "Course Title", "Credits", "Grade", "Points"].map((h) => (
                    <span key={h} style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700, fontSize: 10,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* Course rows */}
                {sem.courses?.map((course, ci) => (
                  <div key={ci}>
                    {/* Desktop row */}
                    <div
                      className="transcript-row"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "100px 1fr 100px 80px 80px",
                        padding: "14px 24px",
                        alignItems: "center",
                        borderBottom: ci < sem.courses.length - 1
                          ? "1px solid #F5F7FF" : "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#FAFBFF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 800, fontSize: 12,
                        color: "var(--navy)",
                      }}>
                        {course.course_code}
                      </span>
                      <span style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        fontWeight: 500,
                        paddingRight: 16,
                      }}>
                        {course.course_title}
                      </span>
                      <span style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-heading)",
                        fontWeight: 600,
                      }}>
                        {course.credits} cr
                      </span>
                      <span className={`grade-pill ${gradeClass(course.grade)}`}>
                        {course.grade}
                      </span>
                      <span style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 700, fontSize: 13,
                        color: "var(--text-muted)",
                      }}>
                        {course.grade_point?.toFixed(1)}
                      </span>
                    </div>

                    {/* Mobile card */}
                    <div
                      className="transcript-mobile-card"
                      style={{
                        display: "none",
                        padding: "14px 16px",
                        borderBottom: ci < sem.courses.length - 1
                          ? "1px solid var(--border)" : "none",
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}>
                        <div style={{ flex: 1, paddingRight: 12 }}>
                          <p style={{
                            fontFamily: "var(--font-heading)",
                            fontWeight: 800, fontSize: 12,
                            color: "var(--navy)", marginBottom: 2,
                          }}>
                            {course.course_code}
                          </p>
                          <p style={{
                            fontSize: 13,
                            color: "var(--text-secondary)",
                            lineHeight: 1.4,
                            marginBottom: 2,
                          }}>
                            {course.course_title}
                          </p>
                          <p style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                          }}>
                            {course.credits} credit hours
                          </p>
                        </div>
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: 4,
                        }}>
                          <span className={`grade-pill ${gradeClass(course.grade)}`}>
                            {course.grade}
                          </span>
                          <span style={{
                            fontFamily: "var(--font-heading)",
                            fontWeight: 700, fontSize: 12,
                            color: "var(--text-muted)",
                          }}>
                            {course.grade_point?.toFixed(1)} GP
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}

                {/* Semester footer */}
                <div
                  className="transcript-footer"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr 100px 80px 80px",
                    padding: "12px 24px",
                    background: "var(--bg-page)",
                    borderTop: "2px solid var(--border)",
                  }}
                >
                  <span />
                  <span style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700, fontSize: 12,
                    color: "var(--navy)",
                  }}>
                    Semester Total
                  </span>
                  <span style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700, fontSize: 12,
                    color: "var(--navy)",
                  }}>
                    {sem.courses?.reduce((s, c) => s + c.credits, 0)} cr
                  </span>
                  <span style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700, fontSize: 11,
                    color: "var(--text-muted)",
                  }}>
                    GPA
                  </span>
                  <span style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 900, fontSize: 14,
                    color: "var(--gold)",
                    background: "var(--navy)",
                    padding: "4px 8px",
                    borderRadius: 6,
                    textAlign: "center",
                    display: "inline-block",
                  }}>
                    {sem.semester_gpa?.toFixed(2)}
                  </span>
                </div>

              </div>
            ))}

            {/* ================================
                CGPA FOOTER
            ================================ */}
            <div
              className="card-dark fade-up-5"
              style={{ borderRadius: "var(--radius-lg)" }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
              }}>
                <div>
                  <p style={{
                    fontSize: 10, fontWeight: 700,
                    color: "rgba(255,255,255,0.4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    fontFamily: "var(--font-heading)",
                    marginBottom: 4,
                  }}>
                    Cumulative Grade Point Average
                  </p>
                  <p style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700, fontSize: 15,
                    color: "rgba(255,255,255,0.7)",
                  }}>
                    {transcript.student_name} · {transcript.index_number}
                  </p>
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                }}>
                  <span style={{
                    background: classStyle.bg,
                    border: `1px solid ${classStyle.border}`,
                    color: classStyle.color,
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700, fontSize: 13,
                    padding: "8px 18px",
                    borderRadius: "var(--radius-full)",
                  }}>
                    {classStyle.label}
                  </span>
                  <p style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 900, fontSize: 44,
                    color: "var(--gold)", lineHeight: 1,
                  }}>
                    {cgpa.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .transcript-table-header { display: none !important; }
          .transcript-row { display: none !important; }
          .transcript-footer { display: none !important; }
          .transcript-mobile-card { display: block !important; }
        }
        @media (min-width: 641px) {
          .transcript-row { display: grid !important; }
          .transcript-mobile-card { display: none !important; }
        }
      `}</style>

    </div>
  );
}