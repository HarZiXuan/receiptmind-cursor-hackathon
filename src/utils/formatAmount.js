export const formatAmount = (num) => `RM ${Number(num || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}`;

