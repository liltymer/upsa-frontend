import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
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

function TrendTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="db-tooltip">
      <p className="db-tooltip-title">{row.title}</p>
      <p><span className="db-key" style={{ background: SERIES.gpa }} />Semester GPA <strong>{row.gpa.toFixed(2)}</strong></p>
      <p><span className="db-key db-key-line" style={{ background: SERIES.cgpa }} />CGPA <strong>{row.cgpa.toFixed(2)}</strong></p>
      <p className="db-tooltip-muted">{row.credits} credits</p>
    </div>
  );
}

/** Semester GPA and running CGPA on one 0 to 4 axis, with class boundaries as guides. */
export function TrendChart({ history, bands }) {
  const data = history.map((h) => ({ ...h, label: short(h.title) }));
  // Start the scale half a point below the lowest value so movement is visible
  const lowest = Math.min(...data.flatMap((d) => [d.gpa, d.cgpa]));
  const floor = Math.max(0, Math.floor((lowest - 0.5) * 2) / 2);
  const ticks = [];
  for (let t = floor; t <= 4.0001; t += floor >= 2 ? 0.5 : 1) ticks.push(Number(t.toFixed(1)));
  const guides = bands.filter((b) => b.min > floor && b.label !== "Fail");
  const last = data[data.length - 1];

  return (
    <figure className="db-chart" aria-label="Semester GPA and CGPA over time">
      <ul className="db-legend">
        <li><span className="db-key" style={{ background: SERIES.gpa }} />Semester GPA</li>
        <li><span className="db-key db-key-line" style={{ background: SERIES.cgpa }} />CGPA</li>
      </ul>
      <div className="db-chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 104, bottom: 4, left: -18 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={{ stroke: GRID }} />
            <YAxis domain={[floor, 4]} ticks={ticks} tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={false} />
            {guides.map((b) => (
              <ReferenceLine key={b.label} y={b.min} stroke="#aeb7c9" strokeDasharray="3 4"
                label={{ value: `${b.label} ${b.min.toFixed(2)}`, position: "right", fill: AXIS, fontSize: 11 }} />
            ))}
            <Tooltip content={<TrendTooltip />} cursor={{ stroke: "#aeb7c9", strokeWidth: 1 }} />
            <Line type="monotone" dataKey="gpa" name="Semester GPA" stroke={SERIES.gpa} strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, stroke: "#fff", fill: SERIES.gpa }} activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
              isAnimationActive={false} />
            <Line type="monotone" dataKey="cgpa" name="CGPA" stroke={SERIES.cgpa} strokeWidth={2} strokeDasharray="6 4"
              dot={{ r: 4, strokeWidth: 2, stroke: "#fff", fill: SERIES.cgpa }} activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
              isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {last && (
        <figcaption className="db-chart-caption">
          Latest: semester GPA <strong>{last.gpa.toFixed(2)}</strong>, CGPA <strong>{last.cgpa.toFixed(2)}</strong>.
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
