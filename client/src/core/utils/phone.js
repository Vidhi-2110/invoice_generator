export const PHONE_LENGTH = 10;
export const PHONE_ERROR = 'Enter a valid 10-digit phone number (numbers only)';

/**
 * Keeps digits only, capped at 10. Older records may hold "+91 98765 43210"
 * or "098765 43210"; a leading country/trunk prefix is dropped so they fit.
 */
export const sanitizePhone = (value) => {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length > PHONE_LENGTH && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length > PHONE_LENGTH && digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, PHONE_LENGTH);
};

export const isValidPhone = (value) => /^\d{10}$/.test(value || '');
