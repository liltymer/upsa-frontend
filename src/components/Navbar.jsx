import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{
      background: "#081C46",
      position: "sticky",
      top: 0,
      zIndex: 50,
      boxShadow: "0 4px 20px rgba(8,28,70,0.25)",
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
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
          flexShrink: 0,
        }}>
          <div style={{
            width: 34, height: 34,
            background: "#FFC005",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 3,
          }}>
            <img
              src="/upsa-logo.png"
              alt="UPSA"
              style={{
                width: "100%", height: "100%",
                objectFit: "contain",
              }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <span style={{
              display: "none",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900, fontSize: 11,
              color: "#081C46",
            }}>UP</span>
          </div>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 15,
            color: "#FFC005",
            letterSpacing: "0.03em",
          }}>
            UPSA GradeIQ 
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
          className="desktop-nav"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textDecoration: "none",
                transition: "all 0.2s",
                background: isActive ? "#FFC005" : "transparent",
                color: isActive ? "#081C46" : "rgba(255,255,255,0.7)",
                whiteSpace: "nowrap",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Right — User + Logout */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexShrink: 0,
        }}
          className="desktop-nav"
        >
          {user && (
            <div style={{ textAlign: "right" }}>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600, fontSize: 13,
                color: "#ffffff",
                lineHeight: 1.2,
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
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "#ffffff",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#EF4444";
              e.currentTarget.style.borderColor = "#EF4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            Logout
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            flexDirection: "column",
            gap: 5,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
          }}
          className="mobile-nav"
        >
          {[0, 1, 2].map((i) => (
            <span key={i} style={{
              display: "block",
              width: 22, height: 2,
              background: "#FFC005",
              borderRadius: 999,
              transition: "all 0.3s",
              transform: menuOpen
                ? i === 0 ? "rotate(45deg) translate(5px, 5px)"
                : i === 1 ? "opacity: 0"
                : "rotate(-45deg) translate(5px, -5px)"
                : "none",
              opacity: menuOpen && i === 1 ? 0 : 1,
            }} />
          ))}
        </button>

      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div style={{
          background: "#0f2d6e",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
          className="mobile-nav"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                padding: "12px 16px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textDecoration: "none",
                background: isActive ? "#FFC005" : "transparent",
                color: isActive ? "#081C46" : "rgba(255,255,255,0.7)",
              })}
            >
              {item.label}
            </NavLink>
          ))}

          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 16, marginTop: 8,
          }}>
            {user && (
              <p style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 12,
                marginBottom: 12,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                Signed in as{" "}
                <span style={{ color: "#FFC005", fontWeight: 600 }}>
                  {user.name}
                </span>
              </p>
            )}
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                background: "#EF4444",
                color: "#ffffff",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                padding: "12px 16px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-nav { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>

    </nav>
  );
}