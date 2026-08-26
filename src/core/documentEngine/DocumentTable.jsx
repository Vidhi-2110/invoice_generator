import { useNavigate } from 'react-router-dom';
import { Button, StatusBadge } from '../components';
import { formatCurrency, formatDate } from '../utils';
import { FiEye, FiEdit2, FiTrash2, FiPrinter, FiFolderPlus } from 'react-icons/fi';

const DocumentTable = ({ items = [], onDelete, onUpdate, onCreateClick, config }) => {
  const navigate = useNavigate();

  const isFieldActive = (fieldName) => (config.fields ? config.fields.includes(fieldName) : true);
  const isProforma = config.title?.toLowerCase().includes('proforma');
  const routePrefix = isProforma ? '/proforma-invoice' : '/invoice';

  const handlePrint = (id) => {
    navigate(`${routePrefix}/${id}?print=true`);
  };

  const toggleStatus = (e, item) => {
    e.stopPropagation();
    const isApproved = item.status === 'Approved';
    const isPaid = item.status === 'Paid';
    let newStatus;
    if (isProforma) {
      newStatus = isApproved ? 'Pending' : 'Approved';
    } else {
      newStatus = isPaid ? 'Pending' : 'Paid';
    }
    onUpdate(item.id, { ...item, status: newStatus });
  };

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200/80 rounded-2xl text-center shadow-sm max-w-4xl mx-auto space-y-5">
        <div className="p-4 rounded-full bg-slate-50 text-slate-400">
          <FiFolderPlus size={40} />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-800">No {config.title}s Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Create new {config.title.toLowerCase()} records to begin tracking billing and estimates.
          </p>
        </div>
        <Button variant={isProforma ? 'violet' : 'primary'} onClick={onCreateClick}>
          Create First {config.title}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden max-w-7xl mx-auto">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">{config.title} No.</th>
              {isFieldActive('referenceNo') && <th className="px-6 py-4">Reference No.</th>}
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Created Date</th>
              <th className="px-6 py-4">{isProforma ? 'Valid Until' : 'Due Date'}</th>
              <th className="px-6 py-4">{isProforma ? 'Est. Rate' : 'Rate'}</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                {/* Document Number */}
                <td className="px-6 py-4">
                  <span
                    className={`font-bold border px-2.5 py-1 rounded-lg text-xs ${
                      isProforma
                        ? 'text-violet-600 bg-violet-50/50 border-violet-100/50'
                        : 'text-indigo-600 bg-indigo-50/50 border-indigo-100/50'
                    }`}
                  >
                    {item.invoiceNumber}
                  </span>
                </td>

                {/* Reference No. */}
                {isFieldActive('referenceNo') && (
                  <td className="px-6 py-4 text-slate-500 font-semibold text-xs">
                    {item.referenceNo || '-'}
                  </td>
                )}

                {/* Customer Details */}
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-400 font-normal mt-0.5">{item.email}</p>
                  </div>
                </td>

                {/* Dates */}
                <td className="px-6 py-4 text-slate-500 font-normal">{formatDate(item.createdDate)}</td>

                <td className="px-6 py-4 text-slate-500 font-normal">{formatDate(item.dueDate)}</td>

                {/* Rate */}
                <td className="px-6 py-4 font-black text-slate-800">
                  {formatCurrency(item.rate, config.currency || '₹')}
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <StatusBadge
                    status={item.status}
                    dueDate={item.dueDate}
                    onClick={(e) => toggleStatus(e, item)}
                  />
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`${routePrefix}/${item.id}`);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      title={`View ${config.title}`}
                    >
                      <FiEye size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`${routePrefix}/${item.id}/edit`);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-amber-600 transition-colors"
                      title={`Edit ${config.title}`}
                    >
                      <FiEdit2 size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrint(item.id);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                      title={`Print ${config.title}`}
                    >
                      <FiPrinter size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            `Are you sure you want to delete this ${config.title.toLowerCase()} ${item.invoiceNumber}?`
                          )
                        ) {
                          onDelete(item.id);
                        }
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-red-600 transition-colors"
                      title={`Delete ${config.title}`}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentTable;
