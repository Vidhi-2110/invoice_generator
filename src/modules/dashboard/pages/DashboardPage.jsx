import { useNavigate } from 'react-router-dom';
import { FiFileText, FiBookOpen, FiClock, FiPlusCircle, FiTrendingUp, FiArrowRight, FiEye, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import defaultDashboardConfig from '../dashboardConfig';

const DashboardPage = ({ invoices = [], proformaInvoices = [], config = defaultDashboardConfig }) => {
  const navigate = useNavigate();

  // --- Live reactive calculations (re-computed on every status change) ---
  const totalInvoicesCount   = invoices.length;
  const totalProformasCount  = proformaInvoices.length;

  const paidInvoices         = invoices.filter((inv) => inv.status === 'Paid');
  const pendingInvoices      = invoices.filter((inv) => inv.status !== 'Paid');

  const approvedProformas    = proformaInvoices.filter((pi) => pi.status === 'Approved');
  const pendingProformas     = proformaInvoices.filter((pi) => pi.status !== 'Approved');

  const paidInvoicesAmt      = paidInvoices.reduce((s, inv) => s + (parseFloat(inv.rate) || 0), 0);
  const pendingInvoicesAmt   = pendingInvoices.reduce((s, inv) => s + (parseFloat(inv.rate) || 0), 0);

  const approvedProformasAmt = approvedProformas.reduce((s, pi) => s + (parseFloat(pi.rate) || 0), 0);
  const pendingProformasAmt  = pendingProformas.reduce((s, pi) => s + (parseFloat(pi.rate) || 0), 0);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const recentInvoices = invoices.slice(0, 5);

  const stats = [
    {
      label: 'Total Invoices',
      value: totalInvoicesCount,
      sub: 'Issued billing accounts',
      Icon: FiFileText,
      colors: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
    },
    {
      label: 'Total Proformas',
      value: totalProformasCount,
      sub: 'Preliminary estimates',
      Icon: FiBookOpen,
      colors: 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white',
    },
    {
      label: 'Paid Invoice Amt',
      value: formatCurrency(paidInvoicesAmt),
      sub: `${paidInvoices.length} invoice${paidInvoices.length !== 1 ? 's' : ''} paid`,
      Icon: FiCheckCircle,
      colors: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
    },
    {
      label: 'Pending Invoice Amt',
      value: formatCurrency(pendingInvoicesAmt),
      sub: `${pendingInvoices.length} awaiting payment`,
      Icon: FiClock,
      colors: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
    },
    {
      label: 'Approved Proforma Amt',
      value: formatCurrency(approvedProformasAmt),
      sub: `${approvedProformas.length} approved`,
      Icon: FiTrendingUp,
      colors: 'bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white',
    },
    {
      label: 'Pending Proforma Amt',
      value: formatCurrency(pendingProformasAmt),
      sub: `${pendingProformas.length} awaiting approval`,
      Icon: FiAlertCircle,
      colors: 'bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white',
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

        <div className="flex flex-wrap gap-3">
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
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </span>
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

      {/* Recent Invoices Table section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Recent Invoices</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Quick lookup of the 5 most recently created invoices.
            </p>
          </div>

          <button
            onClick={() => navigate(config.invoiceRoute || '/invoice')}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none"
          >
            <span>View All Invoices</span>
            <FiArrowRight size={14} />
          </button>
        </div>

        {recentInvoices.length === 0 ? (
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

                    return (
                      <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-indigo-600 bg-indigo-50/50 border border-indigo-100/50 px-2 py-0.5 rounded text-xs">
                            {invoice.invoiceNumber}
                          </span>
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
                          {formatCurrency(invoice.rate)}
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
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
