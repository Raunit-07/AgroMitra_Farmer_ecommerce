/**
 * Normalizes email by trimming and converting to lowercase
 */
export const normalizeEmail = (email) => {
  return email.trim().toLowerCase();
};

/**
 * Strong email validation function as per requirements
 */
export const validateEmail = (email) => {
  const normalized = normalizeEmail(email);

  // Security block: Reject emails containing specific characters or script patterns
  if (/[<>;"']/g.test(normalized) || normalized.includes("--")) {
    return false;
  }

  // Robust regex for email validation
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return regex.test(normalized);
};
