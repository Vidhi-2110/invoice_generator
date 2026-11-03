const EMAIL_FORMAT_ERROR = 'Please enter a valid email address.';
const EMAIL_TEMP_ERROR = 'Temporary or disposable email addresses are not allowed. Please use a permanent email.';

// Well-known disposable / temporary mail providers. This is a blocklist, so it
// cannot be exhaustive; keep it in sync with client/src/core/utils/email.js.
const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '20minutemail.com', '1secmail.com', '1secmail.net',
  '1secmail.org', 'anonbox.net', 'burnermail.io', 'byom.de', 'cuvox.de', 'dayrep.com', 'discard.email',
  'dispostable.com', 'dropmail.me', 'emailfake.com', 'email-fake.com', 'emailondeck.com', 'emltmp.com',
  'esiix.com', 'fakeinbox.com', 'fakemail.net', 'generator.email', 'getnada.com', 'grr.la', 'guerrillamail.biz',
  'guerrillamail.com', 'guerrillamail.de', 'guerrillamail.info', 'guerrillamail.net', 'guerrillamail.org',
  'guerrillamailblock.com', 'harakirimail.com', 'inboxkitten.com', 'jetable.org', 'laafd.com', 'luxusmail.org',
  'mail.tm', 'mailcatch.com', 'maildrop.cc', 'mailforspam.com', 'mailinator.com', 'mailnesia.com', 'mailpoof.com',
  'mailsac.com', 'mailtemp.net', 'mintemail.com', 'moakt.com', 'mohmal.com', 'mvrht.com', 'mytemp.email',
  'nada.email', 'pokemail.net', 'sharklasers.com', 'spam4.me', 'spambox.us', 'spamex.com', 'spamgourmet.com',
  'temp-mail.io', 'temp-mail.org', 'tempail.com', 'tempinbox.com', 'tempmail.com', 'tempmail.net', 'tempmailer.com',
  'tempmailo.com', 'temporary-mail.net', 'tempr.email', 'throwawaymail.com', 'tmail.ws', 'tmpmail.net',
  'tmpmail.org', 'trashmail.com', 'trashmail.de', 'trashmail.net', 'trbvm.com', 'txcct.com', 'vjuum.com',
  'wwjmp.com', 'xojxe.com', 'yoggm.com', 'yopmail.com', 'yopmail.fr', 'yopmail.net',
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

/** True when the domain, or any parent domain (e.g. foo.mailinator.com), is blocklisted. */
const isDisposableEmail = (email) => {
  const domain = String(email ?? '').trim().toLowerCase().split('@')[1];
  if (!domain) return false;
  const parts = domain.split('.');
  return parts.some((_, i) => DISPOSABLE_DOMAINS.has(parts.slice(i).join('.')));
};

/** Returns an error message, or '' when the email is acceptable. Empty input is not an error here. */
const getEmailError = (email) => {
  const value = String(email ?? '').trim();
  if (!value) return '';
  if (!EMAIL_PATTERN.test(value)) return EMAIL_FORMAT_ERROR;
  if (isDisposableEmail(value)) return EMAIL_TEMP_ERROR;
  return '';
};

module.exports = { isDisposableEmail, getEmailError };
