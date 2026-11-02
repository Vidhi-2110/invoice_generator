/**
 * Line item maths. Records saved before quantities existed have no `qty`,
 * so they count as 1 and keep their original totals.
 */
const getLineQty = (line) => {
  const qty = parseFloat(line.qty);
  return qty > 0 ? qty : 1;
};

const getLineAmount = (line) => getLineQty(line) * (parseFloat(line.rate) || 0);

const getLinesSubtotal = (lines) => (lines || []).reduce((sum, line) => sum + getLineAmount(line), 0);

module.exports = { getLineQty, getLineAmount, getLinesSubtotal };
