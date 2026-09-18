export const generateNextNumber = (items, prefix = 'INV-') => {
  if (!items || items.length === 0) {
    return `${prefix}0001`;
  }

  const escapedPrefix = prefix.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`${escapedPrefix}(\\d+)`);

  const numbers = items.map((item) => {
    const numStr = item.invoiceNumber || item.proformaNumber || '';
    const match = String(numStr).match(regex);
    return match ? parseInt(match[1], 10) : 0;
  });

  const maxNumber = Math.max(...numbers, 0);
  const nextNumber = maxNumber + 1;

  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};
