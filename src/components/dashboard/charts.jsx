import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
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
// Very light zone tints, strongest for the top class
const BAND_FILLS = ["#fff6d6", "#eef3fd", "#f6f8fc", "#ffffff", "#f6f8fc", "#ffffff"];

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

/** Band name in the right gutter, centred on its zone, so it never sits under a line. */
const zoneLabel = (text) => function ZoneLabel({ viewBox }) {
  if (!viewBox || viewBox.height < 14) return null;
  return (
    <text x={viewBox.x + viewBox.width + 10} y={viewBox.y + viewBox.height / 2} fill={AXIS}
      fontSize={11} fontWeight={700} dominantBaseline="middle">
      {text}
    </text>
  );
};

/** Semester GPA and running CGPA on one axis, over the class zones. */
export function TrendChart({ history, bands }) {
  const data = history.map((h) => ({ ...h, label: short(h.title) }));
  const lowest = Math.min(...data.flatMap((d) => [d.gpa, d.cgpa]));
  const floor = Math.max(0, Math.floor((lowest - 0.5) * 2) / 2);
  const ticks = [];
  for (let t = floor; t <= 4.0001; t += floor >= 2 ? 0.5 : 1) ticks.push(Number(t.toFixed(1)));

  // Zones between consecutive band minimums that fall inside the visible range
  const zones = bands
    .map((b, i) => ({ ...b, top: i === 0 ? 4 : bands[i - 1].min }))
    .filter((z) => z.top > floor)
    .map((z, i) => ({ ...z, from: Math.max(z.min, floor), fill: BAND_FILLS[i] || "#ffffff" }));
  const last = data[data.length - 1];

  return (
    <figure className="db-chart" aria-label="Semester GPA and CGPA over time, with class zones">
      <ul className="db-legend">
        <li><span className="db-key" style={{ background: SERIES.gpa }} />Semester GPA{last && <strong>{last.gpa.toFixed(2)}</strong>}</li>
        <li><span className="db-key db-key-line" style={{ background: SERIES.cgpa }} />CGPA{last && <strong>{last.cgpa.toFixed(2)}</strong>}</li>
        <li><span className="db-key db-key-zone" />Class zones</li>
      </ul>
      <div className="db-chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 78, bottom: 4, left: -18 }}>
            <defs>
              <linearGradient id="db-gpa-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES.gpa} stopOpacity={0.22} />
                <stop offset="100%" stopColor={SERIES.gpa} stopOpacity={0} />
              </linearGradient>
            </defs>
            {zones.map((z) => (
              <ReferenceArea key={z.label} y1={z.from} y2={z.top} fill={z.fill} fillOpacity={1} stroke="none"
                label={zoneLabel(SHORT_BAND[z.label] || z.label)} ifOverflow="hidden" />
            ))}
            <CartesianGrid stroke={GRID} strokeDasharray="0" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={{ stroke: GRID }} padding={{ left: 16, right: 8 }} />
            <YAxis domain={[floor, 4]} ticks={ticks} tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<TrendTooltip bands={bands} />} cursor={{ stroke: "#aeb7c9", strokeWidth: 1, strokeDasharray: "3 3" }} />
            <Area type="monotone" dataKey="gpa" stroke="none" fill="url(#db-gpa-fill)" isAnimationActive={false} activeDot={false} />
            <Line type="monotone" dataKey="gpa" name="Semester GPA" stroke={SERIES.gpa} strokeWidth={2.5}
              dot={{ r: 5, strokeWidth: 2.5, stroke: "#fff", fill: SERIES.gpa }} activeDot={{ r: 7, strokeWidth: 3, stroke: "#fff" }}
              isAnimationActive={false} />
            <Line type="monotone" dataKey="cgpa" name="CGPA" stroke={SERIES.cgpa} strokeWidth={2.5} strokeDasharray="7 5"
              dot={{ r: 5, strokeWidth: 2.5, stroke: "#fff", strokeDasharray: "0", fill: SERIES.cgpa }}
              activeDot={{ r: 7, strokeWidth: 3, stroke: "#fff", strokeDasharray: "0" }}
              isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {last && (
        <figcaption className="db-chart-caption">
          Your CGPA is in the <strong>{bandFor(last.cgpa, bands)?.label}</strong> zone. Tap or hover on a semester to see its figures.
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
