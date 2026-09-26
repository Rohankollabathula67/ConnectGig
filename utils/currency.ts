/**
 * ConnectGig — Indian Currency Formatter Utility (§5.0)
 * Formats numeric amounts into local Indian Rupee (INR) representation
 * using the standard Lakhs-grouping layout (e.g. ₹1,20,000).
 */

export function formatCurrency(amount: number): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Hermers/Platform fallback in case Intl.NumberFormat lacks localization databases
    const formattedVal = amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    return `₹${formattedVal}`;
  }
}
