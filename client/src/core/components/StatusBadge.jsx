import { FiCheckCircle, FiClock, FiAlertTriangle } from 'react-icons/fi';

const StatusBadge = ({ status, dueDate, onClick }) => {
  const isPaid = status === 'Paid' || status === 'Approved';
  const isOverdue = !isPaid && dueDate && new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  if (isPaid) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer select-none hover:bg-emerald-100/60 transition-colors"
        title="Click to toggle status"
      >
        <FiCheckCircle size={12} />
        <span>{status}</span>
      </button>
    );
  }

  if (isOverdue) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 cursor-pointer select-none hover:bg-red-100/60 transition-colors"
        title="Click to toggle status"
      >
        <FiAlertTriangle size={12} />
        <span>{status === 'Approved' ? 'Expired' : 'Overdue'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 cursor-pointer select-none hover:bg-amber-100/60 transition-colors"
      title="Click to toggle status"
    >
      <FiClock size={12} />
      <span>Pending</span>
    </button>
  );
};

export default StatusBadge;
