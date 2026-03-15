import { Link } from "react-router-dom";

const features = [
  {
    icon: "📊",
    title: "CGPA Tracker",
    desc: "Track your cumulative GPA across every semester with real-time updates and visual progress.",
    color: "var(--blue-bg)",
    border: "var(--blue-border)",
    iconColor: "var(--blue)",
  },
  {
    icon: "⚡",
    title: "Risk Analysis",
    desc: "Get instant alerts when your academic standing is at risk before it's too late to act.",
    color: "var(--amber-bg)",
    border: "var(--amber-border)",
    iconColor: "var(--amber)",
  },
  {
    icon: "📄",
    title: "PDF Transcript",
    desc: "Generate and download a formatted academic transcript of all your results at any time.",
    color: "var(--green-bg)",
    border: "var(--green-border)",
    iconColor: "var(--green)",
  },
  {
    icon: "🎯",
    title: "CGPA Simulator",
    desc: "Simulate future grades and calculate exactly what you need to hit your target classification.",
    color: "#FDF4FF",
    border: "#E9D5FF",
    iconColor: "#7C3AED",
  },
  {
    icon: "📈",
    title: "GPA Trends",
    desc: "Visualise your academic performance over time with an interactive semester-by-semester chart.",
    color: "var(--orange-bg)",
    border: "var(--orange-border)",
    iconColor: "var(--orange)",
  },
  {
    icon: "🏆",
    title: "Classification Ladder",
    desc: "See exactly where you stand on the UPSA classification scale and how far you are from First Class.",
    color: "var(--red-bg)",
    border: "var(--red-border)",
    iconColor: "var(--red)",
  },
];

const classifications = [
  { label: "First Class", range: "3.6 – 4.0", color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)", icon: "🥇" },
  { label: "2nd Class Upper", range: "3.0 – 3.59", color: "var(--blue)", bg: "var(--blue-bg)", border: "var(--blue-border)", icon: "🥈" },
  { label: "2nd Class Lower", range: "2.5 – 2.99", color: "var(--amber)", bg: "var(--amber-bg)", border: "var(--amber-border)", icon: "🥉" },
  { label: "Third Class", range: "2.0 – 2.49", color: "var(--orange)", bg: "var(--orange-bg)", border: "var(--orange-border)", icon: "🎖️" },
];

const steps = [
  { num: "01", title: "Create your account", desc: "Register with your index number, email and programme in under 2 minutes." },
  { num: "02", title: "Enter your results", desc: "Add your semester results using the grade letters from your official result sheet." },
  { num: "03", title: "Track everything", desc: "Your CGPA, risk level, trends and transcript are all calculated instantly." },
];

export default function Landing() {
  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "var(--font-body)",
      background: "var(--bg-page)",
      overflowX: "hidden",
    }}>

      {/* ================================
          NAVBAR
      ================================ */}
      <nav style={{
        background: "var(--navy)",
        position: "sticky",
        top: 0, zIndex: 100,
        boxShadow: "0 2px 12px rgba(8,28,70,0.2)",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>

          {/* Brand */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <div style={{
              width: 34, height: 34,
              borderRadius: "50%",
              background: "rgba(255,192,5,0.12)",
              border: "1.5px solid rgba(255,192,5,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 5,
              overflow: "hidden",
            }}>
              <img
                src="/upsa-logo.png" alt="UPSA"
                style={{
                  width: "100%", height: "100%",
                  objectFit: "contain",
                  filter: "brightness(1.2)",
                }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
            <span style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800, fontSize: 15,
              color: "var(--gold)",
            }}>
              GradeIQ UPSA
            </span>
          </div>

          {/* Nav links */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <Link
              to="/login"
              style={{
                padding: "8px 18px",
                borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-heading)",
                fontWeight: 600, fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                transition: "var(--transition)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn btn-gold btn-sm"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      {/* ================================
          HERO SECTION
      ================================ */}
      <div style={{
        background: "linear-gradient(160deg, #060f2e 0%, var(--navy) 60%, #0a2050 100%)",
        padding: "80px 32px 100px",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}>

        {/* Background orbs */}
        <div style={{
          position: "absolute", top: -100, right: -100,
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,192,5,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -80,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,58,122,0.5) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        {/* Gold top line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
        }} />

        <div style={{
          position: "relative", zIndex: 10,
          maxWidth: 720, margin: "0 auto",
        }} className="fade-up">

          {/* Badge */}
          <div className="badge badge-navy" style={{
            margin: "0 auto 24px",
            display: "inline-flex",
          }}>
            <span style={{
              width: 5, height: 5,
              borderRadius: "50%",
              background: "var(--gold)",
            }} />
            University of Professional Studies, Accra
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 900,
            fontSize: "clamp(36px, 6vw, 64px)",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: 20,
          }}>
            <span style={{ color: "var(--gold)" }}>Know Your Grade.</span>
            <br />
            <span style={{ color: "white" }}>Own Your Future.</span>
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "clamp(15px, 2vw, 18px)",
            lineHeight: 1.7,
            marginBottom: 40,
            maxWidth: 560,
            margin: "0 auto 40px",
          }}>
            The smart academic platform built exclusively for UPSA students.
            Track your CGPA, analyse your risk and plan your path to
            First Class — all in one place.
          </p>

          {/* CTA buttons */}
          <div style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 56,
          }}>
            <Link
              to="/register"
              className="btn btn-gold btn-lg"
              style={{ minWidth: 180 }}
            >
              Get Started Free →
            </Link>
            <Link
              to="/login"
              className="btn btn-ghost btn-lg"
              style={{ minWidth: 140 }}
            >
              Sign In
            </Link>
          </div>

          {/* Stats row */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            flexWrap: "wrap",
          }}>
            {[
              { value: "Free", label: "Forever" },
              { value: "9", label: "Grade types" },
              { value: "6", label: "Smart tools" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <p style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900, fontSize: 28,
                  color: "var(--gold)", lineHeight: 1,
                  marginBottom: 4,
                }}>
                  {stat.value}
                </p>
                <p style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.35)",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ================================
          FEATURES SECTION
      ================================ */}
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "80px 32px",
      }}>

        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700, fontSize: 12,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 12,
          }}>
            Everything you need
          </p>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
            fontSize: "clamp(24px, 4vw, 36px)",
            color: "var(--navy)",
            marginBottom: 16,
            letterSpacing: "-0.02em",
          }}>
            Built for UPSA students,
            <br />by a UPSA student.
          </h2>
          <p style={{
            color: "var(--text-muted)",
            fontSize: 16, lineHeight: 1.7,
            maxWidth: 520, margin: "0 auto",
          }}>
            Every feature was designed around how UPSA calculates grades,
            classifies students and measures academic performance.
          </p>
        </div>

        <div className="grid-3" style={{ gap: 20 }}>
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`card fade-up-${Math.min(i + 1, 5)}`}
              style={{
                border: `1.5px solid ${f.border}`,
                cursor: "default",
              }}
            >
              <div style={{
                width: 52, height: 52,
                borderRadius: "var(--radius-md)",
                background: f.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <h3 style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700, fontSize: 16,
                color: "var(--navy)", marginBottom: 8,
              }}>
                {f.title}
              </h3>
              <p style={{
                fontSize: 14,
                color: "var(--text-muted)",
                lineHeight: 1.7,
              }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* ================================
          CLASSIFICATION SECTION
      ================================ */}
      <div style={{
        background: "linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)",
        padding: "80px 32px",
        position: "relative",
        overflow: "hidden",
      }}>

        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 300, height: 300, borderRadius: "50%",
          background: "rgba(255,192,5,0.05)",
          pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: 1200, margin: "0 auto",
          position: "relative", zIndex: 10,
        }}>

          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: "clamp(24px, 4vw, 36px)",
              color: "white", marginBottom: 12,
              letterSpacing: "-0.02em",
            }}>
              UPSA Classification Scale
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 15, lineHeight: 1.7,
            }}>
              GradeIQ uses the official UPSA grading system.
              Know exactly where you stand.
            </p>
          </div>

          <div className="grid-4" style={{ gap: 16 }}>
            {classifications.map((c) => (
              <div key={c.label} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "var(--radius-lg)",
                padding: "24px 20px",
                textAlign: "center",
                transition: "var(--transition)",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = c.bg;
                  e.currentTarget.style.borderColor = c.border;
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <p style={{ fontSize: 32, marginBottom: 12 }}>{c.icon}</p>
                <p style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700, fontSize: 14,
                  color: "white", marginBottom: 6,
                }}>
                  {c.label}
                </p>
                <p style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900, fontSize: 18,
                  color: "var(--gold)",
                }}>
                  {c.range}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ================================
          HOW IT WORKS
      ================================ */}
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "80px 32px",
      }}>

        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700, fontSize: 12,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 12,
          }}>
            Simple to use
          </p>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
            fontSize: "clamp(24px, 4vw, 36px)",
            color: "var(--navy)",
            letterSpacing: "-0.02em",
          }}>
            Up and running in 3 steps
          </h2>
        </div>

        <div className="grid-3" style={{ gap: 24 }}>
          {steps.map((step, i) => (
            <div key={step.num} style={{
              textAlign: "center",
              padding: "40px 28px",
              background: "var(--bg-card)",
              borderRadius: "var(--radius-xl)",
              border: "1.5px solid var(--border)",
              boxShadow: "var(--shadow-md)",
              position: "relative",
              transition: "var(--transition)",
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "var(--shadow-lg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
            >
              <div style={{
                width: 56, height: 56,
                borderRadius: "var(--radius-md)",
                background: "var(--navy)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <span style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900, fontSize: 14,
                  color: "var(--gold)",
                }}>
                  {step.num}
                </span>
              </div>
              <h3 style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700, fontSize: 16,
                color: "var(--navy)", marginBottom: 10,
              }}>
                {step.title}
              </h3>
              <p style={{
                fontSize: 14,
                color: "var(--text-muted)",
                lineHeight: 1.7,
              }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* ================================
          CTA SECTION
      ================================ */}
      <div style={{
        background: "linear-gradient(135deg, #060f2e 0%, var(--navy) 100%)",
        padding: "80px 32px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>

        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,192,5,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />

        <div style={{
          position: "relative", zIndex: 10,
          maxWidth: 600, margin: "0 auto",
        }} className="fade-up">

          <p style={{ fontSize: 40, marginBottom: 20 }}>🎓</p>

          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 900,
            fontSize: "clamp(28px, 4vw, 44px)",
            color: "white", marginBottom: 16,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}>
            Start tracking your
            <br />
            <span style={{ color: "var(--gold)" }}>CGPA today.</span>
          </h2>

          <p style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 16, lineHeight: 1.7,
            marginBottom: 36,
          }}>
            Free forever. No scores needed.
            Just your grades, your goals and your growth.
          </p>

          <Link
            to="/register"
            className="btn btn-gold btn-lg"
            style={{ minWidth: 220, fontSize: 16 }}
          >
            Create Free Account →
          </Link>

        </div>
      </div>

      {/* ================================
          FOOTER
      ================================ */}
      <div style={{
        background: "#060f2e",
        padding: "32px",
        textAlign: "center",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          marginBottom: 12,
        }}>
          <div style={{
            width: 28, height: 28,
            borderRadius: "50%",
            background: "rgba(255,192,5,0.1)",
            border: "1px solid rgba(255,192,5,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
            overflow: "hidden",
          }}>
            <img
              src="/upsa-logo.png" alt="UPSA"
              style={{
                width: "100%", height: "100%",
                objectFit: "contain",
                filter: "brightness(1.2)",
              }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
          <span style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700, fontSize: 13,
            color: "var(--gold)",
          }}>
            GradeIQ UPSA
          </span>
        </div>

        <p style={{
          color: "rgba(255,255,255,0.2)",
          fontSize: 12,
          fontFamily: "var(--font-heading)",
          marginBottom: 4,
        }}>
          University of Professional Studies, Accra
        </p>
        <p style={{
          color: "rgba(255,255,255,0.15)",
          fontSize: 11,
          fontFamily: "var(--font-heading)",
        }}>
          © 2026 GradeIQ UPSA · Developed by Ahenkora Joshua Owusu ·
          Scholarship with Professionalism
        </p>
      </div>

    </div>
  );
}