export const formatNumber = (number: number, decimals = 0) => {
  return new Intl.NumberFormat('fi-FI', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(number);
};
