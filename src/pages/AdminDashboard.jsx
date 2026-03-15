import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, analyticsRes, annRes] = await Promise.all([
          API.get("/admin/stats"),
          API.get("/admin/analytics"),
          API.get("/admin/announcements"),
        ]);
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
        setAnnouncements(annRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner spinner-lg spinner-dark" />
      <p>Loading admin dashboard...</p>
    </div>
  );

  const riskColors = {
    Low: { color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)" },
    Medium: { color: "var(--amber)", bg: "var(--amber-bg)", border: "var(--amber-border)" },
    High: { color: "var(--red)", bg: "var(--red-bg)", border: "var(--red-border)" },
    "No Data": { color: "var(--text-muted)", bg: "#F9FAFB", border: "var(--border)" },
  };

  const classColors = {
    "First Class": { color: "var(--green)", bg: "var(--green-bg)" },
    "Second Class Upper": { color: "var(--blue)", bg: "var(--blue-bg)" },
    "Second Class Lower": { color: "var(--amber)", bg: "var(--amber-bg)" },
    "Third Class": { color: "var(--orange)", bg: "var(--orange-bg)" },
    "Pass": { color: "var(--text-muted)", bg: "#F9FAFB" },
    "Fail": { color: "var(--red)", bg: "var(--red-bg)" },
    "No Data": { color: "var(--text-muted)", bg: "#F9FAFB" },
  };

  const priorityStyle = (priority) => {
    if (priority === "urgent") return { color: "var(--red)", bg: "var(--red-bg)", border: "var(--red-border)" };
    if (priority === "important") return { color: "var(--amber)", bg: "var(--amber-bg)", border: "var(--amber-border)" };
    return { color: "var(--blue)", bg: "var(--blue-bg)", border: "var(--blue-border)" };
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-page)",
      fontFamily: "var(--font-body)",
    }}>

      {/* ================================
          ADMIN NAVBAR
      ================================ */}
      <nav style={{
        background: "var(--navy)",
        position: "sticky", top: 0, zIndex: 100,
        height: "var(--navbar-height)",
        boxShadow: "0 2px 12px rgba(8,28,70,0.2)",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 32px", height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}>

          {/* Brand */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(255,192,5,0.12)",
              border: "1.5px solid rgba(255,192,5,0.3)",
              display: "flex", alignItems: "center",
              justifyContent: "center", padding: 5, overflow: "hidden",
            }}>
              <img
                src="/upsa-logo.png" alt="UPSA"
                style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(1.2)" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
            <div>
              <p style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800, fontSize: 14,
                color: "var(--gold)", lineHeight: 1.1,
              }}>GradeIQ UPSA</p>
              <p style={{
                fontSize: 10, color: "rgba(255,255,255,0.4)",
                fontFamily: "var(--font-heading)",
              }}>Admin Panel</p>
            </div>
          </div>

          {/* Admin nav links */}
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
          }} className="admin-nav-links">
            {[
              { label: "Overview", path: "/admin" },
              { label: "Users", path: "/admin/users" },
              { label: "Announcements", path: "/admin/announcements" },
              { label: "Courses", path: "/admin/courses" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  padding: "7px 14px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 13,
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.65)",
                  textDecoration: "none",
                  transition: "var(--transition)",
                  background: window.location.pathname === item.path
                    ? "var(--gold)" : "transparent",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (window.location.pathname !== item.path) {
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (window.location.pathname !== item.path) {
                    e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                  }
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right — student view + logout */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Link
              to="/dashboard"
              style={{
                padding: "7px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: 12,
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "var(--transition)",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              My Dashboard →
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#EF4444";
                e.currentTarget.style.borderColor = "#EF4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              }}
            >
              Logout
            </button>
          </div>

        </div>
      </nav>

      {/* ================================
          HEADER
      ================================ */}
      <div className="page-header">
        <div className="header-inner fade-up">
          <p className="page-eyebrow">Admin Panel</p>
          <h1 className="page-title">Platform Overview</h1>
          <p style={{
            color: "rgba(255,255,255,0.4)", fontSize: 13,
          }}>
            Welcome back, {user?.name}. Here's what's happening on GradeIQ UPSA.
          </p>
        </div>
      </div>

      {/* ================================
          STAT CARDS
      ================================ */}
      <div className="overlap-section">
        <div className="grid-4">

          <div className="stat-card card fade-up-1">
            <div className="stat-icon" style={{ background: "var(--blue-bg)", fontSize: 22 }}>
              👥
            </div>
            <div>
              <p className="stat-label" style={{ color: "var(--text-muted)" }}>
                Total Students
              </p>
              <p className="stat-value" style={{ fontSize: 32, color: "var(--navy)" }}>
                {stats?.total_students ?? 0}
              </p>
              <p className="stat-sub" style={{ color: "var(--text-muted)" }}>
                Registered accounts
              </p>
            </div>
          </div>

          <div className="card-dark stat-card fade-up-2"
            style={{ borderRadius: "var(--radius-lg)" }}
          >
            <div className="stat-icon" style={{ background: "rgba(255,192,5,0.15)" }}>
              📊
            </div>
            <div>
              <p className="stat-label" style={{ color: "rgba(255,255,255,0.4)" }}>
                Active Users
              </p>
              <p className="stat-value" style={{ fontSize: 32, color: "var(--gold)" }}>
                {stats?.active_users ?? 0}
              </p>
              <p className="stat-sub" style={{ color: "rgba(255,255,255,0.4)" }}>
                Students with results
              </p>
            </div>
          </div>

          <div className="stat-card card fade-up-3">
            <div className="stat-icon" style={{ background: "var(--green-bg)", fontSize: 22 }}>
              📝
            </div>
            <div>
              <p className="stat-label" style={{ color: "var(--text-muted)" }}>
                Total Results
              </p>
              <p className="stat-value" style={{ fontSize: 32, color: "var(--navy)" }}>
                {stats?.total_results ?? 0}
              </p>
              <p className="stat-sub" style={{ color: "var(--text-muted)" }}>
                Course results entered
              </p>
            </div>
          </div>

          <div className="stat-card card fade-up-4">
            <div className="stat-icon" style={{ background: "var(--amber-bg)", fontSize: 22 }}>
              📣
            </div>
            <div>
              <p className="stat-label" style={{ color: "var(--text-muted)" }}>
                Announcements
              </p>
              <p className="stat-value" style={{ fontSize: 32, color: "var(--navy)" }}>
                {stats?.active_announcements ?? 0}
              </p>
              <p className="stat-sub" style={{ color: "var(--text-muted)" }}>
                Active notices
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ================================
          MAIN CONTENT
      ================================ */}
      <div className="page-content" style={{ marginTop: 28 }}>
        <div className="grid-main">

          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Analytics — Classification Distribution */}
            <div className="card fade-up">
              <h3 className="section-title">
                📊 Anonymous CGPA Analytics
              </h3>
              <p style={{
                fontSize: 13, color: "var(--text-muted)",
                marginBottom: 20, marginTop: -12,
              }}>
                Based on {analytics?.total_analysed ?? 0} registered students.
                No individual data is shown.
              </p>

              {analytics?.total_analysed > 0 ? (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <p style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700, fontSize: 13,
                      color: "var(--navy)", marginBottom: 12,
                    }}>
                      Classification Distribution
                    </p>
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}>
                      {Object.entries(analytics.classification_distribution)
                        .filter(([, count]) => count > 0)
                        .map(([cls, count]) => {
                          const style = classColors[cls] || classColors["No Data"];
                          const pct = Math.round((count / analytics.total_analysed) * 100);
                          return (
                            <div key={cls}>
                              <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 4,
                              }}>
                                <span style={{
                                  fontSize: 12,
                                  fontFamily: "var(--font-heading)",
                                  fontWeight: 600,
                                  color: style.color,
                                }}>
                                  {cls}
                                </span>
                                <span style={{
                                  fontSize: 12,
                                  color: "var(--text-muted)",
                                  fontFamily: "var(--font-heading)",
                                  fontWeight: 600,
                                }}>
                                  {count} ({pct}%)
                                </span>
                              </div>
                              <div className="progress-track">
                                <div
                                  className="progress-fill"
                                  style={{
                                    width: `${pct}%`,
                                    background: style.color,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    background: "var(--navy)",
                    borderRadius: "var(--radius-md)",
                  }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      color: "rgba(255,255,255,0.5)",
                      fontFamily: "var(--font-heading)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}>
                      Platform Average CGPA
                    </span>
                    <span style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 900, fontSize: 24,
                      color: "var(--gold)",
                    }}>
                      {analytics.average_cgpa.toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{
                  textAlign: "center", padding: "40px 20px",
                }}>
                  <p style={{ fontSize: 40, marginBottom: 12 }}>📊</p>
                  <p style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600, fontSize: 14,
                    color: "var(--navy)",
                  }}>
                    No data yet
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    Analytics will appear once students add results
                  </p>
                </div>
              )}
            </div>

            {/* Programme Distribution */}
            {stats?.programme_distribution?.length > 0 && (
              <div className="card fade-up-1">
                <h3 className="section-title">🎓 Programme Distribution</h3>
                <div style={{
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  {stats.programme_distribution
                    .sort((a, b) => b.count - a.count)
                    .map((item) => {
                      const pct = Math.round(
                        (item.count / stats.total_students) * 100
                      );
                      return (
                        <div key={item.programme}>
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}>
                            <span style={{
                              fontSize: 12, color: "var(--text-secondary)",
                              fontFamily: "var(--font-heading)", fontWeight: 500,
                              maxWidth: "75%",
                            }}>
                              {item.programme}
                            </span>
                            <span style={{
                              fontSize: 12, color: "var(--text-muted)",
                              fontFamily: "var(--font-heading)", fontWeight: 700,
                            }}>
                              {item.count}
                            </span>
                          </div>
                          <div className="progress-track">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${pct}%`,
                                background: "var(--navy)",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 20,
            position: "sticky",
            top: "calc(var(--navbar-height) + 16px)",
          }}>

            {/* Risk Distribution */}
            <div className="card fade-up-2">
              <h3 className="section-title">⚡ Risk Distribution</h3>
              {analytics?.total_analysed > 0 ? (
                <div style={{
                  display: "flex", flexDirection: "column", gap: 10,
                }}>
                  {Object.entries(analytics.risk_distribution)
                    .filter(([, count]) => count > 0)
                    .map(([level, count]) => {
                      const style = riskColors[level] || riskColors["No Data"];
                      const pct = Math.round(
                        (count / analytics.total_analysed) * 100
                      );
                      return (
                        <div key={level} style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 14px",
                          background: style.bg,
                          border: `1px solid ${style.border}`,
                          borderRadius: "var(--radius-md)",
                        }}>
                          <span style={{
                            fontFamily: "var(--font-heading)",
                            fontWeight: 700, fontSize: 13,
                            color: style.color,
                          }}>
                            {level} Risk
                          </span>
                          <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                          }}>
                            <span style={{
                              fontFamily: "var(--font-heading)",
                              fontWeight: 900, fontSize: 18,
                              color: style.color,
                            }}>
                              {count}
                            </span>
                            <span style={{
                              fontSize: 11, color: style.color,
                              opacity: 0.7,
                              fontFamily: "var(--font-heading)",
                            }}>
                              ({pct}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p style={{
                  fontSize: 13, color: "var(--text-muted)",
                  textAlign: "center", padding: "20px 0",
                }}>
                  No risk data yet
                </p>
              )}
            </div>

            {/* Level Distribution */}
            {stats?.level_distribution?.length > 0 && (
              <div className="card fade-up-3">
                <h3 className="section-title">📚 Level Distribution</h3>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}>
                  {stats.level_distribution.map((item) => (
                    <div key={item.level} style={{
                      textAlign: "center",
                      padding: "14px",
                      background: "var(--bg-page)",
                      borderRadius: "var(--radius-md)",
                      border: "1.5px solid var(--border)",
                    }}>
                      <p style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 900, fontSize: 24,
                        color: "var(--navy)", marginBottom: 4,
                      }}>
                        {item.count}
                      </p>
                      <p style={{
                        fontSize: 11, color: "var(--text-muted)",
                        fontFamily: "var(--font-heading)", fontWeight: 600,
                        textTransform: "uppercase", letterSpacing: "0.08em",
                      }}>
                        Level {item.level}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Announcements */}
            <div className="card fade-up-4">
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}>
                <h3 className="section-title" style={{ marginBottom: 0 }}>
                  📣 Announcements
                </h3>
                <Link
                  to="/admin/announcements"
                  style={{
                    fontSize: 12, color: "var(--text-muted)",
                    fontFamily: "var(--font-heading)", fontWeight: 600,
                  }}
                >
                  Manage →
                </Link>
              </div>

              {announcements.length > 0 ? (
                <div style={{
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  {announcements.slice(0, 3).map((ann) => {
                    const ps = priorityStyle(ann.priority);
                    return (
                      <div key={ann.id} style={{
                        padding: "10px 12px",
                        background: ps.bg,
                        border: `1px solid ${ps.border}`,
                        borderRadius: "var(--radius-sm)",
                      }}>
                        <p style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 700, fontSize: 12,
                          color: ps.color, marginBottom: 2,
                        }}>
                          {ann.title}
                        </p>
                        <p style={{
                          fontSize: 11, color: "var(--text-muted)",
                          lineHeight: 1.4,
                        }}>
                          {ann.message.length > 80
                            ? ann.message.slice(0, 80) + "..."
                            : ann.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    No announcements yet
                  </p>
                  <Link
                    to="/admin/announcements"
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 12, display: "inline-flex" }}
                  >
                    Post First Announcement
                  </Link>
                </div>
              )}
            </div>

            {/* Quick links */}
            <div style={{
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              {[
                { label: "👥 Manage Users", path: "/admin/users" },
                { label: "📣 Manage Announcements", path: "/admin/announcements" },
                { label: "📚 Manage Course Catalogue", path: "/admin/courses" },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: "var(--bg-card)",
                    border: "1.5px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    textDecoration: "none",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600, fontSize: 13,
                    color: "var(--navy)",
                    transition: "var(--transition)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--navy)";
                    e.currentTarget.style.color = "var(--gold)";
                    e.currentTarget.style.borderColor = "var(--navy)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--bg-card)";
                    e.currentTarget.style.color = "var(--navy)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  {item.label}
                  <span>→</span>
                </Link>
              ))}
            </div>

          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-nav-links { display: none !important; }
        }
      `}</style>

    </div>
  );
}