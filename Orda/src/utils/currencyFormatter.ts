// src/utils/currencyFormatter.ts

/**
 * Formats a number as Nigerian Naira currency (₦).
 * Uses the Intl.NumberFormat API for robust and localized formatting.
 *
 * @param amount The number to format (e.g., 1250.75, 500).
 * @param locale The locale to use for formatting (defaults to 'en-NG' for English, Nigeria).
 * @param options Optional Intl.NumberFormatOptions to customize formatting.
 * @returns A string representing the formatted currency (e.g., "₦1,250.75").
 */
export const formatNaira = (
    amount: number,
    locale: string = 'en-NG', // Specifies English language in Nigeria
    options?: Intl.NumberFormatOptions
): string => {
    // Ensure the amount is a valid number
    if (typeof amount !== 'number' || isNaN(amount)) {
        console.warn(`formatNaira received invalid amount: ${amount}`);
        return '₦0.00'; // Or some other default/error indicator
    }

    return new Intl.NumberFormat(locale, {
        style: 'currency',          // Format as currency
        currency: 'NGN',            // The ISO 4217 currency code for Nigerian Naira
        currencyDisplay: 'symbol',  // Use the currency symbol (₦)
        minimumFractionDigits: 2,   // Ensure two decimal places (kobo)
        maximumFractionDigits: 2,   // Do not show more than two decimal places
        ...options,                 // Allow overriding default options
    }).format(amount);
};

// Example Usage:
// console.log(formatNaira(2500));         // Output: ₦2,500.00
// console.log(formatNaira(150.75));       // Output: ₦150.75
// console.log(formatNaira(0));            // Output: ₦0.00
// console.log(formatNaira(99999.999));    // Output: ₦100,000.00 (rounds up)