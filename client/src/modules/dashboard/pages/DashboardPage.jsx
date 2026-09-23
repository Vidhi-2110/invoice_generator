import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiFileText, 
  FiBookOpen, 
  FiClock, 
  FiPlusCircle, 
  FiTrendingUp, 
  FiArrowRight, 
  FiEye, 
  FiCheckCircle, 
  FiAlertCircle 
} from 'react-icons/fi';
import ExportButton from '../../../components/ExportButton';
import defaultDashboardConfig from '../dashboardConfig';

const DashboardPage = ({ invoices = [], proformaInvoices = [], config = defaultDashboardConfig }) => {
  const navigate = useNavigate();
  const [tableTab, setTableTab] = useState('invoices');

  // Reliable line item and rate calculator
  const getItemAmount = (item) => {
    if (!item) return 0;
    if (item.lineItems && Array.isArray(item.lineItems) && item.lineItems.length > 0) {
      const sum = item.lineItems.reduce((acc, line) => {
        const r = parseFloat(line.rate ?? line.amount ?? 0) || 0;
        const q = parseFloat(line.hours ?? line.qty ?? 1) || 1;
        return acc + (r * q);
      }, 0);
      if (sum > 0) return sum;
    }
    return parseFloat(item.rate) || 0;
  };

  // --- Live reactive calculations (re-computed on every status change) ---
  const totalInvoicesCount   = invoices.length;
  const totalProformasCount  = proformaInvoices.length;

  const paidInvoices         = invoices.filter((inv) => inv.status === 'Paid');
  const pendingInvoices      = invoices.filter((inv) => inv.status !== 'Paid');

  const approvedProformas    = proformaInvoices.filter((pi) => pi.status === 'Approved');
  const pendingProformas     = proformaInvoices.filter((pi) => pi.status !== 'Approved');

  const paidInvoicesAmt      = paidInvoices.reduce((s, inv) => s + getItemAmount(inv), 0);
  const pendingInvoicesAmt   = pendingInvoices.reduce((s, inv) => s + getItemAmount(inv), 0);

  const approvedProformasAmt = approvedProformas.reduce((s, pi) => s + getItemAmount(pi), 0);
  const pendingProformasAmt  = pendingProformas.reduce((s, pi) => s + getItemAmount(pi), 0);

  // Invoices created standalone (not linked to any proforma)
  const standalonePaidInvoices = paidInvoices.filter((inv) => {
    const hasRefs = Array.isArray(inv.proformaRefs) && inv.proformaRefs.length > 0;
    const hasRefNo = Boolean(inv.referenceNo);
    const hasSource = Boolean(inv.sourceProformaNumber);
    return !hasRefs && !hasRefNo && !hasSource;
  });
  const standalonePaidInvoicesAmt = standalonePaidInvoices.reduce((s, inv) => s + getItemAmount(inv), 0);

  // Total Paid Revenue based on Approved Proformas + any direct standalone Paid Invoices (zero double-counting)
  const totalPaidAmt = approvedProformasAmt + standalonePaidInvoicesAmt;

  const standalonePendingInvoices = pendingInvoices.filter((inv) => {
    const hasRefs = Array.isArray(inv.proformaRefs) && inv.proformaRefs.length > 0;
    const hasRefNo = Boolean(inv.referenceNo);
    const hasSource = Boolean(inv.sourceProformaNumber);
    return !hasRefs && !hasRefNo && !hasSource;
  });
  const totalPendingAmt = pendingProformasAmt + standalonePendingInvoices.reduce((s, inv) => s + getItemAmount(inv), 0);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const recentInvoices = invoices.slice(0, 5);
  const recentProformas = proformaInvoices.slice(0, 5);

  const stats = [
    {
      label: 'Total Paid Revenue',
      value: formatCurrency(totalPaidAmt),
      sub: `${approvedProformas.length} approved proformas · ${paidInvoices.length} paid invoices`,
      Icon: FiTrendingUp,
      colors: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
      badge: 'All Collected',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      label: 'Paid Proforma Amt',
      value: formatCurrency(approvedProformasAmt),
      sub: `${approvedProformas.length} proforma${approvedProformas.length !== 1 ? 's' : ''} approved (paid)`,
      Icon: FiCheckCircle,
      colors: 'bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white',
      badge: 'Proforma',
      badgeColor: 'bg-sky-100 text-sky-800',
    },
    {
      label: 'Paid Invoice Amt',
      value: formatCurrency(paidInvoicesAmt),
      sub: `${paidInvoices.length} invoice${paidInvoices.length !== 1 ? 's' : ''} paid`,
      Icon: FiFileText,
      colors: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
      badge: 'Invoice',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      label: 'Total Pending Receivables',
      value: formatCurrency(totalPendingAmt),
      sub: `${pendingProformas.length} proformas · ${pendingInvoices.length} invoices pending`,
      Icon: FiClock,
      colors: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
    },
    {
      label: 'Pending Proforma Amt',
      value: formatCurrency(pendingProformasAmt),
      sub: `${pendingProformas.length} awaiting approval`,
      Icon: FiAlertCircle,
      colors: 'bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white',
    },
    {
      label: 'Total Documents',
      value: `${totalInvoicesCount} Invoices / ${totalProformasCount} Proformas`,
      sub: `${totalInvoicesCount + totalProformasCount} total active records`,
      Icon: FiBookOpen,
      colors: 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dashboard Top Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{config.title}</h2>
          <p className="text-xs text-slate-400 mt-1">{config.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ExportButton customInvoices={invoices} customProformas={proformaInvoices} label="Export .xlsx" />

          <button
            onClick={() => navigate(config.proformaRoute || '/proforma-invoice')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 active:scale-95 transition-all shadow-sm"
          >
            <FiPlusCircle size={15} className="text-slate-400" />
            <span>Create Proforma</span>
          </button>

          <button
            onClick={() => navigate(config.invoiceRoute || '/invoice')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-md shadow-indigo-600/10 active:scale-95 transition-all"
          >
            <FiPlusCircle size={15} />
            <span>Issue Invoice</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat) => {
          const Icon = stat.Icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  {stat.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.badgeColor}`}>
                      {stat.badge}
                    </span>
                  )}
                </div>
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${stat.colors}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-4">
                <h3
                  className="text-xl font-black text-slate-800 tracking-tight truncate"
                  title={typeof stat.value === 'string' ? stat.value : undefined}
                >
                  {stat.value}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 font-semibold">
                  <FiTrendingUp className="text-emerald-500 shrink-0" size={11} />
                  <span>{stat.sub}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Table section with Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Recent Documents</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Quick lookup of recent Invoices and Proformas with live status tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(tableTab === 'invoices' ? (config.invoiceRoute || '/invoice') : (config.proformaRoute || '/proforma-invoice'))}
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none"
            >
              <span>View All {tableTab === 'invoices' ? 'Invoices' : 'Proformas'}</span>
              <FiArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTableTab('invoices')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              tableTab === 'invoices'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <FiFileText size={14} />
            <span>Recent Invoices ({invoices.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTableTab('proformas')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              tableTab === 'proformas'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <FiBookOpen size={14} />
            <span>Recent Proformas ({proformaInvoices.length})</span>
          </button>
        </div>

        {/* Tab 1: Recent Invoices Table */}
        {tableTab === 'invoices' && (
          recentInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200/80 rounded-2xl text-center">
              <p className="text-xs text-slate-400">No invoices generated yet.</p>
              <button
                onClick={() => navigate(config.invoiceRoute || '/invoice')}
                className="mt-4 text-xs font-bold text-indigo-600 hover:underline focus:outline-none"
              >
                Issue your first invoice
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">Invoice No.</th>
                      <th className="px-6 py-4">Proforma Ref.</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Created Date</th>
                      <th className="px-6 py-4">Rate</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                    {recentInvoices.map((invoice) => {
                      const isPaid = invoice.status === 'Paid';
                      const isOverdue =
                        !isPaid &&
                        new Date(invoice.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

                      const proformaRefsList = Array.isArray(invoice.proformaRefs)
                        ? invoice.proformaRefs
                        : invoice.referenceNo
                        ? invoice.referenceNo.split(',').map((s) => s.trim()).filter(Boolean)
                        : invoice.sourceProformaNumber
                        ? [invoice.sourceProformaNumber]
                        : [];

                      return (
                        <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-indigo-600 bg-indigo-50/50 border border-indigo-100/50 px-2 py-0.5 rounded text-xs">
                              {invoice.invoiceNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {proformaRefsList.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {proformaRefsList.map((ref) => (
                                  <span
                                    key={ref}
                                    className="font-bold text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded text-[11px]"
                                  >
                                    {ref}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-slate-800">{invoice.name}</p>
                              <p className="text-xs text-slate-400 font-normal">{invoice.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-normal">
                            {formatDate(invoice.createdDate)}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {formatCurrency(getItemAmount(invoice))}
                          </td>
                          <td className="px-6 py-4">
                            {isPaid ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                Paid
                              </span>
                            ) : isOverdue ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                                Overdue
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  config.invoiceDetailRoute
                                    ? config.invoiceDetailRoute(invoice.id)
                                    : `/invoice/${invoice.id}`
                                )
                              }
                              className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                              title="View Details"
                            >
                              <FiEye size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* Tab 2: Recent Proformas Table */}
        {tableTab === 'proformas' && (
          recentProformas.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200/80 rounded-2xl text-center">
              <p className="text-xs text-slate-400">No proforma invoices generated yet.</p>
              <button
                onClick={() => navigate(config.proformaRoute || '/proforma-invoice')}
                className="mt-4 text-xs font-bold text-violet-600 hover:underline focus:outline-none"
              >
                Create your first proforma
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">Proforma No.</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Created Date</th>
                      <th className="px-6 py-4">Rate</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                    {recentProformas.map((proforma) => {
                      const isApproved = proforma.status === 'Approved';

                      return (
                        <tr key={proforma.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-violet-600 bg-violet-50/50 border border-violet-100/50 px-2 py-0.5 rounded text-xs">
                              {proforma.invoiceNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-slate-800">{proforma.name}</p>
                              <p className="text-xs text-slate-400 font-normal">{proforma.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-normal">
                            {formatDate(proforma.createdDate)}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {formatCurrency(getItemAmount(proforma))}
                          </td>
                          <td className="px-6 py-4">
                            {isApproved ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                Approved (Paid)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/proforma-invoice/${proforma.id}`)
                              }
                              className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-violet-600 transition-colors"
                              title="View Details"
                            >
                              <FiEye size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
