export const calculateSubtotal = (rate) => {
  return parseFloat(rate) || 0;
};

export const calculateTax = (subtotal, taxRate = 0.18) => {
  return subtotal * taxRate;
};

export const calculateGrandTotal = (subtotal, tax) => {
  return subtotal + tax;
};
