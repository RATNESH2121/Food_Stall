export default function StatusBadge({ status }) {
  const config = {
    // WhatsApp flow statuses
    PENDING_VENDOR: { label: 'Pending', classes: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-500' },
    ACCEPTED: { label: 'Accepted', classes: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500' },
    PREPARING: { label: 'Preparing', classes: 'bg-orange-50 text-orange-700 border border-orange-200', dot: 'bg-orange-500 animate-pulse' },
    READY: { label: 'Ready', classes: 'bg-green-50 text-green-700 border border-green-200', dot: 'bg-green-500' },
    COMPLETED: { label: 'Completed', classes: 'bg-slate-50 text-slate-600 border border-slate-200', dot: 'bg-slate-400' },
    REJECTED: { label: 'Rejected', classes: 'bg-red-50 text-red-700 border border-red-200', dot: 'bg-red-500' },
    CANCELLED: { label: 'Cancelled', classes: 'bg-red-50 text-red-700 border border-red-200', dot: 'bg-red-500' },
    // Old statuses
    Booked: { label: 'Booked', classes: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500' },
    Preparing: { label: 'Preparing', classes: 'bg-orange-50 text-orange-700 border border-orange-200', dot: 'bg-orange-500 animate-pulse' },
    Ready: { label: 'Ready', classes: 'bg-green-50 text-green-700 border border-green-200', dot: 'bg-green-500' },
    Completed: { label: 'Completed', classes: 'bg-slate-50 text-slate-600 border border-slate-200', dot: 'bg-slate-400' },
    Cancelled: { label: 'Cancelled', classes: 'bg-red-50 text-red-700 border border-red-200', dot: 'bg-red-500' },
  };

  const c = config[status] || { label: status, classes: 'bg-slate-50 text-slate-600 border border-slate-200', dot: 'bg-slate-400' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${c.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}
