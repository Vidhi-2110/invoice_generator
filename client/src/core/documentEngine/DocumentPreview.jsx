import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components';
import { calculateTax, calculateGrandTotal, formatCurrency, formatNumericDate, numberToWords } from '../utils';
import { FiArrowLeft, FiPrinter } from 'react-icons/fi';
import { useCompanySettings } from '../../components/Layout/CompanySettingsContext';
import { getPaletteById } from '../../core/theme/palettes';

/* ─── Inline style helpers so CSS vars work in print media too ── */
const brandStyle = (prop, extra = {}) => ({
  ...extra,
  color: `var(--brand-primary)`,
});
const brandBg = (extra = {}) => ({
  ...extra,
  backgroundColor: `var(--brand-primary)`,
});
const brandBorder = (extra = {}) => ({
  ...extra,
  borderColor: `var(--brand-primary)`,
});

const DocumentPreview = ({ item, config }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldPrint = searchParams.get('print') === 'true';
  const { settings } = useCompanySettings();

  // Resolved palette for fallback hex (CSS vars work on screen; hex used as data-uri fallback)
  const palette = getPaletteById(settings.colorPalette || 'indigo');

  const isProforma = config.title?.toLowerCase().includes('proforma');
  const routePrefix = isProforma ? '/proforma-invoice' : '/invoice';
  const company = config.companyDetails || {};

  // Live-editable adjustment — starts from saved value, can be changed before print
  const [prevAdjustment, setPrevAdjustment] = useState(item?.adjustment);
  const [liveAdjustment, setLiveAdjustment] = useState((parseFloat(item?.adjustment) || 0).toString());

  if (item?.adjustment !== prevAdjustment) {
    setPrevAdjustment(item?.adjustment);
    setLiveAdjustment((parseFloat(item?.adjustment) || 0).toString());
  }

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
  const adjustment = parseFloat(liveAdjustment) || 0;
  const total = calculateGrandTotal(subtotal, gst) + adjustment;

  // Company details: prefer settings, fall back to config.companyDetails
  const companyName    = settings.companyName    || company.name    || '';
  const companyEmail   = settings.email          || company.email   || '';
  const companyPhone   = settings.phone          || company.phone   || '';
  const companyAddress = settings.address        || company.address || '';
  const bankName       = settings.bankName       || 'ICICI Bank';
  const bankAccount    = settings.accountNumber  || '000305027144';
  const bankIfsc       = settings.ifscCode       || 'ICIC0000003';
  const bankBranch     = settings.branchName     || 'Main Branch';
  const accountName    = settings.accountName    || companyName;
  const companyLogo    = settings.logo           || null;
  const esign          = settings.esign          || null;
  const stamp          = settings.stamp          || null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:p-0 print:shadow-none print:max-w-full">

      {/* ── Action Header Bar (hidden on print) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm print:hidden">
        <Button variant="outline" size="sm" onClick={() => navigate(routePrefix)} icon={FiArrowLeft}>
          Back to List
        </Button>
        <Button variant={isProforma ? 'violet' : 'primary'} size="sm" onClick={() => window.print()} icon={FiPrinter}>
          Print / Download PDF
        </Button>
      </div>

      {/* ── Document PDF Container ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-md overflow-hidden print:shadow-sm print:rounded-2xl print:border print:border-slate-200/80 print:break-inside-avoid">

        {/* ── Top Brand Accent Bar ── */}
        <div className="h-2.5 w-full" style={brandBg()} />

        <div className="p-8 md:p-12 space-y-6 md:space-y-8 print:p-8 print:py-6 print:space-y-4">

          {/* ── Header: Company Info + Document Title ── */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 print:gap-4">

            {/* Left: Logo + Company Details */}
            <div className="space-y-2 max-w-sm text-xs font-medium text-slate-700 leading-snug print:space-y-1">
              <div className="mb-3 print:mb-1.5">
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt={companyName}
                    className="h-12 print:h-10 w-auto object-contain"
                  />
                ) : companyName ? (
                  <div
                    className="inline-flex items-center justify-center h-12 px-4 rounded-xl text-white font-extrabold text-xl tracking-wide"
                    style={brandBg()}
                  >
                    {companyName}
                  </div>
                ) : null}
              </div>

              {companyName && <p className="font-bold text-slate-900 text-sm">{companyName}</p>}

              {(settings.tagline || company.website) && (
                <p>
                  <a
                    href={settings.tagline ? undefined : `https://${company.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold hover:underline"
                    style={brandStyle()}
                  >
                    {settings.tagline || company.website}
                  </a>
                </p>
              )}
              {companyEmail && (
                <p><span className="font-bold text-slate-900">Email:</span> {companyEmail}</p>
              )}
              {companyPhone && (
                <p><span className="font-bold text-slate-900">Phone:</span> {companyPhone}</p>
              )}
              {company.gstin && (
                <p><span className="font-bold text-slate-900">GSTIN:</span> {company.gstin}</p>
              )}
              {companyAddress && (
                <p className="text-slate-600 pt-1 leading-normal print:pt-0.5">{companyAddress}</p>
              )}
            </div>

            {/* Right: Document Title + Number */}
            <div className="text-left md:text-right space-y-2 print:space-y-1">
              <div className="inline-block pb-1" style={brandBorder({ borderBottomWidth: 2, borderBottomStyle: 'solid' })}>
                <h1
                  className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide print:text-2xl"
                  style={brandStyle()}
                >
                  {config.title || 'INVOICE'}
                </h1>
              </div>
              <div className="text-xs font-semibold text-slate-800 space-y-1 pt-1 print:pt-0.5">
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

          <div className="border-t border-slate-200/80" />

          {/* ── Bill To ── */}
          <div className="space-y-3 print:space-y-1.5">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={brandStyle()}>Bill To</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4 text-xs text-slate-700 leading-relaxed">
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                {item.gstin && <p><span className="font-bold text-slate-900">GSTIN:</span> {item.gstin}</p>}
                {item.phone && <p><span className="font-bold text-slate-900">Phone:</span> {item.phone}</p>}
              </div>
              <div className="space-y-1">
                <p className="text-slate-700 leading-normal">{item.address}</p>
                {item.email && <p><span className="font-bold text-slate-900">Email:</span> {item.email}</p>}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/80" />

          {/* ── Line Items Table ── */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider"
                  style={{ color: `var(--brand-primary)` }}
                >
                  <th className="py-2.5 px-3 print:py-1.5 w-16">Sr. No.</th>
                  <th className="py-2.5 px-3 print:py-1.5">Description</th>
                  <th className="py-2.5 px-3 print:py-1.5 text-right w-36">Rate</th>
                  <th className="py-2.5 px-3 print:py-1.5 text-right w-36">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                {lineItemsList.map((line, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50/40' : 'bg-white'}>
                    <td className="py-2.5 px-3 print:py-1.5 text-slate-600 font-semibold">{idx + 1}.</td>
                    <td className="py-2.5 px-3 print:py-1.5 whitespace-pre-wrap font-medium">{line.description}</td>
                    <td className="py-2.5 px-3 print:py-1.5 text-right text-slate-700">
                      {formatCurrency(line.rate, currencySymbol)}
                    </td>
                    <td className="py-2.5 px-3 print:py-1.5 text-right font-bold text-slate-900">
                      {formatCurrency(line.rate, currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200/80" />

          {/* ── Summary + Totals ── */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 print:gap-4">
            {/* Amount in Words */}
            <div className="text-xs text-slate-800 font-medium max-w-md pt-1">
              <p><span className="font-bold text-slate-900">In Words:</span> {numberToWords(total)}</p>
            </div>

            {/* Calculations */}
            <div className="w-full md:w-72 space-y-1.5 text-xs font-medium text-slate-700 print:space-y-1">
              {[
                { label: 'Subtotal', value: formatCurrency(subtotal, currencySymbol) },
                { label: `CGST(${Math.round(taxRate * 50)}%)`, value: formatCurrency(gst / 2, currencySymbol) },
                { label: `SGST(${Math.round(taxRate * 50)}%)`, value: formatCurrency(gst / 2, currencySymbol) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-0.5">
                  <span className="font-bold" style={brandStyle()}>{label}</span>
                  <span className="font-bold text-slate-900">{value}</span>
                </div>
              ))}

              {/* Adjustments */}
              <div className="flex justify-between items-center py-0.5 gap-2">
                <span className="font-bold shrink-0" style={brandStyle()}>Adjustments</span>
                <div className="flex items-center gap-1 print:hidden">
                  <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={liveAdjustment}
                    onChange={(e) => setLiveAdjustment(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-28 text-right text-xs font-bold text-slate-900 rounded-md px-2 py-1 focus:outline-none transition"
                    style={{
                      border: `1px solid color-mix(in srgb, var(--brand-primary) 40%, transparent)`,
                      backgroundColor: `color-mix(in srgb, var(--brand-primary) 6%, white)`,
                      boxShadow: `0 0 0 2px transparent`,
                    }}
                    onFocusCapture={(e) => {
                      e.target.style.boxShadow = `0 0 0 2px color-mix(in srgb, var(--brand-primary) 25%, transparent)`;
                    }}
                    onBlurCapture={(e) => {
                      e.target.style.boxShadow = '0 0 0 2px transparent';
                    }}
                    title="Click to edit adjustment"
                  />
                </div>
                <span className="hidden print:inline font-bold text-slate-900">
                  {formatCurrency(adjustment, currencySymbol)}
                </span>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="font-extrabold text-slate-900 text-sm">Total</span>
                <span className="text-xl md:text-2xl font-black" style={brandStyle()}>
                  {formatCurrency(total, currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/80 pt-4 print:pt-2" />

          {/* ── Footer: Bank Details + Signatory ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4 items-end">

            {/* Bank Details */}
            <div className="space-y-1.5 print:space-y-1">
              <h3
                className="text-xs font-bold pb-0.5 border-b border-slate-200 inline-block uppercase tracking-wider"
                style={brandStyle()}
              >
                Bank Details
              </h3>
              <div className="text-[11px] font-semibold text-slate-700 space-y-0.5 leading-snug">
                {accountName  && <p><span className="font-bold text-slate-900">Account Name:</span> {accountName}</p>}
                {bankName     && <p><span className="font-bold text-slate-900">Bank Name:</span> {bankName}</p>}
                {bankAccount  && <p><span className="font-bold text-slate-900">Account Number:</span> {bankAccount}</p>}
                {bankIfsc     && <p><span className="font-bold text-slate-900">IFSC Code:</span> {bankIfsc}</p>}
                {bankBranch   && <p><span className="font-bold text-slate-900">Branch:</span> {bankBranch}</p>}
              </div>
            </div>

            {/* Authorized Signatory */}
            <div className="text-left md:text-right space-y-1 print:space-y-0.5">
              <h3
                className="text-xs font-bold pb-0.5 border-b border-slate-200 inline-block uppercase tracking-wider"
                style={brandStyle()}
              >
                Authorized Signatory
              </h3>
              <p className="text-[11px] font-semibold text-slate-800">For {companyName || 'the Company'}</p>

              {/* Stamp & Signature */}
              <div className="relative h-24 print:h-20 w-64 ml-0 md:ml-auto flex items-center justify-center my-1 overflow-visible">
                {stamp ? (
                  <img
                    src={stamp}
                    alt="Company Stamp"
                    className="h-20 print:h-16 w-20 print:w-16 absolute right-10 top-0 opacity-80 mix-blend-multiply pointer-events-none object-contain"
                  />
                ) : null}
                {esign ? (
                  <img
                    src={esign}
                    alt="Authorized Signature"
                    className="h-20 print:h-16 w-44 print:w-36 z-10 absolute right-0 top-0 opacity-100 mix-blend-multiply pointer-events-none object-contain"
                  />
                ) : (
                  <div
                    className="absolute bottom-0 right-0 w-40 h-px"
                    style={{ backgroundColor: `var(--brand-primary)`, opacity: 0.4 }}
                  />
                )}
              </div>
              <p className="text-[11px] font-semibold text-slate-600">Authorized Signature</p>
            </div>
          </div>
        </div>

        {/* ── Bottom Brand Banner ── */}
        <div
          className="py-2.5 print:py-2 text-center text-white text-xs print:text-[11px] font-bold tracking-wider uppercase"
          style={brandBg()}
        >
          {settings.tagline || 'Driven By Intelligence'}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
