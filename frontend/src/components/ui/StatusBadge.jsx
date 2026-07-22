export default function StatusBadge({ status }) {
  const colors = {
    Booked: "bg-blue-100 text-blue-800",
    Preparing: "bg-yellow-100 text-yellow-800",
    Ready: "bg-emerald-100 text-emerald-800",
    Completed: "bg-slate-100 text-slate-800",
    Cancelled: "bg-red-100 text-red-800"
  };

  const className = colors[status] || "bg-slate-100 text-slate-800";

  return (
    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${className}`}>
      {status}
    </span>
  );
}
