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

function TrendTooltip({ active, payload, bands }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="db-tooltip">
      <p className="db-tooltip-title">{row.title}</p>
      <p><span className="db-key" style={{ background: SERIES.gpa }} />Semester GPA <strong>{row.gpa.toFixed(2)}</strong></p>
      <p><span className="db-key db-key-line" style={{ background: SERIES.cgpa }} />CGPA <strong>{row.cgpa.toFixed(2)}</strong></p>
      <p className="db-tooltip-muted">CGPA in {bandFor(row.cgpa, bands)?.label} · {row.credits} credits</p>
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
  const data = history.map((h) => ({ ...h, label: short(h.title) }));
  const lowest = Math.min(...data.flatMap((d) => [d.gpa, d.cgpa]));
  const floor = Math.max(0, Math.floor((lowest - 0.3) * 2) / 2);
  // Gridlines only where a class starts, plus the ends of the scale
  const bounds = bands.map((b) => b.min).filter((m) => m > floor && m < 4);
  const ticks = [...new Set([floor, ...bounds, 4].map((t) => Number(t.toFixed(2))))].sort((a, b) => a - b);
  const last = data[data.length - 1];

  return (
    <figure className="db-chart" aria-label="Semester GPA and CGPA over time">
      <ul className="db-legend">
        <li><span className="db-key db-key-line" style={{ background: SERIES.cgpa }} />CGPA{last && <strong>{last.cgpa.toFixed(2)}</strong>}</li>
        <li><span className="db-key db-key-ring" style={{ borderColor: SERIES.gpa }} />Semester GPA{last && <strong>{last.gpa.toFixed(2)}</strong>}</li>
      </ul>
      <div className="db-chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 14, right: 18, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="db-cgpa-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffc005" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#ffc005" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} strokeDasharray="4 6" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={false}
              padding={{ left: 20, right: 20 }} dy={8} />
            <YAxis domain={[floor, 4]} ticks={ticks} interval={0} tick={classTick(bands)} width={112}
              tickLine={false} axisLine={false} />
            <Tooltip content={<TrendTooltip bands={bands} />} cursor={{ stroke: "#c3cbdb", strokeWidth: 1, strokeDasharray: "3 3" }} />
            <Area type="monotone" dataKey="cgpa" stroke="none" fill="url(#db-cgpa-fill)" baseValue={floor}
              isAnimationActive={false} activeDot={false} />
            <Line type="monotone" dataKey="gpa" stroke={SERIES.gpa} strokeWidth={2}
              dot={lastDot(data.length, SERIES.gpa)} activeDot={{ r: 6, strokeWidth: 3, stroke: "#fff", fill: SERIES.gpa }}
              isAnimationActive={false} />
            <Line type="monotone" dataKey="cgpa" stroke={SERIES.cgpa} strokeWidth={3}
              dot={lastDot(data.length, SERIES.cgpa)} activeDot={{ r: 6.5, strokeWidth: 3, stroke: "#fff", fill: SERIES.cgpa }}
              isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {last && (
        <figcaption className="db-chart-caption">
          Your CGPA is in <strong>{bandFor(last.cgpa, bands)?.label}</strong>. Tap or hover on a semester to see its figures.
        </figcaption>
      )}
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
