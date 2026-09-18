import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, StatusBadge } from '../components';
import { formatCurrency, formatDate } from '../utils';
import { FiEye, FiEdit2, FiTrash2, FiPrinter, FiFolderPlus, FiSearch, FiCalendar, FiX, FiFileText } from 'react-icons/fi';

const DocumentTable = ({ items = [], onDelete, onUpdate, onCreateClick, config, onConvertToInvoice }) => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');

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

  // Dynamically extract unique years from createdDate
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    items.forEach((item) => {
      if (item.createdDate) {
        const year = new Date(item.createdDate).getFullYear();
        if (!isNaN(year)) {
          yearsSet.add(year);
        }
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [items]);

  // Filter items based on searchQuery (Name, Email, Invoice Number, Reference No) & Date/Year filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Name, Email, Invoice No, Reference No search
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.name?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        item.invoiceNumber?.toLowerCase().includes(query) ||
        item.referenceNo?.toLowerCase().includes(query);

      // Year filter
      let matchesYear = true;
      if (selectedYear !== 'ALL') {
        const itemYear = new Date(item.createdDate).getFullYear();
        matchesYear = itemYear.toString() === selectedYear.toString();
      }

      // Exact Date filter
      let matchesDate = true;
      if (selectedDate) {
        matchesDate = item.createdDate === selectedDate;
      }

      return matchesSearch && matchesYear && matchesDate;
    });
  }, [items, searchQuery, selectedYear, selectedDate]);

  const hasActiveFilters = searchQuery !== '' || selectedYear !== 'ALL' || selectedDate !== '';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedYear('ALL');
    setSelectedDate('');
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
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden max-w-7xl mx-auto space-y-0">
      {/* Search & Filter Bar Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email, invoice no..."
            className="w-full pl-10 pr-9 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-800"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        {/* Filters: Year & Date Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Year Filter */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-semibold shadow-xs">
            <FiCalendar className="text-slate-400 shrink-0" size={14} />
            <span className="text-slate-400 font-medium">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent focus:outline-none font-bold text-slate-800 cursor-pointer pr-1"
            >
              <option value="ALL">All Years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker Filter */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-semibold shadow-xs">
            <span className="text-slate-400 font-medium">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-none font-semibold text-slate-800 text-xs cursor-pointer"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="text-slate-400 hover:text-slate-600 ml-0.5"
                title="Clear date"
              >
                <FiX size={12} />
              </button>
            )}
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <p className="text-sm font-semibold text-slate-600">No {config.title.toLowerCase()}s found matching your search.</p>
            <p className="text-xs text-slate-400">Try adjusting your name query or date/year filter.</p>
            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
              Clear All Filters
            </Button>
          </div>
        ) : (
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
              {filteredItems.map((item) => (
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

                      {/* Convert to Invoice — only for Proforma */}
                      {isProforma && onConvertToInvoice && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onConvertToInvoice(item);
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                          title="Convert to Invoice"
                        >
                          <FiFileText size={16} />
                        </button>
                      )}

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
        )}
      </div>
    </div>
  );
};

export default DocumentTable;
