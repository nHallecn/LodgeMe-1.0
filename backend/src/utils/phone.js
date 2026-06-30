function normalizeCameroonPhone(input) {
  if (!input) {
    const error = new Error("Phone number is required");
    error.statusCode = 400;
    error.code = "PHONE_REQUIRED";
    throw error;
  }

  const raw = String(input).trim();
  const digits = raw.replace(/\D/g, "");

  if (digits.length === 9 && /^[62]\d{8}$/.test(digits)) {
    return `+237${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("237") && /^[62]\d{8}$/.test(digits.slice(3))) {
    return `+${digits}`;
  }

  const error = new Error("Use a valid Cameroon phone number, for example +237671234567");
  error.statusCode = 400;
  error.code = "INVALID_PHONE";
  error.field = "phone";
  throw error;
}

function maskPhone(phone) {
  const normalized = normalizeCameroonPhone(phone);
  return `${normalized.slice(0, 6)} XX XXX ${normalized.slice(-3)}`;
}

module.exports = { normalizeCameroonPhone, maskPhone };
