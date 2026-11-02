/**
 * Line item maths. Records saved before quantities existed have no `qty`,
 * so they count as 1 and keep their original totals.
 */
export const getLineQty = (line) => {
  const qty = parseFloat(line.qty);
  return qty > 0 ? qty : 1;
};

export const getLineAmount = (line) => getLineQty(line) * (parseFloat(line.rate) || 0);

export const getLinesSubtotal = (lines) =>
  (lines || []).reduce((sum, line) => sum + getLineAmount(line), 0);
