import { FiCheckCircle, FiClock, FiAlertTriangle, FiLock } from 'react-icons/fi';

/**
 * Status pill.
 *  locked   – paid/approved and cannot be changed (shows a lock)
 *  readOnly – status is controlled elsewhere (e.g. proforma status follows its invoice),
 *             so it is shown as plain text instead of a button
 */
const StatusBadge = ({ status, dueDate, onClick, locked = false, readOnly = false }) => {
  const isPaid = status === 'Paid' || status === 'Approved';
  const isOverdue = !isPaid && dueDate && new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
  const interactive = !readOnly;

  const base = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border select-none';
  const clickable = (hover) => (interactive ? `cursor-pointer ${hover} transition-colors` : 'cursor-default');
  const Tag = interactive ? 'button' : 'span';
  const tagProps = interactive ? { type: 'button', onClick, title: 'Click to toggle status' } : {};

  if (isPaid) {
    if (locked) {
      return (
        <span
          className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default`}
          title="Status is locked"
        >
          <FiLock size={11} />
          <span>{status}</span>
        </span>
      );
    }
    return (
      <Tag {...tagProps} className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200 ${clickable('hover:bg-emerald-100/60')}`}>
        <FiCheckCircle size={12} />
        <span>{status}</span>
      </Tag>
    );
  }

  if (isOverdue) {
    return (
      <Tag {...tagProps} className={`${base} bg-red-50 text-red-700 border-red-200 ${clickable('hover:bg-red-100/60')}`}>
        <FiAlertTriangle size={12} />
        <span>{status === 'Approved' ? 'Expired' : 'Overdue'}</span>
      </Tag>
    );
  }

  return (
    <Tag {...tagProps} className={`${base} bg-amber-50 text-amber-700 border-amber-200 ${clickable('hover:bg-amber-100/60')}`}>
      <FiClock size={12} />
      <span>Pending</span>
    </Tag>
  );
};

export default StatusBadge;
