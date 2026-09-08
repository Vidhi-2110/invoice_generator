import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components';
import { calculateSubtotal, calculateTax, calculateGrandTotal, formatCurrency, formatNumericDate, numberToWords } from '../utils';
import { FiArrowLeft, FiPrinter } from 'react-icons/fi';
import futentiaStamp from '../../assets/Futentia Stamp.png';
import jaySignature from '../../assets/Jay Signature 1.png';
import logoImg from '../../assets/logo.png';

const DocumentPreview = ({ item, config }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldPrint = searchParams.get('print') === 'true';

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

  const lineItemsList = item.lineItems && item.lineItems.length > 0
    ? item.lineItems
    : [{ description: item.description || '', rate: item.rate || 0 }];

  const subtotal = lineItemsList.reduce((sum, l) => sum + (parseFloat(l.rate) || 0), 0);
  const taxRate = config.taxRate ?? 0.18;
  const gst = calculateTax(subtotal, taxRate);
  const currencySymbol = config.currency || '₹';

  // Live-editable adjustment — starts from saved value, can be changed before print
  const [liveAdjustment, setLiveAdjustment] = useState((parseFloat(item.adjustment) || 0).toString());
  const adjustment = parseFloat(liveAdjustment) || 0;
  const total = calculateGrandTotal(subtotal, gst) + adjustment;

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:p-0 print:shadow-none print:max-w-full">
      {/* Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm print:hidden">
        <Button variant="outline" size="sm" onClick={() => navigate(routePrefix)} icon={FiArrowLeft}>
          Back to List
        </Button>
        <Button variant={isProforma ? 'violet' : 'primary'} size="sm" onClick={() => window.print()} icon={FiPrinter}>
          Print / Download PDF
        </Button>
      </div>

      {/* Document PDF Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-md overflow-hidden print:border-none print:shadow-none print:rounded-none">
        {/* Top Blue Accent Line */}
        <div className="h-2.5 bg-[#0B65C6] w-full"></div>

        <div className="p-8 md:p-12 space-y-8 print:p-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            {/* Left: Company Details */}
            <div className="space-y-2 max-w-sm text-xs font-medium text-slate-700 leading-snug">
              <div className="mb-3">
                <img
                  src={logoImg}
                  alt="Futentia Logo"
                  className="h-11 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              {company.website && (
                <p>
                  <a href={`https://${company.website}`} target="_blank" rel="noreferrer" className="text-[#0B65C6] font-semibold hover:underline">
                    {company.website}
                  </a>
                </p>
              )}
              {company.email && (
                <p>
                  <span className="font-bold text-slate-900">Email:</span> {company.email}
                </p>
              )}
              {company.phone && (
                <p>
                  <span className="font-bold text-slate-900">Phone:</span> {company.phone}
                </p>
              )}
              {company.gstin && (
                <p>
                  <span className="font-bold text-slate-900">GSTIN:</span> {company.gstin}
                </p>
              )}
              {company.address && <p className="text-slate-600 pt-1 leading-normal">{company.address}</p>}
            </div>

            {/* Right: Document Title & Number */}
            <div className="text-left md:text-right space-y-2">
              <div className="inline-block border-b-2 border-[#0B65C6] pb-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#0B65C6] uppercase tracking-wide">
                  {config.title || 'PROFORMA INVOICE'}
                </h1>
              </div>

              <div className="text-xs font-semibold text-slate-800 space-y-1 pt-1">
                <p>
                  <span className="font-bold text-slate-900">{isProforma ? 'PF Invoice No.' : 'Invoice No.'}:</span>{' '}
                  {item.invoiceNumber}
                </p>
                <p>
                  <span className="font-bold text-slate-900">Invoice Date:</span> {formatNumericDate(item.createdDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/80"></div>

          {/* Bill To Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#0B65C6] uppercase tracking-wider">Bill To</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                {item.gstin && (
                  <p>
                    <span className="font-bold text-slate-900">GSTIN:</span> {item.gstin}
                  </p>
                )}
                {item.phone && (
                  <p>
                    <span className="font-bold text-slate-900">Phone:</span> {item.phone}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-slate-700 leading-normal">{item.address}</p>
                {item.email && (
                  <p>
                    <span className="font-bold text-slate-900">Email:</span> {item.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/80"></div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[#0B65C6] text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-3 w-16">Sr. No.</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3 text-right w-36">Rate</th>
                  <th className="py-3 px-3 text-right w-36">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                {lineItemsList.map((line, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50/40' : 'bg-white'}>
                    <td className="py-3.5 px-3 text-slate-600 font-semibold">{idx + 1}.</td>
                    <td className="py-3.5 px-3 whitespace-pre-wrap font-medium">{line.description}</td>
                    <td className="py-3.5 px-3 text-right text-slate-700">
                      {formatCurrency(line.rate, currencySymbol)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(line.rate, currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200/80"></div>

          {/* Summary & Amounts Section */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            {/* Left: Amount in Words */}
            <div className="text-xs text-slate-800 font-medium max-w-md pt-1">
              <p>
                <span className="font-bold text-slate-900">In Words:</span> {numberToWords(total)}
              </p>
            </div>

            {/* Right: Calculations */}
            <div className="w-full md:w-72 space-y-2 text-xs font-medium text-slate-700">
              <div className="flex justify-between py-1">
                <span className="font-bold text-[#0B65C6]">Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(subtotal, currencySymbol)}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="font-bold text-[#0B65C6]">CGST(9%)</span>
                <span className="font-bold text-slate-900">{formatCurrency(gst / 2, currencySymbol)}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="font-bold text-[#0B65C6]">SGST(9%)</span>
                <span className="font-bold text-slate-900">{formatCurrency(gst / 2, currencySymbol)}</span>
              </div>

              <div className="flex justify-between items-center py-1 gap-2">
                <span className="font-bold text-[#0B65C6] shrink-0">Adjustments</span>
                {/* Editable input — hidden when printing */}
                <div className="flex items-center gap-1 print:hidden">
                  <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={liveAdjustment}
                    onChange={(e) => setLiveAdjustment(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-28 text-right text-xs font-bold text-slate-900 border border-[#0B65C6]/40 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0B65C6]/50 bg-blue-50/40 transition"
                    title="Click to edit adjustment"
                  />
                </div>
                {/* Static value shown only when printing */}
                <span className="hidden print:inline font-bold text-slate-900">{formatCurrency(adjustment, currencySymbol)}</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="font-extrabold text-slate-900 text-sm">Total</span>
                <span className="text-2xl font-black text-[#0B65C6]">
                  {formatCurrency(total, currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/80 pt-6"></div>

          {/* Footer Details: Bank Details & Authorized Signatory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            {/* Bank Details */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[#0B65C6] pb-1 border-b border-slate-200 inline-block">
                Bank Details
              </h3>
              <div className="text-xs font-semibold text-slate-700 space-y-1 leading-snug">
                <p>
                  <span className="font-bold text-slate-900">Account Name:</span> Futentia Solutions Private Limited
                </p>
                <p>
                  <span className="font-bold text-slate-900">Bank Name:</span> ICICI Bank
                </p>
                <p>
                  <span className="font-bold text-slate-900">Account Number:</span> 000305027144
                </p>
                <p>
                  <span className="font-bold text-slate-900">IFSC Code:</span> ICIC0000003
                </p>
                <p>
                  <span className="font-bold text-slate-900">Branch:</span> Chakli Circle
                </p>
              </div>
            </div>

            {/* Authorized Signatory */}
            <div className="text-left md:text-right space-y-2">
              <h3 className="text-sm font-bold text-[#0B65C6] pb-1 border-b border-slate-200 inline-block">
                Authorized Signatory
              </h3>
              <p className="text-xs font-semibold text-slate-800">For Futentia Solutions Pvt. Ltd.</p>

              {/* Stamp & Signature Area */}
              <div className="relative h-36 w-72 ml-0 md:ml-auto flex items-center justify-center my-2 overflow-visible">
                {/* Futentia Official Stamp */}
                <img
                  src={futentiaStamp}
                  alt="Futentia Official Stamp"
                  className="h-32 w-32 absolute right-12 top-2 opacity-80 mix-blend-multiply pointer-events-none object-contain"
                />

                {/* Jay Signature */}
                <img
                  src={jaySignature}
                  alt="Jay Signature"
                  className="h-32 w-64 z-10 absolute right-0 top-0 opacity-100 mix-blend-multiply pointer-events-none object-contain scale-125 origin-right"
                />
              </div>

              <p className="text-xs font-semibold text-slate-600">Authorized Signature</p>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-[#0B65C6] py-2.5 text-center text-white text-xs font-bold tracking-wider uppercase">
          Driven By Intelligence
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
