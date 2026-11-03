export const GSTIN_LENGTH = 15;
export const GSTIN_ERROR = 'Enter a valid 15-character GSTIN (e.g. 22AAAAA0000A1Z5)';

// 2-digit state code, 5 letters, 4 digits, 1 letter, entity code, "Z", checksum
const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/** Uppercases and keeps only letters and digits, capped at 15 characters. */
export const sanitizeGstin = (value) =>
  String(value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, GSTIN_LENGTH);

export const isValidGstin = (value) => GSTIN_PATTERN.test(value || '');
