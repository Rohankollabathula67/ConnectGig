import { format, formatDistance, formatRelative, isValid, parseISO } from 'date-fns';

// Currency formatting
export const formatCurrency = (
  amount: number,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback formatting
    return `${currency} ${amount.toFixed(2)}`;
  }
};

// Format Indian Rupees specifically
export const formatINR = (amount: number): string => {
  return formatCurrency(amount, 'INR', 'en-IN');
};

// Format USD
export const formatUSD = (amount: number): string => {
  return formatCurrency(amount, 'USD', 'en-US');
};

// Phone number formatting
export const formatPhoneNumber = (
  phone: string,
  countryCode: string = '+91'
): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 10) {
    return `${countryCode} ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
  } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    return `+${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 7)} ${cleanPhone.slice(7)}`;
  }
  
  return phone; // Return as-is if format is unrecognized
};

// Date formatting
export const formatDate = (
  date: Date | string | number,
  formatString: string = 'PPP'
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    
    if (!isValid(dateObj)) {
      return 'Invalid Date';
    }
    
    return format(dateObj, formatString);
  } catch {
    return 'Invalid Date';
  }
};

// Format date relative to now
export const formatRelativeTime = (
  date: Date | string | number
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    
    if (!isValid(dateObj)) {
      return 'Invalid Date';
    }
    
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch {
    return 'Invalid Date';
  }
};

// Format date relative to today
export const formatRelativeDate = (
  date: Date | string | number
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    
    if (!isValid(dateObj)) {
      return 'Invalid Date';
    }
    
    return formatRelative(dateObj, new Date());
  } catch {
    return 'Invalid Date';
  }
};

// Text formatting
export const truncateText = (
  text: string,
  maxLength: number = 100,
  suffix: string = '...'
): string => {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix;
};

export const capitalizeFirst = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text: string): string => {
  if (!text) return text;
  return text
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Number formatting
export const formatNumber = (
  num: number,
  locale: string = 'en-IN',
  options?: Intl.NumberFormatOptions
): string => {
  try {
    return new Intl.NumberFormat(locale, options).format(num);
  } catch {
    return num.toString();
  }
};

export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Time formatting
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

export const formatTime = (
  date: Date | string | number,
  formatString: string = 'HH:mm'
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    
    if (!isValid(dateObj)) {
      return 'Invalid Time';
    }
    
    return format(dateObj, formatString);
  } catch {
    return 'Invalid Time';
  }
};

// Address formatting
export const formatAddress = (address: {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}): string => {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(Boolean);
  
  return parts.join(', ');
};

// Rating formatting
export const formatRating = (rating: number, maxRating: number = 5): string => {
  return `${rating.toFixed(1)}/${maxRating}`;
};

// Status formatting
export const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

// Price range formatting
export const formatPriceRange = (min: number, max: number, currency: string = 'INR'): string => {
  if (min === max) {
    return formatCurrency(min, currency);
  }
  
  return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`;
};
