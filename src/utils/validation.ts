export function validateEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

export function validateBDPhoneNumber(phone: string): boolean {
  // Matches +8801XXXXXXXXX or 01XXXXXXXXX
  const re = /^(?:\+88)?01[3-9]\d{8}$/;
  return re.test(phone.replace(/[\s-]/g, ''));
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}
