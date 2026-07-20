// src/utils/fmtMoney.js
export function fmtMoney(amount, currency = "UGX") {
  const n = Number(amount);
  if (Number.isNaN(n)) return `— ${currency}`;
  const decimals = currency === "AED" ? 2 : 0;
  return `${n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} ${currency}`;
}

export default fmtMoney;
