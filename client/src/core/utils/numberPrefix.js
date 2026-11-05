// Document ID prefixes chosen by the user in Company Settings (e.g. "INV-", "FS/26-27/")
export const DEFAULT_INVOICE_PREFIX = 'FS/26-27/';
export const DEFAULT_PROFORMA_PREFIX = 'FSPI-';

// 1–20 chars: letters, digits and - / _ .  (must start with a letter or digit)
const PREFIX_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\-/_.]{0,19}$/;

export const sanitizeNumberPrefix = (value) =>
  String(value || '').replace(/[^A-Za-z0-9\-/_.]/g, '').slice(0, 20);

// Empty is allowed (falls back to the default)
export const isValidNumberPrefix = (value) => !value || PREFIX_PATTERN.test(value);

export const NUMBER_PREFIX_ERROR = 'ID prefix can use letters, numbers and - / _ . only (max 20 characters, start with a letter or number).';

export const formatNumberPreview = (prefix, fallback, seq = 1) =>
  `${prefix || fallback}${String(seq).padStart(4, '0')}`;
