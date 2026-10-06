const nodemailer = require('nodemailer');

let _transporter = null;
let _cachedUser = null;

function getTransporter() {
  // If env vars were not loaded when the server started, try reloading from .env
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    require('dotenv').config();
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP credentials (SMTP_USER / SMTP_PASS) are not set in .env');
  }

  if (!_transporter || _cachedUser !== SMTP_USER) {
    _transporter = nodemailer.createTransport({
      host: SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(SMTP_PORT || '587', 10),
      secure: SMTP_SECURE === 'true', // true → port 465, false → STARTTLS on 587
      auth: {
        user: SMTP_USER.trim(),
        pass: SMTP_PASS.trim(),
      },
    });
    _cachedUser = SMTP_USER;
  }

  return _transporter;
}

// ─── HTML Email Template ──────────────────────────────────────────────────────
/**
 * Builds a modern Executive SaaS HTML email body for a Proforma Invoice.
 * @param {object} proforma  – The proforma document
 * @param {object} company   – Sender company details { name, email, phone, address, logo, bankName, accountNumber, ifscCode, branchName, accountName }
 * @returns {string} HTML string
 */
function buildProformaEmailHtml(proforma, company = {}) {
  const currency = '₹';
  const subtotal = (proforma.lineItems || []).reduce(
    (s, li) => s + (parseFloat(li.rate) || 0),
    0
  );
  const gstRate  = 0.18;
  const gstAmt   = subtotal * gstRate;
  const total    = subtotal + gstAmt;

  const fmt = (n) =>
    Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const companyName    = company.name    || process.env.COMPANY_NAME    || 'Futentia Solutions';
  const companyEmail   = company.email   || process.env.SMTP_USER       || '';
  const companyPhone   = company.phone   || process.env.COMPANY_PHONE   || '';
  const companyAddress = company.address || process.env.COMPANY_ADDRESS || '';

  // Bank details
  const bankName        = company.bankName        || process.env.BANK_NAME         || 'ICICI Bank';
  const bankAccountName = company.accountName     || process.env.BANK_ACCOUNT_NAME || companyName;
  const bankAccount     = company.accountNumber   || process.env.BANK_ACCOUNT      || '000305027144';
  const bankIfsc        = company.ifscCode        || process.env.BANK_IFSC         || 'ICIC0000003';
  const bankBranch      = company.branchName      || process.env.BANK_BRANCH       || 'Main Branch';

  // Direct PDF download URL
  const backendUrl = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`).replace(/\/$/, '');
  const proformaId = proforma.id || proforma._id || proforma.invoiceNumber || '';
  const downloadUrl = proformaId ? `${backendUrl}/api/proformas/${proformaId}/download` : backendUrl;

  // Status styling
  const statusRaw = proforma.status || 'Pending';
  const isApproved = statusRaw.toLowerCase() === 'approved';
  const isPaid     = statusRaw.toLowerCase() === 'paid';

  let statusBadgeBg    = 'rgba(245, 158, 11, 0.15)';
  let statusBadgeColor = '#fbbf24';
  let statusBadgeBorder= 'rgba(245, 158, 11, 0.35)';
  let statusDotColor   = '#f59e0b';
  let statusLabel      = statusRaw;

  if (isApproved) {
    statusBadgeBg    = 'rgba(16, 185, 129, 0.15)';
    statusBadgeColor = '#34d399';
    statusBadgeBorder= 'rgba(16, 185, 129, 0.35)';
    statusDotColor   = '#10b981';
  } else if (isPaid) {
    statusBadgeBg    = 'rgba(59, 130, 246, 0.15)';
    statusBadgeColor = '#60a5fa';
    statusBadgeBorder= 'rgba(59, 130, 246, 0.35)';
    statusDotColor   = '#3b82f6';
  }

  const lineItemsRows = (proforma.lineItems || [])
    .map(
      (li, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}">
        <td style="padding:14px 18px;font-size:13px;color:#1e293b;font-weight:500;border-bottom:1px solid #edf2f7;line-height:1.5;">${li.description || '—'}</td>
        <td style="padding:14px 18px;font-size:13px;color:#0f172a;font-weight:700;text-align:right;border-bottom:1px solid #edf2f7;white-space:nowrap;">${currency}${fmt(li.rate || 0)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Proforma Invoice ${proforma.invoiceNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px -5px rgba(15,23,42,0.08);border:1px solid #e2e8f0;">

        <!-- ── Top Brand Accent Bar ── -->
        <tr>
          <td style="height:4px;background:linear-gradient(90deg,#4f46e5 0%,#7c3aed 50%,#06b6d4 100%);"></td>
        </tr>

        <!-- ── Executive SaaS Header (No awkward wrap) ── -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 55%,#312e81 100%);padding:36px 36px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td valign="top" style="vertical-align:top;">
                  <div style="display:inline-block;background:rgba(99,102,241,0.22);border:1px solid rgba(129,140,248,0.35);padding:4px 10px;border-radius:6px;">
                    <span style="font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#c7d2fe;line-height:1;">PROFORMA INVOICE</span>
                  </div>
                  <h1 style="margin:10px 0 0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;white-space:nowrap;">${proforma.invoiceNumber}</h1>
                </td>
                <td align="right" valign="top" style="vertical-align:top;text-align:right;">
                  <p style="margin:0;font-size:15px;color:#ffffff;font-weight:700;letter-spacing:-0.2px;">${companyName}</p>
                  ${companyAddress ? `<p style="margin:5px 0 0;font-size:11px;color:#94a3b8;line-height:1.45;max-width:220px;display:inline-block;">${companyAddress}</p>` : ''}
                </td>
              </tr>
              <!-- Sub-header bar: Status & Total Highlight -->
              <tr>
                <td colspan="2" style="padding-top:22px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:10px 16px;">
                    <tr>
                      <td valign="middle" style="vertical-align:middle;">
                        <span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${statusBadgeBg};color:${statusBadgeColor};border:1px solid ${statusBadgeBorder};font-size:11px;font-weight:700;letter-spacing:0.3px;">
                          <span style="display:inline-block;width:6px;height:6px;background:${statusDotColor};border-radius:50%;margin-right:5px;vertical-align:middle;"></span>
                          ${statusLabel}
                        </span>
                      </td>
                      <td align="right" valign="middle" style="vertical-align:middle;text-align:right;">
                        <span style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-right:8px;">Quoted Total</span>
                        <span style="font-size:18px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">${currency}${fmt(total)}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Key Meta Strip ── -->
        <tr>
          <td style="padding:0 36px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:-1px;border-bottom:1px solid #edf2f7;background:#ffffff;">
              <tr>
                <td style="padding:18px 8px 18px 0;width:25%;border-right:1px solid #edf2f7;">
                  <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Invoice No</p>
                  <p style="margin:4px 0 0;font-size:13px;font-weight:800;color:#0f172a;white-space:nowrap;">${proforma.invoiceNumber}</p>
                </td>
                <td style="padding:18px 8px 18px 16px;width:25%;border-right:1px solid #edf2f7;">
                  <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Issue Date</p>
                  <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#334155;white-space:nowrap;">${proforma.createdDate || '—'}</p>
                </td>
                <td style="padding:18px 8px 18px 16px;width:25%;border-right:1px solid #edf2f7;">
                  <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Valid Until</p>
                  <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#e11d48;white-space:nowrap;">${proforma.dueDate || '—'}</p>
                </td>
                <td style="padding:18px 0 18px 16px;width:25%;">
                  <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Currency</p>
                  <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#334155;">INR (₹)</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Greeting ── -->
        <tr>
          <td style="padding:28px 36px 0;">
            <p style="margin:0;font-size:15px;color:#0f172a;font-weight:700;">Dear ${proforma.name || 'Valued Client'},</p>
            <p style="margin:8px 0 0;font-size:14px;color:#475569;line-height:1.6;">
              Please find below the preliminary proforma quotation details for <strong>${proforma.invoiceNumber}</strong>. You can review the full Proforma invoice, verify line items, or download a printable PDF using the button below:
            </p>
          </td>
        </tr>

        <!-- ── Bill To Card ── -->
        <tr>
          <td style="padding:22px 36px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;">
              <tr>
                <td>
                  <p style="margin:0 0 8px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;">Billed To</p>
                  <p style="margin:0;font-size:15px;font-weight:800;color:#0f172a;">${proforma.name || '—'}</p>
                  ${proforma.email   ? `<p style="margin:4px 0 0;font-size:13px;color:#475569;">${proforma.email}</p>` : ''}
                  ${proforma.phone   ? `<p style="margin:3px 0 0;font-size:13px;color:#475569;">${proforma.phone}</p>` : ''}
                  ${proforma.address ? `<p style="margin:3px 0 0;font-size:13px;color:#64748b;line-height:1.45;">${proforma.address}</p>` : ''}
                  ${proforma.gstin   ? `<p style="margin:8px 0 0;font-size:11px;font-family:Consolas,monospace;color:#4f46e5;font-weight:700;background:#eef2ff;display:inline-block;padding:2px 8px;border-radius:4px;border:1px solid #c7d2fe;">GSTIN: ${proforma.gstin}</p>` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Line Items Table ── -->
        <tr>
          <td style="padding:24px 36px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
              <thead>
                <tr style="background:#f8fafc;">
                  <th style="padding:12px 18px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:left;border-bottom:2px solid #e2e8f0;">Item / Description</th>
                  <th style="padding:12px 18px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:right;border-bottom:2px solid #e2e8f0;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${lineItemsRows || `<tr><td colspan="2" style="padding:18px;text-align:center;color:#94a3b8;font-size:13px;">No line items specified</td></tr>`}
              </tbody>
            </table>
          </td>
        </tr>

        <!-- ── Totals ── -->
        <tr>
          <td style="padding:16px 36px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#64748b;">Subtotal</td>
                <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:600;text-align:right;">${currency}${fmt(subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#64748b;">GST (18%)</td>
                <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:600;text-align:right;">${currency}${fmt(gstAmt)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding:4px 0;"><hr style="border:none;border-top:1px solid #e2e8f0;margin:8px 0;"/></td>
              </tr>
              <tr>
                <td style="font-size:15px;font-weight:800;color:#0f172a;">Total Amount</td>
                <td style="font-size:22px;font-weight:900;color:#4f46e5;text-align:right;">${currency}${fmt(total)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Bank & Wire Transfer Details ── -->
        <tr>
          <td style="padding:24px 36px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;">
              <tr>
                <td>
                  <p style="margin:0 0 10px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#475569;">
                    🏦 Bank &amp; Wire Transfer Details
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;">
                    <tr>
                      <td style="padding:3px 0;color:#64748b;width:120px;">Bank Name:</td>
                      <td style="padding:3px 0;color:#0f172a;font-weight:700;">${bankName}</td>
                    </tr>
                    <tr>
                      <td style="padding:3px 0;color:#64748b;">Account Name:</td>
                      <td style="padding:3px 0;color:#0f172a;font-weight:700;">${bankAccountName}</td>
                    </tr>
                    <tr>
                      <td style="padding:3px 0;color:#64748b;">Account Number:</td>
                      <td style="padding:3px 0;color:#0f172a;font-weight:800;font-family:Consolas,monospace;">${bankAccount}</td>
                    </tr>
                    <tr>
                      <td style="padding:3px 0;color:#64748b;">IFSC Code:</td>
                      <td style="padding:3px 0;color:#0f172a;font-weight:800;font-family:Consolas,monospace;">${bankIfsc}</td>
                    </tr>
                    ${bankBranch ? `
                    <tr>
                      <td style="padding:3px 0;color:#64748b;">Branch:</td>
                      <td style="padding:3px 0;color:#0f172a;font-weight:600;">${bankBranch}</td>
                    </tr>` : ''}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Subtle Professional Disclaimer (Replaced loud yellow alert) ── -->
        <tr>
          <td style="padding:20px 36px 0;">
            <div style="background:#f8fafc;border-left:3px solid #94a3b8;border-radius:0 8px 8px 0;padding:12px 16px;">
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">
                <strong style="color:#475569;">Notice:</strong> This is a proforma quotation issued for preliminary review and approval. It does not constitute a demand for payment until confirmed and converted into an official tax invoice.
              </p>
            </div>
          </td>
        </tr>

        <!-- ── Footer ── -->
        <tr>
          <td style="padding:28px 36px 36px;">
            <hr style="border:none;border-top:1px solid #edf2f7;margin:0 0 20px;"/>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td valign="top">
                  <p style="margin:0;font-size:13px;color:#0f172a;font-weight:700;">${companyName}</p>
                  ${companyAddress ? `<p style="margin:4px 0 0;font-size:11px;color:#94a3b8;line-height:1.4;">${companyAddress}</p>` : ''}
                  <p style="margin:6px 0 0;font-size:11px;color:#64748b;">
                    ${companyEmail ? `<span>Email: ${companyEmail}</span>` : ''}
                    ${companyPhone ? `<span style="margin-left:12px;">Phone: ${companyPhone}</span>` : ''}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding-top:16px;">
                  <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.5;">
                    This email was sent automatically by ${companyName} Invoice System. If you have any inquiries regarding this document, please contact us.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Plain-text fallback ──────────────────────────────────────────────────────
function buildProformaEmailText(proforma, company = {}) {
  const currency = '₹';
  const subtotal = (proforma.lineItems || []).reduce(
    (s, li) => s + (parseFloat(li.rate) || 0),
    0
  );
  const gstAmt = subtotal * 0.18;
  const total  = subtotal + gstAmt;
  const fmt = (n) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const companyName    = company.name    || process.env.COMPANY_NAME    || 'Futentia Solutions';
  const bankName        = company.bankName        || process.env.BANK_NAME         || 'ICICI Bank';
  const bankAccountName = company.accountName     || process.env.BANK_ACCOUNT_NAME || companyName;
  const bankAccount     = company.accountNumber   || process.env.BANK_ACCOUNT      || '000305027144';
  const bankIfsc        = company.ifscCode        || process.env.BANK_IFSC         || 'ICIC0000003';
  const bankBranch      = company.branchName      || process.env.BANK_BRANCH       || 'Main Branch';

  const backendUrl = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`).replace(/\/$/, '');
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const proformaId = proforma.id || proforma._id || proforma.invoiceNumber || '';
  const downloadUrl = proformaId ? `${backendUrl}/api/proformas/${proformaId}/download` : backendUrl;

  const lines = [
    `PROFORMA INVOICE — ${proforma.invoiceNumber}`,
    `======================================`,
    ``,
    `From: ${companyName}`,
    `To:   ${proforma.name || ''}`,
    proforma.email   ? `      ${proforma.email}`   : '',
    proforma.phone   ? `      ${proforma.phone}`   : '',
    proforma.address ? `      ${proforma.address}` : '',
    proforma.gstin   ? `      GSTIN: ${proforma.gstin}` : '',
    ``,
    `Invoice No : ${proforma.invoiceNumber}`,
    `Issue Date : ${proforma.createdDate || '—'}`,
    `Valid Until: ${proforma.dueDate || '—'}`,
    `Status     : ${proforma.status || 'Pending'}`,
    ``,
    `Download PDF Invoice: ${downloadUrl}`,
    `Review Online       : ${frontendUrl}/proforma-invoice/${proformaId}`,
    ``,
    `LINE ITEMS`,
    `----------`,
    ...(proforma.lineItems || []).map(
      (li, i) => `${i + 1}. ${li.description || '(no description)'}  —  ${currency}${fmt(li.rate || 0)}`
    ),
    ``,
    `Subtotal : ${currency}${fmt(subtotal)}`,
    `GST 18%  : ${currency}${fmt(gstAmt)}`,
    `TOTAL    : ${currency}${fmt(total)}`,
    ``,
    `BANK & PAYMENT DETAILS`,
    `----------------------`,
    `Bank Name     : ${bankName}`,
    `Account Name  : ${bankAccountName}`,
    `Account Number: ${bankAccount}`,
    `IFSC Code     : ${bankIfsc}`,
    `Branch        : ${bankBranch}`,
    ``,
    `Notice: This document is a proforma quotation for review and approval prior to final tax invoice issuance.`,
    `Note: A PDF copy of this invoice has also been attached to this email.`,
    ``,
    `— ${companyName}`,
  ].filter((l) => l !== null);

  return lines.join('\n');
}

// ─── Main send function ───────────────────────────────────────────────────────
/**
 * Sends a Proforma Invoice email to the client with an attached PDF.
 * @param {object} proforma   – Full proforma document
 * @param {object} [company]  – Optional sender company details
 * @returns {Promise<object>} – Nodemailer info object
 */
async function sendProformaEmail(proforma, company = {}) {
  if (!proforma.email) {
    throw new Error(`Proforma ${proforma.invoiceNumber} has no client email address.`);
  }

  const transporter = getTransporter();
  const fromName    = company.name || process.env.COMPANY_NAME || 'Futentia Solutions';
  const fromEmail   = process.env.SMTP_USER;
  const subject     = `Proforma Invoice ${proforma.invoiceNumber} from ${fromName}`;

  // ── Generate PDF Attachment ──────────────────────────────────────────────
  const { generateProformaPdfBuffer } = require('./pdfService');
  let attachments = [];
  try {
    const pdfBuffer = await generateProformaPdfBuffer(proforma, company);
    attachments.push({
      filename: `Proforma-Invoice-${proforma.invoiceNumber || 'doc'}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    });
    console.log(`📎 [EmailService] Generated PDF attachment (${pdfBuffer.length} bytes) for ${proforma.invoiceNumber}`);
  } catch (pdfErr) {
    console.warn('[EmailService] Could not generate PDF attachment:', pdfErr.message);
  }

  const mailOptions = {
    from    : `"${fromName}" <${fromEmail}>`,
    to      : proforma.email,
    subject,
    text    : buildProformaEmailText(proforma, company),
    html    : buildProformaEmailHtml(proforma, company),
    attachments,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ [EmailService] Proforma email sent with PDF attachment → ${proforma.email} | MsgID: ${info.messageId}`);
  return info;
}

module.exports = { sendProformaEmail };
