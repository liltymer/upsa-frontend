import { useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Validated pair (dataviz validator, light surface): all six checks pass.
const SERIES = { gpa: "#2f5bb7", cgpa: "#b57f00" };
const GRID = "#e3e8f2";
const AXIS = "#6b7690";
const INK = "#0b1b3f";

const short = (title) => {
  // "2024/2025 First Semester" -> "24/25 S1"
  const m = /^(\d{2})(\d{2})\/\d{2}(\d{2}) (First|Second)/.exec(title || "");
  return m ? `${m[2]}/${m[3]} S${m[4] === "First" ? 1 : 2}` : title;
};

const SHORT_BAND = {
  "First Class": "First Class",
  "Second Class Upper": "2nd Upper",
  "Second Class Lower": "2nd Lower",
  "Third Class": "Third",
  Distinction: "Distinction",
  Credit: "Credit",
  Pass: "Pass",
  Fail: "Fail",
};
const bandFor = (value, bands) => bands.find((b) => value >= b.min) || bands[bands.length - 1];

/** The figures for one semester, shown above the chart instead of over it. */
function TrendReadout({ row, bands, isLatest }) {
  return (
    <div className="db-readout" aria-live="polite">
      <p className="db-readout-when">{isLatest ? "Latest" : "Selected"}: {row.title}</p>
      <div className="db-readout-row">
        <div className="db-readout-stat">
          <span className="db-key db-key-line" style={{ background: SERIES.cgpa }} />
          <span className="db-readout-name">CGPA</span>
          <strong>{row.cgpa.toFixed(2)}</strong>
          <span className="db-readout-class">{bandFor(row.cgpa, bands)?.label}</span>
        </div>
        <div className="db-readout-stat">
          <span className="db-key db-key-ring" style={{ borderColor: SERIES.gpa }} />
          <span className="db-readout-name">Semester GPA</span>
          <strong>{row.gpa.toFixed(2)}</strong>
          <span className="db-readout-class">{row.credits} credits</span>
        </div>
      </div>
    </div>
  );
}

/** Y axis label: the class that starts at this value, then the value itself. */
const classTick = (bands) => function ClassTick({ x, y, payload }) {
  const band = bands.find((b) => Math.abs(b.min - payload.value) < 0.001 && b.label !== "Fail");
  return (
    <text x={x} y={y} textAnchor="end" dominantBaseline="middle" fontSize={12}>
      {band && <tspan fill={AXIS} fontWeight={600} fontSize={11}>{SHORT_BAND[band.label] || band.label}</tspan>}
      <tspan dx={band ? 6 : 0} fill={INK} fontWeight={700}>{payload.value.toFixed(2)}</tspan>
    </text>
  );
};

/** Latest point: a soft halo behind a solid marker. */
const lastDot = (count, color) => function LastDot({ cx, cy, index }) {
  if (cx == null || cy == null) return null;
  const isLast = index === count - 1;
  return (
    <g key={index}>
      {isLast && <circle cx={cx} cy={cy} r={11} fill={color} opacity={0.16} />}
      <circle cx={cx} cy={cy} r={isLast ? 5.5 : 4.5} fill={isLast ? color : "#fff"} stroke={color} strokeWidth={2.5} />
    </g>
  );
};

/** Running CGPA as the headline line, semester GPA beside it, class boundaries on the axis. */
export function TrendChart({ history, bands }) {
  const [active, setActive] = useState(null);
  const data = history.map((h) => ({ ...h, label: short(h.title) }));
  const values = data.flatMap((d) => [d.gpa, d.cgpa]);
  const floor = Math.max(0, Math.floor((Math.min(...values) - 0.3) * 2) / 2);
  // Stop one class boundary above the best result so movement is easy to see
  const highest = Math.max(...values);
  const top = bands.map((b) => b.min).filter((m) => m > highest + 0.1).sort((a, b) => a - b)[0] ?? 4;
  const bounds = bands.map((b) => b.min).filter((m) => m > floor && m < top);
  const ticks = [...new Set([floor, ...bounds, top].map((t) => Number(t.toFixed(2))))].sort((a, b) => a - b);

  const lastIndex = data.length - 1;
  const shown = data[active ?? lastIndex];
  const track = (state) => {
    const i = Number(state?.activeTooltipIndex);
    setActive(Number.isInteger(i) && i >= 0 && i < data.length ? i : null);
  };

  return (
    <figure className="db-chart" aria-label="Semester GPA and CGPA over time">
      {shown && <TrendReadout row={shown} bands={bands} isLatest={(active ?? lastIndex) === lastIndex} />}
      <div className="db-chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 18, bottom: 0, left: 0 }}
            onMouseMove={track} onClick={track} onMouseLeave={() => setActive(null)}>
            <defs>
              <linearGradient id="db-cgpa-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffc005" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ffc005" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} strokeDasharray="4 6" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={false}
              padding={{ left: 20, right: 20 }} dy={8} />
            <YAxis domain={[floor, top]} ticks={ticks} interval={0} tick={classTick(bands)} width={112}
              tickLine={false} axisLine={false} allowDataOverflow />
            {/* Keeps the hover cursor and highlighted points; the figures go in the readout */}
            <Tooltip content={() => null} cursor={{ stroke: "#c3cbdb", strokeWidth: 1, strokeDasharray: "3 3" }} />
            <Area type="monotone" dataKey="cgpa" stroke="none" fill="url(#db-cgpa-fill)" baseValue={floor}
              isAnimationActive={false} activeDot={false} />
            <Line type="monotone" dataKey="gpa" stroke={SERIES.gpa} strokeWidth={2}
              dot={lastDot(data.length, SERIES.gpa)} activeDot={{ r: 6.5, strokeWidth: 3, stroke: "#fff", fill: SERIES.gpa }}
              isAnimationActive={false} />
            <Line type="monotone" dataKey="cgpa" stroke={SERIES.cgpa} strokeWidth={3}
              dot={lastDot(data.length, SERIES.cgpa)} activeDot={{ r: 7, strokeWidth: 3, stroke: "#fff", fill: SERIES.cgpa }}
              isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="db-chart-caption">Tap or hover on a semester to see its figures above.</figcaption>
    </figure>
  );
}

function SpreadTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="db-tooltip">
      <p className="db-tooltip-title">Grade {row.grade}</p>
      <p><strong>{row.count}</strong> course{row.count === 1 ? "" : "s"}</p>
    </div>
  );
}

/** How many courses at each grade. Single series, so no legend. */
export function GradeSpreadChart({ distribution }) {
  return (
    <figure className="db-chart db-chart-sm" aria-label="Number of courses at each grade">
      <div className="db-chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribution} margin={{ top: 18, right: 4, bottom: 0, left: -24 }} barCategoryGap={6}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="grade" tick={{ fill: INK, fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={{ stroke: GRID }} />
            <YAxis allowDecimals={false} tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<SpreadTooltip />} cursor={{ fill: "rgba(47, 91, 183, 0.08)" }} />
            <Bar dataKey="count" fill={SERIES.gpa} radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false}
              label={{ position: "top", fill: INK, fontSize: 12, formatter: (v) => (v ? v : "") }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

/** Road to graduation: the CGPA so far (solid) and the planned path (dashed), same axis as the trend chart. */
export function ProjectionChart({ points, bands }) {
  const values = points.flatMap((p) => [p.actual, p.projected]).filter((v) => v != null);
  const floor = Math.max(0, Math.floor((Math.min(...values) - 0.3) * 2) / 2);
  const highest = Math.max(...values);
  const top = bands.map((b) => b.min).filter((m) => m > highest + 0.1).sort((a, b) => a - b)[0] ?? 4;
  const bounds = bands.map((b) => b.min).filter((m) => m > floor && m < top);
  const ticks = [...new Set([floor, ...bounds, top].map((t) => Number(t.toFixed(2))))].sort((a, b) => a - b);
  const hollow = (color) => ({ r: 4.5, strokeWidth: 2.5, stroke: color, fill: "#fff", strokeDasharray: "0" });

  return (
    <figure className="db-chart" aria-label="CGPA so far and the planned path to graduation">
      <ul className="db-legend">
        <li><span className="db-key db-key-line" style={{ background: SERIES.cgpa }} />Your CGPA so far</li>
        <li><span className="db-key db-key-dash" style={{ borderColor: SERIES.cgpa }} />Planned path</li>
      </ul>
      <div className="db-chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 12, right: 18, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="4 6" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={false}
              padding={{ left: 20, right: 20 }} dy={8} interval="preserveStartEnd" />
            <YAxis domain={[floor, top]} ticks={ticks} interval={0} tick={classTick(bands)} width={112}
              tickLine={false} axisLine={false} allowDataOverflow />
            <Tooltip cursor={{ stroke: "#c3cbdb", strokeDasharray: "3 3" }}
              formatter={(v, name) => [Number(v).toFixed(2), name === "actual" ? "CGPA" : "Planned CGPA"]}
              labelStyle={{ fontWeight: 700, color: INK }} />
            <Line type="monotone" dataKey="actual" stroke={SERIES.cgpa} strokeWidth={3} connectNulls={false}
              dot={{ r: 4.5, strokeWidth: 2.5, stroke: SERIES.cgpa, fill: SERIES.cgpa }} isAnimationActive={false} />
            <Line type="monotone" dataKey="projected" stroke={SERIES.cgpa} strokeWidth={2.5} strokeDasharray="7 6"
              dot={hollow(SERIES.cgpa)} activeDot={{ r: 6, strokeDasharray: "0" }} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
