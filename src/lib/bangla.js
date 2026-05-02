const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
const EN_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

export function toBn(value) {
  return String(value).replace(/[0-9]/g, d => BN_DIGITS[d])
}

export function toEn(value) {
  return String(value).replace(/[০-৯]/g, d => EN_DIGITS[BN_DIGITS.indexOf(d)])
}

export function formatNum(value, numerals, decimals = 1) {
  const fixed = Number(value).toFixed(decimals)
  return numerals === 'bangla' ? toBn(fixed) : fixed
}
