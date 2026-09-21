import { useState, useRef, useEffect } from 'react';
import { FiDownload, FiChevronDown, FiFileText, FiBookOpen, FiLayers, FiCheck } from 'react-icons/fi';
import { useInvoices } from '../modules/invoice/context/InvoiceContext';
import { useProforma } from '../modules/proforma/context/ProformaContext';
import {
  exportInvoicesToExcel,
  exportProformasToExcel,
  exportAllToExcel,
} from '../core/utils/excelExporter';

const ExportButton = ({
  type = 'dropdown', // 'invoices' | 'proformas' | 'all' | 'dropdown'
  customInvoices = null,
  customProformas = null,
  label = 'Export .xlsx',
  className = '',
}) => {
  const { invoices: contextInvoices } = useInvoices();
  const { proformaInvoices: contextProformas } = useProforma();

  const [isOpen, setIsOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(null);
  const dropdownRef = useRef(null);

  const invoices = customInvoices || contextInvoices || [];
  const proformas = customProformas || contextProformas || [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerSuccessFeedback = (msg) => {
    setDownloadSuccess(msg);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleExportInvoices = () => {
    exportInvoicesToExcel(invoices);
    triggerSuccessFeedback('Invoices downloaded!');
    setIsOpen(false);
  };

  const handleExportProformas = () => {
    exportProformasToExcel(proformas);
    triggerSuccessFeedback('Proformas downloaded!');
    setIsOpen(false);
  };

  const handleExportAll = () => {
    exportAllToExcel(invoices, proformas);
    triggerSuccessFeedback('All records downloaded!');
    setIsOpen(false);
  };

  // Direct single-click export modes
  const handleDirectClick = () => {
    if (type === 'invoices') {
      handleExportInvoices();
    } else if (type === 'proformas') {
      handleExportProformas();
    } else if (type === 'all') {
      handleExportAll();
    } else {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Toast alert feedback */}
      {downloadSuccess && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap px-3 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg shadow-lg flex items-center gap-1.5 animate-bounce">
          <FiCheck size={12} />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Main Export CTA Button */}
      <button
        type="button"
        onClick={handleDirectClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200/90 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all cursor-pointer ${className}`}
        title={`Export to Excel (.xlsx)`}
      >
        <FiDownload size={15} className="text-emerald-600 shrink-0" />
        <span>{label}</span>
        {type === 'dropdown' && (
          <FiChevronDown
            size={14}
            className={`text-emerald-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* Dropdown Options (only rendered if type === 'dropdown') */}
      {type === 'dropdown' && isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 z-50 overflow-hidden animate-fade-in p-1.5 divide-y divide-slate-100">
          <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Download XLSX Excel
          </div>

          <div className="py-1">
            {/* Export Invoices */}
            <button
              type="button"
              onClick={handleExportInvoices}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-left cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <FiFileText size={14} />
              </div>
              <div>
                <p className="font-bold text-slate-800">Export Invoices</p>
                <p className="text-[10px] text-slate-400 font-normal">
                  {invoices.length} record{invoices.length !== 1 ? 's' : ''} (.xlsx)
                </p>
              </div>
            </button>

            {/* Export Proformas */}
            <button
              type="button"
              onClick={handleExportProformas}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-left cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-violet-50 text-violet-600">
                <FiBookOpen size={14} />
              </div>
              <div>
                <p className="font-bold text-slate-800">Export Proformas</p>
                <p className="text-[10px] text-slate-400 font-normal">
                  {proformas.length} record{proformas.length !== 1 ? 's' : ''} (.xlsx)
                </p>
              </div>
            </button>
          </div>

          {/* Export Both Combined */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleExportAll}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-left cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <FiLayers size={14} />
              </div>
              <div>
                <p className="font-bold text-emerald-700">Export Both (All)</p>
                <p className="text-[10px] text-slate-400 font-normal">
                  Combined Excel workbook
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
