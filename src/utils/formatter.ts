export function formatCurrency(amount: number, symbol: string = '৳'): string {
  // Format numbers in Indian/Bangladeshi styling (e.g. 1,00,000) or standard
  const formatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  return `${symbol}${formatter.format(amount)}`;
}

export function formatDate(dateString: string, locale: 'en' | 'bn' = 'bn'): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  if (locale === 'bn') {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('bn-BD', options);
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
