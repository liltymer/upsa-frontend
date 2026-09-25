import { Suspense, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./app.css";
import Icon from "../landing/Icon";
import { useAuth } from "../../context/AuthContext";
import { useProgrammes } from "../../context/ProgrammeContext";
import { PageSkeleton, TopProgress } from "../ui/Loading";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "home", mobile: true },
  { to: "/results", label: "Results", icon: "results", mobile: true },
  { to: "/gpa", label: "GPA", icon: "chart", mobile: true },
  { to: "/transcript", label: "Transcript", icon: "document" },
  { to: "/planner", label: "Planner", icon: "target", mobile: true },
  { to: "/standing", label: "Standing", icon: "shield" },
];

// Extra section for admin accounts
const ADMIN_ITEMS = [
  { to: "/admin", label: "Overview", icon: "chart", end: true },
  { to: "/admin/users", label: "Students", icon: "user" },
  { to: "/admin/courses", label: "Courses", icon: "layers" },
  { to: "/admin/announcements", label: "Announcements", icon: "bell" },
];

const STORAGE_KEY = "gradeiq.sidebarCollapsed";

const readCollapsed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

function programmeShortLabel(e) {
  const kind = e.award_type === "diploma" ? "Diploma" : e.is_top_up ? "Degree (top-up)" : "Degree";
  return `${kind}${e.is_current ? "" : " (completed)"}`;
}

function ProgrammePicker({ compact = false }) {
  const { enrollments, selected, setSelectedId, hasMultiple } = useProgrammes();
  if (!selected) return null;

  if (!hasMultiple) {
    return (
      <div className="ap-programme" title={selected.programme}>
        <span className="ap-programme-label">Programme</span>
        <span className="ap-programme-name">{selected.programme}</span>
      </div>
    );
  }

  return (
    <label className="ap-programme">
      <span className="ap-programme-label">{compact ? "Programme" : "Viewing programme"}</span>
      <select
        className="ap-programme-select"
        value={selected.id}
        onChange={(e) => {
          const next = enrollments.find((x) => x.id === Number(e.target.value));
          setSelectedId(next?.is_current ? null : next?.id);
        }}
      >
        {enrollments.map((e) => (
          <option key={e.id} value={e.id}>
            {programmeShortLabel(e)}: {e.programme}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  // The phone "More" menu belongs to the page it was opened on, so it closes on navigation
  const [moreOpenOn, setMoreOpenOn] = useState(null);
  const moreOpen = moreOpenOn === location.pathname;
  const setMoreOpen = (open) => setMoreOpenOn(open ? location.pathname : null);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setMoreOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(STORAGE_KEY, c ? "0" : "1");
      } catch {
        // storage unavailable: the choice just will not be remembered
      }
      return !c;
    });
  };

  const signOut = () => {
    logout();
    navigate("/login");
  };

  const initials = (user?.name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <div className={`ap${collapsed ? " ap-collapsed" : ""}`}>
      <a className="ap-skip" href="#app-main">Skip to content</a>

      {/* ---------- Desktop sidebar ---------- */}
      <aside className="ap-sidebar" aria-label="Main navigation">
        <div className="ap-sidebar-top">
          <Link to="/dashboard" className="ap-brand" aria-label="GradeIQ UPSA dashboard">
            <img src="/upsa-logo.png" alt="" width="36" height="36" />
            <span className="ap-brand-name">GradeIQ <span>UPSA</span></span>
          </Link>
          <button
            type="button"
            className="ap-collapse"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Icon name="sidebar" size={20} />
          </button>
        </div>

        <nav className="ap-nav">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className="ap-nav-link" title={collapsed ? item.label : undefined}>
                  <Icon name={item.icon} size={20} />
                  <span className="ap-nav-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
          {user?.role === "admin" && (
            <>
              <p className="ap-nav-heading">{collapsed ? <span className="ap-nav-rule" aria-hidden="true" /> : "Admin"}</p>
              <ul>
                {ADMIN_ITEMS.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.end} className="ap-nav-link" title={collapsed ? `Admin: ${item.label}` : undefined}>
                      <Icon name={item.icon} size={20} />
                      <span className="ap-nav-label">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>

        <div className="ap-sidebar-bottom">
          {!collapsed && <ProgrammePicker />}
          <NavLink to="/profile" className="ap-user" title={collapsed ? "Profile" : undefined}>
            <span className="ap-avatar" aria-hidden="true">{initials}</span>
            <span className="ap-user-text">
              <strong>{user?.name}</strong>
              <small>{user?.index_number || "Profile"}</small>
            </span>
          </NavLink>
          <button type="button" className="ap-nav-link ap-signout" onClick={signOut} title={collapsed ? "Sign out" : undefined}>
            <Icon name="logout" size={20} />
            <span className="ap-nav-label">Sign out</span>
          </button>
        </div>
      </aside>

      {/* ---------- Phone top bar ---------- */}
      <header className="ap-topbar">
        <Link to="/dashboard" className="ap-brand" aria-label="GradeIQ UPSA dashboard">
          <img src="/upsa-logo.png" alt="" width="32" height="32" />
          <span className="ap-brand-name">GradeIQ <span>UPSA</span></span>
        </Link>
        <Link to="/profile" className="ap-avatar" aria-label="Profile">{initials}</Link>
      </header>

      <main id="app-main" className="ap-main">
        {/* The sidebar stays while a page's code downloads */}
        <Suspense fallback={<><TopProgress /><PageSkeleton /></>}>
          <Outlet />
        </Suspense>
      </main>

      {/* ---------- Phone bottom tabs ---------- */}
      <nav className="ap-tabs" aria-label="Main navigation">
        {NAV_ITEMS.filter((i) => i.mobile).map((item) => (
          <NavLink key={item.to} to={item.to} className="ap-tab">
            <Icon name={item.icon} size={22} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button type="button" className={`ap-tab${moreOpen ? " active" : ""}`} onClick={() => setMoreOpen(!moreOpen)}
          aria-expanded={moreOpen} aria-controls="ap-more">
          <Icon name="more" size={22} />
          <span>More</span>
        </button>
      </nav>

      {moreOpen && (
        <>
          <button type="button" className="ap-scrim" aria-label="Close menu" onClick={() => setMoreOpen(false)} />
          <div id="ap-more" className="ap-more" role="dialog" aria-label="More">
            <ProgrammePicker compact />
            {NAV_ITEMS.filter((i) => !i.mobile).map((item) => (
              <NavLink key={item.to} to={item.to} className="ap-more-link">
                <Icon name={item.icon} size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <NavLink to="/profile" className="ap-more-link">
              <Icon name="user" size={20} />
              <span>Profile</span>
            </NavLink>
            {user?.role === "admin" && ADMIN_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className="ap-more-link">
                <Icon name={item.icon} size={20} />
                <span>Admin: {item.label}</span>
              </NavLink>
            ))}
            <button type="button" className="ap-more-link" onClick={signOut}>
              <Icon name="logout" size={20} />
              <span>Sign out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
