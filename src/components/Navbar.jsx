import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Results", path: "/results" },
  { label: "GPA", path: "/gpa" },
  { label: "Transcript", path: "/transcript" },
  { label: "Simulator", path: "/simulator" },
  { label: "Risk", path: "/risk" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";

  return (
    <>
      <nav style={{
        background: "var(--navy)",
        position: "sticky",
        top: 0, zIndex: 100,
        height: "var(--navbar-height)",
        boxShadow: scrolled
          ? "0 4px 24px rgba(8,28,70,0.3)"
          : "0 2px 8px rgba(8,28,70,0.15)",
        transition: "box-shadow 0.3s ease",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 32px", height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}>

          {/* BRAND */}
          <NavLink
            to="/dashboard"
            style={{
              display: "flex", alignItems: "center",
              gap: 10, flexShrink: 0, textDecoration: "none",
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,192,5,0.12)",
              border: "1.5px solid rgba(255,192,5,0.3)",
              display: "flex", alignItems: "center",
              justifyContent: "center",
              padding: 5, flexShrink: 0, overflow: "hidden",
            }}>
              <img
                src="/upsa-logo.png" alt="UPSA"
                style={{
                  width: "100%", height: "100%",
                  objectFit: "contain",
                  filter: "brightness(1.2)",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <span style={{
                display: "none",
                fontFamily: "var(--font-heading)",
                fontWeight: 900, fontSize: 11,
                color: "var(--gold)",
              }}>UP</span>
            </div>
            <span style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800, fontSize: 15,
              color: "var(--gold)",
              letterSpacing: "0.03em",
              whiteSpace: "nowrap",
            }}>
              GradeIQ UPSA
            </span>
          </NavLink>

          {/* DESKTOP NAV LINKS */}
          <div
            className="desktop-nav"
            style={{
              display: "flex", alignItems: "center",
              gap: 2, flex: 1, justifyContent: "center",
            }}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  padding: "7px 14px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: "var(--font-heading)",
                  textDecoration: "none",
                  transition: "var(--transition)",
                  background: isActive ? "var(--gold)" : "transparent",
                  color: isActive ? "var(--navy)" : "rgba(255,255,255,0.65)",
                  whiteSpace: "nowrap",
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* DESKTOP RIGHT */}
          <div
            className="desktop-nav"
            style={{
              display: "flex", alignItems: "center",
              gap: 10, flexShrink: 0,
            }}
          >
            {/* Admin Panel button — only visible to admin */}
            {isAdmin && (
              <Link
                to="/admin"
                style={{
                  padding: "7px 14px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 12,
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  color: "var(--gold)",
                  textDecoration: "none",
                  border: "1px solid rgba(255,192,5,0.3)",
                  background: "rgba(255,192,5,0.08)",
                  transition: "var(--transition)",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--gold)";
                  e.currentTarget.style.color = "var(--navy)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,192,5,0.08)";
                  e.currentTarget.style.color = "var(--gold)";
                }}
              >
                ⚙️ Admin
              </Link>
            )}

            {user && (
              <div style={{ textAlign: "right" }}>
                <p style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600, fontSize: 13,
                  color: "white", lineHeight: 1.2,
                  maxWidth: 160,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {user.name}
                </p>
                <p style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
                }}>
                  {user.index_number}
                </p>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              style={{ flexShrink: 0 }}
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

          {/* MOBILE HAMBURGER */}
          <button
            className="mobile-nav"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: "none", flexDirection: "column",
              gap: 5, background: "none", border: "none",
              padding: 6, cursor: "pointer", flexShrink: 0,
            }}
            aria-label="Toggle menu"
          >
            <span style={{
              display: "block", width: 22, height: 2,
              background: "var(--gold)", borderRadius: 999,
              transition: "all 0.3s",
              transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
            }} />
            <span style={{
              display: "block", width: 22, height: 2,
              background: "var(--gold)", borderRadius: 999,
              transition: "all 0.3s",
              opacity: menuOpen ? 0 : 1,
            }} />
            <span style={{
              display: "block", width: 22, height: 2,
              background: "var(--gold)", borderRadius: 999,
              transition: "all 0.3s",
              transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
            }} />
          </button>

        </div>
      </nav>

      {/* MOBILE DROPDOWN */}
      {menuOpen && (
        <div
          className="mobile-nav"
          style={{
            display: "flex", position: "fixed",
            top: "var(--navbar-height)", left: 0, right: 0,
            background: "#0f2d6e",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexDirection: "column",
            padding: "16px", gap: 4, zIndex: 99,
            animation: "fadeIn 0.2s ease forwards",
            boxShadow: "0 8px 32px rgba(8,28,70,0.4)",
          }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              style={({ isActive }) => ({
                padding: "12px 16px",
                borderRadius: "var(--radius-sm)",
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                fontFamily: "var(--font-heading)",
                textDecoration: "none",
                background: isActive ? "var(--gold)" : "transparent",
                color: isActive ? "var(--navy)" : "rgba(255,255,255,0.7)",
                transition: "var(--transition)",
              })}
            >
              {item.label}
            </NavLink>
          ))}

          {/* Admin link in mobile menu */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={handleNavClick}
              style={{
                padding: "12px 16px",
                borderRadius: "var(--radius-sm)",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "var(--font-heading)",
                textDecoration: "none",
                background: "rgba(255,192,5,0.1)",
                color: "var(--gold)",
                border: "1px solid rgba(255,192,5,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              ⚙️ Admin Panel
            </Link>
          )}

          {/* Mobile user info + logout */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 16, marginTop: 8,
          }}>
            {user && (
              <p style={{
                color: "rgba(255,255,255,0.4)", fontSize: 12,
                fontFamily: "var(--font-heading)",
                marginBottom: 10, paddingLeft: 4,
              }}>
                Signed in as{" "}
                <span style={{ color: "var(--gold)", fontWeight: 600 }}>
                  {user.name}
                </span>
                {isAdmin && (
                  <span style={{
                    marginLeft: 6,
                    background: "rgba(255,192,5,0.15)",
                    color: "var(--gold)",
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    fontWeight: 700,
                  }}>
                    ADMIN
                  </span>
                )}
              </p>
            )}
            <button
              onClick={handleLogout}
              style={{
                width: "100%", padding: "12px 16px",
                background: "#EF4444", color: "white",
                fontFamily: "var(--font-heading)",
                fontWeight: 700, fontSize: 14,
                borderRadius: "var(--radius-sm)",
                border: "none", cursor: "pointer",
                transition: "var(--transition)",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      {menuOpen && (
        <div
          className="mobile-nav"
          onClick={() => setMenuOpen(false)}
          style={{
            display: "block", position: "fixed",
            inset: 0, top: "var(--navbar-height)",
            background: "rgba(0,0,0,0.4)", zIndex: 98,
          }}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .mobile-nav { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
          nav > div { padding: 0 16px !important; }
        }
      `}</style>
    </>
  );
}