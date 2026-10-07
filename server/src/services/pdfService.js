const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

/**
 * Converts a number into Indian currency words matching the client app format.
 * E.g. 2360 => "Rupees Two Thousand Three Hundred Sixty Only"
 */
function numberToWords(num) {
  if (!num || num === 0) return 'Rupees Zero Only';

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    let str = '';
    if (n > 99) {
      str += a[Math.floor(n / 100)] + 'Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += a[n];
    }
    return str;
  };

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let word = '';
  let n = integerPart;

  if (n > 9999999) {
    word += inWords(Math.floor(n / 10000000)) + 'Crore ';
    n %= 10000000;
  }
  if (n > 99999) {
    word += inWords(Math.floor(n / 100000)) + 'Lakh ';
    n %= 100000;
  }
  if (n > 999) {
    word += inWords(Math.floor(n / 1000)) + 'Thousand ';
    n %= 1000;
  }
  if (n > 0) {
    word += inWords(n);
  }

  let finalWord = 'Rupees ' + word.trim();
  if (decimalPart > 0) {
    finalWord += ' and ' + inWords(decimalPart).trim() + ' Paise';
  }
  return finalWord + ' Only';
}

/**
 * Formats a number with Indian commas and 2 decimal places.
 */
function fmtCurr(n) {
  return Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats date into DD/MM/YYYY matching DocumentPreview.
 */
function formatNumericDate(dateStr) {
  if (!dateStr) {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Registers fonts that support Unicode Indian Rupee symbol (₹).
 */
function setupFonts(doc) {
  const fontCandidates = [
    { reg: 'C:/Windows/Fonts/segoeui.ttf', bold: 'C:/Windows/Fonts/segoeuib.ttf' },
    { reg: 'C:/Windows/Fonts/calibri.ttf', bold: 'C:/Windows/Fonts/calibrib.ttf' },
    { reg: 'C:/Windows/Fonts/arial.ttf', bold: 'C:/Windows/Fonts/arialbd.ttf' },
  ];

  for (const c of fontCandidates) {
    if (fs.existsSync(c.reg) && fs.existsSync(c.bold)) {
      doc.registerFont('AppFont', c.reg);
      doc.registerFont('AppFont-Bold', c.bold);
      return { regular: 'AppFont', bold: 'AppFont-Bold', hasRupee: true };
    }
  }

  return { regular: 'Helvetica', bold: 'Helvetica-Bold', hasRupee: false };
}

/**
 * Helper to resolve an image source from either a base64 string, custom path, or bundled asset.
 */
function resolveImageSource(customVal, defaultFilename) {
  if (customVal && typeof customVal === 'string') {
    if (customVal.startsWith('data:image')) {
      const parts = customVal.split(',');
      if (parts[1]) {
        try {
          return Buffer.from(parts[1], 'base64');
        } catch (_) {}
      }
    } else if (fs.existsSync(customVal)) {
      return customVal;
    }
  }
  if (defaultFilename) {
    const defaultPath = path.join(__dirname, '../assets', defaultFilename);
    if (fs.existsSync(defaultPath)) {
      return defaultPath;
    }
  }
  return null;
}

/**
 * Generates an A4 PDF buffer for a Proforma Invoice matching the client DocumentPreview layout.
 * @param {object} proforma – The proforma document
 * @param {object} company  – Company details
 * @returns {Promise<Buffer>}
 */
function generateProformaPdfBuffer(proforma, company = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 0,
        bufferPages: true,
        info: {
          Title: `Proforma Invoice ${proforma.invoiceNumber || ''}`,
          Author: company.name || process.env.COMPANY_NAME || 'Futentia Solutions',
          Subject: `Proforma Invoice ${proforma.invoiceNumber || ''}`,
        },
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const fonts = setupFonts(doc);
      const fontRegular = fonts.regular;
      const fontBold = fonts.bold;
      const currSym = fonts.hasRupee ? '₹' : 'Rs. ';

      // Page & Container Dimensions (A4: 595.28 x 841.89)
      const pageWidth = 595.28;
      const pageHeight = 841.89;

      const cardMarginX = 24;
      const cardMarginY = 20;
      const cardW = pageWidth - cardMarginX * 2; // 547.28
      const cardH = pageHeight - cardMarginY * 2; // 801.89
      const cardRadius = 12;

      const padX = 28;
      const contentX = cardMarginX + padX; // 52
      const contentW = cardW - padX * 2; // 491.28
      const rightX = contentX + contentW; // 543.28

      // Palette matching Futentia brand from DocumentPreview
      const brandColor = '#3783c6'; // Brand primary blue
      const textDark = '#0f172a'; // Slate-900
      const textMedium = '#334155'; // Slate-700
      const textMuted = '#64748b'; // Slate-500
      const borderColor = '#e2e8f0'; // Slate-200
      const tableStripeBg = '#f8fafc'; // Slate-50

      // Financials
      const lineItems = proforma.lineItems && proforma.lineItems.length > 0
        ? proforma.lineItems
        : [{ description: proforma.description || 'Website', rate: proforma.rate || 0 }];

      const subtotal = lineItems.reduce((s, li) => s + (parseFloat(li.rate) || 0), 0);
      const taxRate = 0.18;
      const gstAmt = subtotal * taxRate;
      const adjustment = parseFloat(proforma.adjustment) || 0;
      const total = subtotal + gstAmt + adjustment;

      // Default company data matching screenshot
      const companyName = company.name || process.env.COMPANY_NAME || 'Futentia Solutions';
      const companyTagline = company.tagline || 'Driven by Intelligence';
      const companyEmail = company.email || 'info@futentia.com';
      const companyPhone = company.phone || '+91 8866778903';
      const companyGstin = company.gstin || '24AAGCF9740H1ZI';
      const companyAddress = company.address || '03, Pratham Meadows, Nr. Navarachana Int. School, Bhayli, Vadodara, Gujarat - 391410.';

      const bankName = company.bankName || 'ICICI Bank';
      const bankAccountName = company.accountName || companyName;
      const bankAccount = company.accountNumber || '000305027144';
      const bankIfsc = company.ifscCode || 'ICIC0000003';
      const bankBranch = company.branchName || 'Main Branch';

      // ── Outer Document Container ──
      doc.save();
      doc.roundedRect(cardMarginX, cardMarginY, cardW, cardH, cardRadius).fill('#ffffff');
      doc.restore();

      // ── Top Brand Accent Bar ──
      doc.save();
      doc.roundedRect(cardMarginX, cardMarginY, cardW, cardH, cardRadius).clip();
      doc.rect(cardMarginX, cardMarginY, cardW, 8).fill(brandColor);
      doc.restore();

      // ── Bottom Brand Banner ──
      const bottomBarH = 26;
      doc.save();
      doc.roundedRect(cardMarginX, cardMarginY, cardW, cardH, cardRadius).clip();
      doc.rect(cardMarginX, cardMarginY + cardH - bottomBarH, cardW, bottomBarH).fill(brandColor);
      doc.restore();

      doc.font(fontBold).fontSize(8.5).fillColor('#ffffff').text(
        'DRIVEN BY INTELLIGENCE',
        cardMarginX,
        cardMarginY + cardH - bottomBarH + 8,
        { width: cardW, align: 'center' }
      );

      // ── Outer Card Border ──
      doc.roundedRect(cardMarginX, cardMarginY, cardW, cardH, cardRadius).lineWidth(1).stroke(borderColor);

      // ── Header Left: Logo + Company Info ──
      let leftY = cardMarginY + 24;

      const logoSource = resolveImageSource(company.logo, 'futentia_icon.png') || resolveImageSource(null, 'logo.png');
      if (logoSource) {
        try {
          doc.image(logoSource, contentX, leftY, { width: 40, height: 40 });
          leftY += 46;
        } catch (err) {
          console.warn('[PdfService] Could not render logo image:', err.message);
          leftY += 10;
        }
      } else {
        doc.font(fontBold).fontSize(14).fillColor(brandColor).text(companyName, contentX, leftY);
        leftY += 20;
      }

      // Company Name
      doc.font(fontBold).fontSize(11).fillColor(textDark).text(companyName, contentX, leftY);
      leftY += 15;

      // Tagline
      doc.font(fontRegular).fontSize(8.5).fillColor(brandColor).text(companyTagline, contentX, leftY);
      leftY += 13;

      // Contact details
      if (companyEmail) {
        doc.font(fontBold).fontSize(8).fillColor(textDark).text('Email: ', contentX, leftY, { continued: true });
        doc.font(fontRegular).fillColor(textMedium).text(companyEmail);
        leftY += 12;
      }
      if (companyPhone) {
        doc.font(fontBold).fontSize(8).fillColor(textDark).text('Phone: ', contentX, leftY, { continued: true });
        doc.font(fontRegular).fillColor(textMedium).text(companyPhone);
        leftY += 12;
      }
      if (companyGstin) {
        doc.font(fontBold).fontSize(8).fillColor(textDark).text('GSTIN: ', contentX, leftY, { continued: true });
        doc.font(fontRegular).fillColor(textMedium).text(companyGstin);
        leftY += 12;
      }
      if (companyAddress) {
        doc.font(fontRegular).fontSize(7.5).fillColor(textMuted).text(companyAddress, contentX, leftY, {
          width: 230,
          lineGap: 1.5,
        });
        leftY += doc.heightOfString(companyAddress, { width: 230, lineGap: 1.5 }) + 4;
      }

      // ── Header Right: Document Title + Meta ──
      let rightY = cardMarginY + 24;

      // Title: "PROFORMA INVOICE"
      doc.font(fontBold).fontSize(22);
      const titleText = 'PROFORMA INVOICE';
      const titleW = doc.widthOfString(titleText);
      const titleX = rightX - titleW;

      doc.fillColor(brandColor).text(titleText, titleX, rightY);
      rightY += 27;

      // Blue underline matching text width exactly
      doc.strokeColor(brandColor).lineWidth(2).moveTo(titleX, rightY).lineTo(rightX, rightY).stroke();
      rightY += 12;

      // PF Invoice No. (mixed bold label + regular value without overlap)
      const invNum = proforma.invoiceNumber || 'FSPI-0001';
      const invLbl = 'PF Invoice No.: ';
      doc.font(fontBold).fontSize(8.5);
      const invLblW = doc.widthOfString(invLbl);
      doc.font(fontRegular).fontSize(8.5);
      const invValW = doc.widthOfString(invNum);
      const invStartX = rightX - (invLblW + invValW);

      doc.font(fontBold).fontSize(8.5).fillColor(textDark).text(invLbl, invStartX, rightY, { continued: true });
      doc.font(fontRegular).fillColor(textDark).text(invNum);
      rightY += 14;

      // Invoice Date (mixed bold label + regular value without overlap)
      const invDate = formatNumericDate(proforma.createdDate);
      const dateLbl = 'Invoice Date: ';
      doc.font(fontBold).fontSize(8.5);
      const dateLblW = doc.widthOfString(dateLbl);
      doc.font(fontRegular).fontSize(8.5);
      const dateValW = doc.widthOfString(invDate);
      const dateStartX = rightX - (dateLblW + dateValW);

      doc.font(fontBold).fontSize(8.5).fillColor(textDark).text(dateLbl, dateStartX, rightY, { continued: true });
      doc.font(fontRegular).fillColor(textDark).text(invDate);
      rightY += 16;

      // ── Divider 1 ──
      let curY = Math.max(leftY, rightY) + 12;
      doc.strokeColor(borderColor).lineWidth(1).moveTo(contentX, curY).lineTo(rightX, curY).stroke();
      curY += 16;

      // ── BILL TO Section ──
      doc.font(fontBold).fontSize(9.5).fillColor(brandColor).text('BILL TO', contentX, curY);
      curY += 14;

      const billColW = (contentW - 20) / 2;
      const billLeftX = contentX;
      const billRightX = contentX + billColW + 20;
      let billLeftY = curY;
      let billRightY = curY;

      // Left column: Client Name, Phone, GSTIN
      doc.font(fontBold).fontSize(10.5).fillColor(textDark).text(proforma.name || 'Valued Client', billLeftX, billLeftY);
      billLeftY += 14;

      if (proforma.phone) {
        doc.font(fontBold).fontSize(8).fillColor(textDark).text('Phone: ', billLeftX, billLeftY, { continued: true });
        doc.font(fontRegular).fillColor(textMedium).text(proforma.phone);
        billLeftY += 12;
      }
      if (proforma.gstin) {
        doc.font(fontBold).fontSize(8).fillColor(textDark).text('GSTIN: ', billLeftX, billLeftY, { continued: true });
        doc.font(fontRegular).fillColor(textMedium).text(proforma.gstin);
        billLeftY += 12;
      }

      // Right column: Address, Email
      if (proforma.address) {
        doc.font(fontRegular).fontSize(8.5).fillColor(textMedium).text(proforma.address, billRightX, billRightY, {
          width: billColW,
          lineGap: 1.5,
        });
        billRightY += doc.heightOfString(proforma.address, { width: billColW, lineGap: 1.5 }) + 4;
      }
      if (proforma.email) {
        doc.font(fontBold).fontSize(8).fillColor(textDark).text('Email: ', billRightX, billRightY, { continued: true });
        doc.font(fontRegular).fillColor(textMedium).text(proforma.email);
        billRightY += 12;
      }

      curY = Math.max(billLeftY, billRightY) + 16;

      // ── Divider 2 ──
      doc.strokeColor(borderColor).lineWidth(1).moveTo(contentX, curY).lineTo(rightX, curY).stroke();
      curY += 16;

      // ── Line Items Table ──
      const colSrW = 55;
      const colRateW = 95;
      const colAmtW = 100;
      const colDescW = contentW - (colSrW + colRateW + colAmtW);

      const colSrX = contentX;
      const colDescX = colSrX + colSrW;
      const colRateX = colDescX + colDescW;
      const colAmtX = colRateX + colRateW;

      // Table Header Text
      doc.font(fontBold).fontSize(8.5).fillColor(brandColor);
      doc.text('SR. NO.', colSrX, curY);
      doc.text('DESCRIPTION', colDescX, curY);
      doc.text('RATE', colRateX, curY, { width: colRateW, align: 'right' });
      doc.text('AMOUNT', colAmtX, curY, { width: colAmtW, align: 'right' });
      curY += 14;

      // Header bottom border
      doc.strokeColor(borderColor).lineWidth(1).moveTo(contentX, curY).lineTo(rightX, curY).stroke();
      curY += 1;

      // Table Rows
      lineItems.forEach((li, idx) => {
        const rowH = 26;
        if (idx % 2 === 0) {
          doc.rect(contentX, curY, contentW, rowH).fill(tableStripeBg);
        }

        const textY = curY + 7;
        doc.font(fontRegular).fontSize(8.5).fillColor(textMuted).text(`${idx + 1}.`, colSrX, textY);
        doc.font(fontRegular).fontSize(8.5).fillColor(textDark).text(li.description || '—', colDescX, textY, {
          width: colDescW - 10,
        });
        doc.font(fontRegular).fontSize(8.5).fillColor(textMedium).text(
          `${currSym}${fmtCurr(li.rate)}`,
          colRateX,
          textY,
          { width: colRateW, align: 'right' }
        );
        doc.font(fontBold).fontSize(8.5).fillColor(textDark).text(
          `${currSym}${fmtCurr(li.rate)}`,
          colAmtX,
          textY,
          { width: colAmtW, align: 'right' }
        );

        curY += rowH;
        doc.strokeColor('#f1f5f9').lineWidth(0.5).moveTo(contentX, curY).lineTo(rightX, curY).stroke();
      });
      curY += 10;

      // ── Divider 3 ──
      doc.strokeColor(borderColor).lineWidth(1).moveTo(contentX, curY).lineTo(rightX, curY).stroke();
      curY += 16;

      // ── Summary & Totals ──
      const totalsBlockY = curY;

      // Left: In Words
      doc.font(fontBold).fontSize(8.5).fillColor(textDark).text('In Words: ', contentX, totalsBlockY, { continued: true });
      doc.font(fontRegular).fillColor(textDark).text(numberToWords(total), {
        width: contentW * 0.52,
        lineGap: 1.5,
      });

      // Right: Calculation Summary
      const rightBlockW = 190;
      const rightBlockX = rightX - rightBlockW;
      let totY = totalsBlockY;

      const renderTotalRow = (label, valStr) => {
        doc.font(fontBold).fontSize(8.5).fillColor(brandColor).text(label, rightBlockX, totY);
        doc.font(fontBold).fontSize(8.5).fillColor(textDark).text(valStr, rightBlockX, totY, {
          width: rightBlockW,
          align: 'right',
        });
        totY += 15;
      };

      renderTotalRow('Subtotal', `${currSym}${fmtCurr(subtotal)}`);
      renderTotalRow('CGST(9%)', `${currSym}${fmtCurr(gstAmt / 2)}`);
      renderTotalRow('SGST(9%)', `${currSym}${fmtCurr(gstAmt / 2)}`);

      // Adjustments row without background highlight (clean plain text matching subtotal/tax)
      renderTotalRow('Adjustments', `${currSym}${fmtCurr(adjustment)}`);

      // Total Line
      totY += 4;
      doc.font(fontBold).fontSize(11).fillColor(textDark).text('Total', rightBlockX, totY + 3);
      doc.font(fontBold).fontSize(18).fillColor(brandColor).text(`${currSym}${fmtCurr(total)}`, rightBlockX, totY - 3, {
        width: rightBlockW,
        align: 'right',
      });
      totY += 28;

      // ── Footer Anchor (positioned gracefully in lower area of card) ──
      const footerY = Math.max(totY + 24, cardMarginY + cardH - bottomBarH - 125);

      // ── Divider 4 above footer ──
      doc.strokeColor(borderColor).lineWidth(1).moveTo(contentX, footerY - 16).lineTo(rightX, footerY - 16).stroke();

      // Left: BANK DETAILS
      doc.font(fontBold).fontSize(8.5).fillColor(brandColor).text('BANK DETAILS', contentX, footerY);
      let bankY = footerY + 13;

      const renderBankItem = (label, val) => {
        if (!val) return;
        doc.font(fontBold).fontSize(7.5).fillColor(textDark).text(`${label}: `, contentX, bankY, { continued: true });
        doc.font(fontRegular).fillColor(textMedium).text(val);
        bankY += 12;
      };

      renderBankItem('Account Name', bankAccountName);
      renderBankItem('Bank Name', bankName);
      renderBankItem('Account Number', bankAccount);
      renderBankItem('IFSC Code', bankIfsc);
      renderBankItem('Branch', bankBranch);

      // Right: AUTHORIZED SIGNATORY + Stamp + Signature
      const signW = 190;
      const signX = rightX - signW;
      let signY = footerY;

      doc.font(fontBold).fontSize(8.5).fillColor(brandColor).text('AUTHORIZED SIGNATORY', signX, signY, {
        width: signW,
        align: 'right',
      });
      signY += 13;

      doc.font(fontRegular).fontSize(8).fillColor(textMedium).text(`For ${companyName}`, signX, signY, {
        width: signW,
        align: 'right',
      });
      signY += 12;

      // ── Stamp & Signature Visuals ──
      const stampSource = resolveImageSource(company.stamp, 'Futentia Stamp.png');
      const sigSource = resolveImageSource(company.signature || company.esign, 'Jay Signature 1.png');

      if (stampSource) {
        try {
          doc.image(stampSource, rightX - 118, signY - 8, { width: 48, height: 48 });
        } catch (err) {
          console.warn('[PdfService] Could not render stamp image:', err.message);
        }
      }

      if (sigSource) {
        try {
          doc.image(sigSource, rightX - 78, signY + 2, { width: 68, height: 34 });
        } catch (err) {
          console.warn('[PdfService] Could not render signature image:', err.message);
        }
      }

      signY += 40;

      // Signature underline
      const signLineW = 110;
      doc.strokeColor('#bfdbfe').lineWidth(1).moveTo(rightX - signLineW, signY).lineTo(rightX, signY).stroke();
      signY += 5;

      doc.font(fontRegular).fontSize(7).fillColor(textMuted).text('Authorized Signature', signX, signY, {
        width: signW,
        align: 'right',
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateProformaPdfBuffer,
  numberToWords,
};
