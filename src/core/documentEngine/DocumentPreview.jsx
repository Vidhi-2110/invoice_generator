import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components';
import { calculateSubtotal, calculateTax, calculateGrandTotal, formatCurrency, formatLongDate } from '../utils';
import { FiArrowLeft, FiPrinter, FiMail, FiPhone, FiGlobe, FiMapPin, FiBriefcase } from 'react-icons/fi';

const DocumentPreview = ({ item, config }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldPrint = searchParams.get('print') === 'true';

  const isFieldActive = (fieldName) => (config.fields ? config.fields.includes(fieldName) : true);
  const isProforma = config.title?.toLowerCase().includes('proforma');
  const routePrefix = isProforma ? '/proforma-invoice' : '/invoice';
  const company = config.companyDetails || {};

  useEffect(() => {
    if (shouldPrint && item) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldPrint, item]);

  if (!item) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 p-8 max-w-xl mx-auto shadow-sm">
        <p className="text-sm font-semibold text-slate-500">{config.title} record not found.</p>
        <Button variant="primary" onClick={() => navigate(routePrefix)} className="mt-4">
          Back to List
        </Button>
      </div>
    );
  }

  const subtotal = calculateSubtotal(item.rate);
  const taxRate = config.taxRate ?? 0.18;
  const gst = calculateTax(subtotal, taxRate);
  const total = calculateGrandTotal(subtotal, gst);
  const currencySymbol = config.currency || '₹';
  const taxLabel = config.taxLabel || 'GST (18%)';

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:p-0 print:shadow-none print:max-w-full">
      {/* Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm print:hidden">
        <Button variant="outline" size="sm" onClick={() => navigate(routePrefix)} icon={FiArrowLeft}>
          Back to List
        </Button>
        <Button variant={isProforma ? 'violet' : 'primary'} size="sm" onClick={() => window.print()} icon={FiPrinter}>
          Print / PDF Download
        </Button>
      </div>

      {/* Document A4 Body */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 md:p-12 shadow-sm space-y-12 print:border-none print:shadow-none print:p-0">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-slate-100 pb-10">
          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="text-xl font-black text-slate-800 tracking-tight">{company.name}</span>
            </div>

            <div className="space-y-2 text-xs font-medium text-slate-500 leading-relaxed">
              {company.address && (
                <p className="flex items-start gap-2">
                  <FiMapPin className="text-slate-400 mt-0.5 shrink-0" size={13} />
                  <span>{company.address}</span>
                </p>
              )}
              {company.email && (
                <p className="flex items-center gap-2">
                  <FiMail className="text-slate-400 shrink-0" size={13} />
                  <span>{company.email}</span>
                </p>
              )}
              {company.phone && (
                <p className="flex items-center gap-2">
                  <FiPhone className="text-slate-400 shrink-0" size={13} />
                  <span>{company.phone}</span>
                </p>
              )}
              {company.website && (
                <p className="flex items-center gap-2">
                  <FiGlobe className="text-slate-400 shrink-0" size={13} />
                  <span>{company.website}</span>
                </p>
              )}
              {company.gstin && (
                <p className="flex items-center gap-2 font-bold text-slate-700">
                  <FiBriefcase className="text-slate-400 shrink-0" size={13} />
                  <span>GSTIN: {company.gstin}</span>
                </p>
              )}
            </div>
          </div>

          <div className="text-left md:text-right space-y-3.5">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight uppercase">{config.title}</h1>
            <div className="space-y-1 text-sm font-semibold text-slate-600">
              <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Document Number</p>
              <p className={`text-lg font-black ${isProforma ? 'text-violet-600' : 'text-indigo-600'}`}>
                {item.invoiceNumber}
              </p>
              {isFieldActive('referenceNo') && item.referenceNo && (
                <p className="text-xs text-slate-500 font-semibold mt-1">Ref: {item.referenceNo}</p>
              )}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 border border-slate-100 rounded-2xl p-6 md:p-8">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isProforma ? 'Estimated For' : 'Bill To'}
            </h3>
            <div className="space-y-1.5">
              <p className="font-bold text-slate-800 text-base">{item.name}</p>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-xs">{item.address}</p>
              {item.email && <p className="text-xs text-slate-500 font-medium">Email: {item.email}</p>}
              {item.phone && <p className="text-xs text-slate-500 font-medium">Phone: {item.phone}</p>}
              {item.gstin && <p className="text-xs font-bold text-slate-700">GSTIN: {item.gstin}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Issued</p>
              <p className="text-sm font-bold text-slate-800">{formatLongDate(item.createdDate)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isProforma ? 'Valid Until' : 'Due Date'}
              </p>
              <p className="text-sm font-bold text-slate-800">{formatLongDate(item.dueDate)}</p>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                  item.status === 'Paid' || item.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}
              >
                {item.status || 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount ({currencySymbol})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              <tr>
                <td className="px-6 py-5 leading-relaxed font-semibold text-slate-800">{item.description}</td>
                <td className="px-6 py-5 text-right font-bold text-slate-800">
                  {formatCurrency(item.rate, currencySymbol)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Footer Block */}
        <div className="flex flex-col md:flex-row md:justify-between items-start gap-8 pt-4">
          <div className="text-xs text-slate-400 max-w-xs leading-relaxed font-medium">
            <p className="font-bold text-slate-600 mb-1">Notes & Terms:</p>
            <p>
              {isProforma
                ? 'This document is a Proforma Invoice (preliminary estimate) for reference. It is not a tax invoice.'
                : 'Please review and verify billing details. Payment is due within the stipulated period.'}
            </p>
          </div>

          <div className="w-full md:w-80 space-y-3.5 text-sm font-semibold text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-slate-800 font-bold">{formatCurrency(subtotal, currencySymbol)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">{taxLabel}</span>
              <span className="text-slate-800 font-bold">{formatCurrency(gst, currencySymbol)}</span>
            </div>

            <div className="flex justify-between border-t border-slate-100 pt-3.5 text-base">
              <span className="font-black text-slate-800">Total Due</span>
              <span className={`font-black text-lg ${isProforma ? 'text-violet-600' : 'text-indigo-600'}`}>
                {formatCurrency(total, currencySymbol)}
              </span>
            </div>
          </div>
        </div>

        {/* Signatory Block */}
        <div className="pt-12 border-t border-slate-100 flex justify-end">
          <div className="text-center space-y-16">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">For {company.name}</p>
            <div className="space-y-1">
              <div className="w-48 border-b border-slate-300 mx-auto"></div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1.5">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
