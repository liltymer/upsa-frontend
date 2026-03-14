import { useState, useEffect } from "react";
import { getTranscript, downloadTranscript } from "../services/api";

export default function Transcript() {
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const data = await getTranscript();
        setTranscript(data);
      } catch (err) {
        setError("Failed to load transcript.");
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
    } catch (err) {
      setError("Failed to download PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const getGradeStyle = (grade) => {
    if (grade === "A") return { bg: "#DCFCE7", color: "#166534" };
    if (["B+", "B", "B-"].includes(grade)) return { bg: "#DBEAFE", color: "#1e40af" };
    if (["C+", "C"].includes(grade)) return { bg: "#FEF3C7", color: "#92400E" };
    if (grade === "C-") return { bg: "#FFEDD5", color: "#9a3412" };
    if (grade === "D") return { bg: "#FEE2E2", color: "#B91C1C" };
    return { bg: "#FEE2E2", color: "#7F1D1D" };
  };

  const getClassification = (cgpa) => {
    if (cgpa >= 3.6) return { label: "First Class", color: "#166534", bg: "#F0FDF4", border: "#BBF7D0" };
    if (cgpa >= 3.0) return { label: "Second Class Upper", color: "#1e40af", bg: "#EFF6FF", border: "#BFDBFE" };
    if (cgpa >= 2.5) return { label: "Second Class Lower", color: "#92400E", bg: "#FFFBEB", border: "#FDE68A" };
    if (cgpa >= 2.0) return { label: "Third Class", color: "#9a3412", bg: "#FFF7ED", border: "#FED7AA" };
    if (cgpa >= 1.0) return { label: "Pass", color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" };
    return { label: "Fail", color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA" };
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#F5F7FF",
        display: "flex", alignItems: "center",
        justifyContent: "center", flexDirection: "column", gap: 16,
      }}>
        <div style={{
          width: 48, height: 48,
          border: "4px solid rgba(8,28,70,0.08)",
          borderTop: "4px solid #081C46",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 600, color: "#081C46", fontSize: 14,
        }}>Loading transcript...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh", background: "#F5F7FF",
        display: "flex", alignItems: "center",
        justifyContent: "center", padding: 24,
      }}>
        <div style={{
          background: "#FEF2F2",
          borderLeft: "4px solid #EF4444",
          padding: "20px 28px",
          borderRadius: "0 16px 16px 0",
          color: "#B91C1C", fontWeight: 500, fontSize: 14,
        }}>
          {error}
        </div>
      </div>
    );
  }

  const classification = getClassification(transcript?.cgpa ?? 0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F7FF",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ================================
          HEADER
      ================================ */}
      <div style={{
        background: "linear-gradient(135deg, #081C46 0%, #1a3a7a 100%)",
        padding: "40px 32px 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 220, height: 220, borderRadius: "50%",
          background: "rgba(255,192,5,0.06)",
        }} />
        <div style={{
          position: "absolute", bottom: -40, left: "40%",
          width: 160, height: 160, borderRadius: "50%",
          background: "rgba(255,192,5,0.04)",
        }} />

        <div style={{
          maxWidth: 1200, margin: "0 auto",
          position: "relative", zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ animation: "fadeUp 0.5s ease forwards", opacity: 0 }}>
            <p style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 12, fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}>
              Academic Records
            </p>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: 28,
              color: "#ffffff", marginBottom: 4,
            }}>
              Academic Transcript
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.4)", fontSize: 13,
            }}>
              {transcript?.transcript?.length ?? 0} semester
              {transcript?.transcript?.length !== 1 ? "s" : ""} on record
            </p>
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={downloading || !transcript?.transcript?.length}
            style={{
              background: downloading ? "rgba(255,192,5,0.6)" : "#FFC005",
              color: "#081C46",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: 14,
              padding: "13px 28px",
              borderRadius: 12,
              border: "none",
              cursor: downloading || !transcript?.transcript?.length
                ? "not-allowed" : "pointer",
              opacity: !transcript?.transcript?.length ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
              animation: "fadeUp 0.5s ease 0.1s forwards",
              boxShadow: "0 4px 16px rgba(255,192,5,0.3)",
            }}
            onMouseEnter={(e) => {
              if (!downloading && transcript?.transcript?.length) {
                e.currentTarget.style.background = "#e6ad00";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FFC005";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {downloading ? (
              <>
                <span style={{
                  width: 16, height: 16,
                  border: "2px solid rgba(8,28,70,0.3)",
                  borderTop: "2px solid #081C46",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.8s linear infinite",
                }} />
                Generating PDF...
              </>
            ) : (
              <>
                ⬇ Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 32px 60px",
        marginTop: -44,
        position: "relative",
        zIndex: 20,
        boxSizing: "border-box",
      }}>

        {/* ================================
            STUDENT INFO CARD
        ================================ */}
        <div style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: "28px",
          border: "1.5px solid #E5E7EB",
          boxShadow: "0 8px 32px rgba(8,28,70,0.08)",
          marginBottom: 24,
          animation: "fadeUp 0.5s ease 0.1s forwards",
          opacity: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 24,
        }}>

          {/* Student info */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{
              width: 64, height: 64,
              background: "#081C46",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <img
                src="/upsa-logo.png"
                alt="UPSA"
                style={{
                  width: 44, height: 44,
                  objectFit: "contain",
                  filter: "brightness(1.1)",
                }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
            <div>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: 20,
                color: "#081C46", marginBottom: 4,
              }}>
                {transcript?.student_name}
              </p>
              <p style={{
                fontSize: 13, color: "#6B7280",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 500,
              }}>
                Index Number: {transcript?.index_number}
              </p>
              <p style={{
                fontSize: 12, color: "#9CA3AF",
                marginTop: 2,
              }}>
                University of Professional Studies, Accra
              </p>
            </div>
          </div>

          {/* CGPA + Classification */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}>
            <div style={{ textAlign: "right" }}>
              <p style={{
                fontSize: 11, fontWeight: 700,
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginBottom: 4,
              }}>
                Final CGPA
              </p>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 900, fontSize: 40,
                color: "#081C46", lineHeight: 1,
              }}>
                {transcript?.cgpa?.toFixed(2)}
              </p>
            </div>
            <div style={{
              background: classification.bg,
              border: `2px solid ${classification.border}`,
              borderRadius: 14,
              padding: "12px 20px",
              textAlign: "center",
            }}>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: 15,
                color: classification.color,
              }}>
                {classification.label}
              </p>
              <p style={{
                fontSize: 11, color: classification.color,
                opacity: 0.7,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 500,
                marginTop: 2,
              }}>
                Degree Classification
              </p>
            </div>
          </div>

        </div>

        {/* ================================
            TRANSCRIPT — semester by semester
        ================================ */}
        {!transcript?.transcript?.length ? (
          <div style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: "60px 40px",
            border: "1.5px solid #E5E7EB",
            textAlign: "center",
            animation: "fadeUp 0.5s ease 0.2s forwards",
            opacity: 0,
          }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>📄</p>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: 18,
              color: "#081C46", marginBottom: 8,
            }}>
              No transcript available
            </h3>
            <p style={{
              color: "#9CA3AF", fontSize: 14,
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
            {transcript.transcript.map((sem, si) => {
              const totalCredits = sem.courses.reduce((s, c) => s + c.credits, 0);
              const totalPoints = sem.courses.reduce(
                (s, c) => s + c.grade_point * c.credits, 0
              );
              return (
                <div
                  key={si}
                  style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    border: "1.5px solid #E5E7EB",
                    overflow: "hidden",
                    boxShadow: "0 4px 16px rgba(8,28,70,0.06)",
                    animation: `fadeUp 0.5s ease ${0.2 + si * 0.1}s forwards`,
                    opacity: 0,
                  }}
                >
                  {/* Semester header */}
                  <div style={{
                    background: "linear-gradient(135deg, #081C46, #1a3a7a)",
                    padding: "18px 28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <div>
                      <h3 style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700, fontSize: 15,
                        color: "#ffffff",
                      }}>
                        Year {sem.year} — Semester {sem.semester}
                      </h3>
                      <p style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: 12, marginTop: 2,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}>
                        {sem.courses.length} course
                        {sem.courses.length !== 1 ? "s" : ""} · {totalCredits} credits
                      </p>
                    </div>
                    <div style={{
                      textAlign: "right",
                    }}>
                      <p style={{
                        fontSize: 11, fontWeight: 700,
                        color: "rgba(255,255,255,0.4)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        marginBottom: 2,
                      }}>
                        Semester GPA
                      </p>
                      <p style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 900, fontSize: 28,
                        color: "#FFC005", lineHeight: 1,
                      }}>
                        {sem.semester_gpa.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Table header */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "80px 2fr 1fr 80px 80px 80px",
                    padding: "12px 28px",
                    background: "#F5F7FF",
                    borderBottom: "1px solid #E5E7EB",
                  }}>
                    {[
                      "Code", "Course Title", "Credit Hours",
                      "Score", "Grade", "Points",
                    ].map((h) => (
                      <span key={h} style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700, fontSize: 11,
                        color: "#9CA3AF",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}>
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Course rows */}
                  {sem.courses.map((course, ci) => {
                    const gradeStyle = getGradeStyle(course.grade);
                    return (
                      <div
                        key={ci}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "80px 2fr 1fr 80px 80px 80px",
                          padding: "16px 28px",
                          borderBottom: ci < sem.courses.length - 1
                            ? "1px solid #F5F7FF" : "none",
                          alignItems: "center",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#FAFBFF";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {/* Code */}
                        <span style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700, fontSize: 13,
                          color: "#081C46",
                        }}>
                          {course.course_code}
                        </span>

                        {/* Title */}
                        <span style={{
                          fontSize: 14, color: "#374151",
                          fontWeight: 500,
                        }}>
                          {course.course_title}
                        </span>

                        {/* Credits */}
                        <span style={{
                          fontSize: 13, color: "#6B7280",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 500,
                        }}>
                          {course.credits} cr
                        </span>

                        {/* Score — shown as dash since not stored on transcript */}
                        <span style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700, fontSize: 14,
                          color: "#081C46",
                        }}>
                          —
                        </span>

                        {/* Grade */}
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 40, height: 40,
                          borderRadius: 10,
                          background: gradeStyle.bg,
                          color: gradeStyle.color,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 800, fontSize: 13,
                        }}>
                          {course.grade}
                        </span>

                        {/* Points */}
                        <span style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700, fontSize: 14,
                          color: "#6B7280",
                        }}>
                          {course.grade_point.toFixed(1)}
                        </span>

                      </div>
                    );
                  })}

                  {/* Semester summary footer */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "80px 2fr 1fr 80px 80px 80px",
                    padding: "14px 28px",
                    background: "#F5F7FF",
                    borderTop: "2px solid #E5E7EB",
                  }}>
                    <span />
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700, fontSize: 13,
                      color: "#081C46",
                    }}>
                      Semester Total
                    </span>
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700, fontSize: 13,
                      color: "#081C46",
                    }}>
                      {totalCredits} cr
                    </span>
                    <span />
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700, fontSize: 13,
                      color: "#081C46",
                    }}>
                      GPA
                    </span>
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 900, fontSize: 15,
                      color: "#FFC005",
                      background: "#081C46",
                      padding: "4px 10px",
                      borderRadius: 8,
                      display: "inline-block",
                      textAlign: "center",
                    }}>
                      {sem.semester_gpa.toFixed(2)}
                    </span>
                  </div>

                </div>
              );
            })}

            {/* Final CGPA footer */}
            <div style={{
              background: "#081C46",
              borderRadius: 16,
              padding: "24px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              animation: `fadeUp 0.5s ease ${0.3 + transcript.transcript.length * 0.1}s forwards`,
              opacity: 0,
              boxShadow: "0 8px 32px rgba(8,28,70,0.25)",
            }}>
              <div>
                <p style={{
                  fontSize: 11, fontWeight: 700,
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  marginBottom: 4,
                }}>
                  Cumulative Grade Point Average
                </p>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 500, fontSize: 14,
                  color: "rgba(255,255,255,0.6)",
                }}>
                  {transcript?.student_name} · {transcript?.index_number}
                </p>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
              }}>
                <div style={{
                  background: classification.bg,
                  border: `1.5px solid ${classification.border}`,
                  borderRadius: 10,
                  padding: "8px 18px",
                }}>
                  <p style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700, fontSize: 13,
                    color: classification.color,
                  }}>
                    {classification.label}
                  </p>
                </div>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 900, fontSize: 48,
                  color: "#FFC005", lineHeight: 1,
                }}>
                  {transcript?.cgpa?.toFixed(2)}
                </p>
              </div>
            </div>

          </div>
        )}

      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .transcript-header { grid-template-columns: 1fr !important; }
          .transcript-table-row {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}