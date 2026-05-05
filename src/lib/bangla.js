const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']

export function toBn(value) {
  return String(value).replace(/[0-9]/g, d => BN_DIGITS[d])
}

export function toEn(value) {
  return String(value)
}

export function formatNum(value, decimals = 1, numerals = 'bangla') {
  const fixed = Number(value).toFixed(decimals)
  return numerals === 'western' ? fixed : toBn(fixed)
}
