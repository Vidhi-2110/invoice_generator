export const formatCurrency = (value, currencySymbol = '₹') => {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0);

  return formatted.replace('INR', currencySymbol);
};
