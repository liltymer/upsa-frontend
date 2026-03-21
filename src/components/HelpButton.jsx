import { useState } from "react";

export default function HelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div style={{
          position: "fixed", bottom: 88, right: 28, zIndex: 998,
          background: "var(--bg-card)", border: "1.5px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: "24px", width: 300,
          boxShadow: "0 8px 40px rgba(8,28,70,0.2)",
          animation: "slideUp 0.2s ease forwards",
        }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 16,
          }}>
            <div>
              <p style={{
                fontFamily: "var(--font-heading)", fontWeight: 800,
                fontSize: 15, color: "var(--navy)", marginBottom: 2,
              }}>Help and Support</p>
              <p style={{
                fontSize: 11, color: "var(--text-muted)",
                fontFamily: "var(--font-heading)",
              }}>GradeIQ UPSA Support</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "var(--bg-page)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                width: 28, height: 28,
                display: "flex", alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontFamily: "var(--font-heading)",
                fontWeight: 700, fontSize: 14, flexShrink: 0,
              }}
            >x</button>
          </div>

          <div style={{ height: 1, background: "var(--border)", marginBottom: 16 }} />

          <p style={{
            fontSize: 13, color: "var(--text-muted)",
            lineHeight: 1.6, marginBottom: 16,
          }}>
            Having trouble with your account, results or any feature?
            Contact support directly:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a
              href="mailto:ahenkorajoshuaowusu@outlook.com"
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 14px",
                background: "var(--bg-page)",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                transition: "var(--transition)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--navy)";
                e.currentTarget.style.background = "var(--navy)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "var(--bg-page)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="var(--navy)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <div>
                <p style={{
                  fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 10,
                  color: "var(--text-muted)", textTransform: "uppercase",
                  letterSpacing: "0.08em", marginBottom: 1,
                }}>Email</p>
                <p style={{
                  fontFamily: "var(--font-heading)", fontWeight: 700,
                  fontSize: 11, color: "var(--navy)",
                }}>ahenkorajoshuaowusu@outlook.com</p>
              </div>
            </a>

            <a
              href="tel:+233537041324"
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 14px",
                background: "var(--bg-page)",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                transition: "var(--transition)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--navy)";
                e.currentTarget.style.background = "var(--navy)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "var(--bg-page)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="var(--navy)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.54 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <div>
                <p style={{
                  fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 10,
                  color: "var(--text-muted)", textTransform: "uppercase",
                  letterSpacing: "0.08em", marginBottom: 1,
                }}>Phone / WhatsApp</p>
                <p style={{
                  fontFamily: "var(--font-heading)", fontWeight: 700,
                  fontSize: 11, color: "var(--navy)",
                }}>+233 537 041 324</p>
              </div>
            </a>
          </div>

          <p style={{
            fontSize: 11, color: "var(--text-muted)",
            textAlign: "center", marginTop: 16,
            fontFamily: "var(--font-heading)",
          }}>
            GradeIQ UPSA - University of Professional Studies, Accra
          </p>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 999,
          display: "flex", alignItems: "center", gap: 8,
          background: open ? "var(--gold)" : "var(--navy)",
          color: open ? "var(--navy)" : "var(--gold)",
          border: open ? "1.5px solid var(--gold)" : "1.5px solid rgba(255,192,5,0.3)",
          borderRadius: "var(--radius-full)", padding: "12px 20px",
          fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13,
          cursor: "pointer", boxShadow: "0 4px 20px rgba(8,28,70,0.25)",
          transition: "var(--transition)",
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 28px rgba(8,28,70,0.35)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(8,28,70,0.25)";
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        {open ? "Close" : "Help and Support"}
      </button>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}