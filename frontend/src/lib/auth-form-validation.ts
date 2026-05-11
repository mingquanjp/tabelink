const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string) {
  return emailPattern.test(value.trim());
}

export function isValidShortText(value: string) {
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= 255 && !/[\r\n]/.test(value);
}
