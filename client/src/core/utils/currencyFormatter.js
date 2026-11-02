export const formatCurrency = (value, currencySymbol = '₹') => {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  const formattedNumber = num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${currencySymbol}${formattedNumber}`;
};
