export default function GradePill({ grade }) {
  const styles = {
    A: "bg-emerald-100 text-emerald-800",
    "B+": "bg-blue-100 text-blue-800",
    B: "bg-blue-100 text-blue-800",
    "B-": "bg-blue-100 text-blue-800",
    "C+": "bg-amber-100 text-amber-800",
    C: "bg-amber-100 text-amber-800",
    "C-": "bg-orange-100 text-orange-800",
    D: "bg-red-100 text-red-800",
    F: "bg-red-200 text-red-900",
  };

  const style = styles[grade] || "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-10
        rounded-xl font-heading font-extrabold text-sm
        transition-transform duration-200 hover:scale-110
        ${style}`}
    >
      {grade}
    </span>
  );
}