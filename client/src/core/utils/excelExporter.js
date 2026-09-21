/**
 * Excel / CSV Exporter Utility for Invoices & Proforma Invoices
 * Uses persistent Blob download streams to guarantee that files are written
 * directly into the macOS Finder / Windows File Explorer Downloads folder,
 * allowing double-click opening in Microsoft Excel or Apple Numbers.
 */

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: Escape strings safely for CSV fields
const escapeCSV = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * Triggers a native browser file download that persists directly
 * in the OS File Manager (macOS Finder / Windows Explorer Downloads directory).
 */
const triggerFileDownload = (content, filename, mimeType = 'text/csv;charset=utf-8;') => {
  // Prepend UTF-8 BOM (\uFEFF) so Excel, Numbers & Sheets open Unicode & rupee symbols cleanly
  const bomContent = '\uFEFF' + content;
  const blob = new Blob([bomContent], { type: mimeType });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Keep ObjectURL active for 2 minutes so Chrome & macOS Finder finish flushing to disk
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 120000);
};

/**
 * Builds CSV text from items list
 */
const generateCSV = (items = [], isProforma = false) => {
  const typeLabel = isProforma ? 'Proforma' : 'Invoice';
  const dateHeader = isProforma ? 'Valid Until' : 'Due Date';

  const headers = [
    `${typeLabel} No.`,
    'Reference No.',
    'Customer Name',
    'Customer Email',
    'Customer Phone',
    'Customer Address',
    'GSTIN',
    'Created Date',
    dateHeader,
    'Status',
    'Subtotal (₹)',
    'GST 18% (₹)',
    'Total Amount (₹)',
    'Line Items Summary',
  ];

  const rows = [headers.map(escapeCSV).join(',')];

  items.forEach((item) => {
    const lineItems = item.lineItems || [];
    const subtotal = lineItems.reduce(
      (sum, line) => sum + (parseFloat(line.rate || line.amount || 0) * (parseFloat(line.hours || line.qty || 1))),
      0
    ) || (parseFloat(item.rate) || 0);

    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    const itemsSummaryStr = lineItems.length > 0
      ? lineItems.map((l) => `${l.description || 'Item'} (${l.hours || l.qty || 1}x ₹${l.rate || 0})`).join(' | ')
      : `Rate: ₹${item.rate || 0}`;

    const row = [
      item.invoiceNumber || '-',
      item.referenceNo || '-',
      item.name || '-',
      item.email || '-',
      item.phone || '-',
      item.address || '-',
      item.gstin || '-',
      formatDate(item.createdDate),
      formatDate(item.dueDate),
      item.status || 'Pending',
      subtotal.toFixed(2),
      gst.toFixed(2),
      total.toFixed(2),
      itemsSummaryStr,
    ];

    rows.push(row.map(escapeCSV).join(','));
  });

  return rows.join('\r\n');
};

/**
 * Builds combined CSV text for both Invoices & Proformas
 */
const generateCombinedCSV = (invoices = [], proformas = []) => {
  const headers = [
    'Document Type',
    'Document No.',
    'Reference No.',
    'Customer Name',
    'Customer Email',
    'Customer Phone',
    'Customer Address',
    'GSTIN',
    'Created Date',
    'Due Date / Valid Until',
    'Status',
    'Subtotal (₹)',
    'GST 18% (₹)',
    'Total Amount (₹)',
    'Line Items Summary',
  ];

  const rows = [headers.map(escapeCSV).join(',')];

  const processItems = (items, typeName) => {
    items.forEach((item) => {
      const lineItems = item.lineItems || [];
      const subtotal = lineItems.reduce(
        (sum, line) => sum + (parseFloat(line.rate || line.amount || 0) * (parseFloat(line.hours || line.qty || 1))),
        0
      ) || (parseFloat(item.rate) || 0);

      const gst = subtotal * 0.18;
      const total = subtotal + gst;

      const itemsSummaryStr = lineItems.length > 0
        ? lineItems.map((l) => `${l.description || 'Item'} (${l.hours || l.qty || 1}x ₹${l.rate || 0})`).join(' | ')
        : `Rate: ₹${item.rate || 0}`;

      const row = [
        typeName,
        item.invoiceNumber || '-',
        item.referenceNo || '-',
        item.name || '-',
        item.email || '-',
        item.phone || '-',
        item.address || '-',
        item.gstin || '-',
        formatDate(item.createdDate),
        formatDate(item.dueDate),
        item.status || 'Pending',
        subtotal.toFixed(2),
        gst.toFixed(2),
        total.toFixed(2),
        itemsSummaryStr,
      ];

      rows.push(row.map(escapeCSV).join(','));
    });
  };

  processItems(invoices, 'Invoice');
  processItems(proformas, 'Proforma Invoice');

  return rows.join('\r\n');
};

/**
 * Public Export Functions
 */

export const exportInvoicesToExcel = (invoices = [], customFilename = null) => {
  const dateStr = getTodayDateStr();
  const filename = customFilename || `Invoices_Export_${dateStr}.csv`;
  const csvContent = generateCSV(invoices, false);
  triggerFileDownload(csvContent, filename, 'text/csv;charset=utf-8;');
};

export const exportProformasToExcel = (proformas = [], customFilename = null) => {
  const dateStr = getTodayDateStr();
  const filename = customFilename || `Proforma_Invoices_Export_${dateStr}.csv`;
  const csvContent = generateCSV(proformas, true);
  triggerFileDownload(csvContent, filename, 'text/csv;charset=utf-8;');
};

export const exportAllToExcel = (invoices = [], proformas = [], customFilename = null) => {
  const dateStr = getTodayDateStr();
  const filename = customFilename || `All_Invoices_Report_${dateStr}.csv`;
  const csvContent = generateCombinedCSV(invoices, proformas);
  triggerFileDownload(csvContent, filename, 'text/csv;charset=utf-8;');
};
