/**
 * ConnectGig — Distance Formatting Utility
 * Converts and formats distances to kilometers (km) for South Indian regional standards.
 */

export function formatDistance(value: number, fromUnit: 'mi' | 'km' = 'km'): string {
  const kmValue = fromUnit === 'mi' ? value * 1.60934 : value;
  
  // Return formatted string with 1 decimal place followed by km
  return `${kmValue.toFixed(1)} km`;
}
