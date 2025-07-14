/**
 * Format a number as Nigerian Naira currency
 * @param amount - The amount in kobo (smallest unit) or naira
 * @param inKobo - Whether the amount is in kobo (true) or naira (false)
 * @returns Formatted currency string
 */
export function formatNaira(amount: number, inKobo: boolean = false): string {
    const nairaAmount = inKobo ? amount / 100 : amount;
    
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(nairaAmount);
}

/**
 * Convert naira to kobo
 * @param naira - Amount in naira
 * @returns Amount in kobo
 */
export function nairaToKobo(naira: number): number {
    return Math.round(naira * 100);
}

/**
 * Convert kobo to naira
 * @param kobo - Amount in kobo
 * @returns Amount in naira
 */
export function koboToNaira(kobo: number): number {
    return kobo / 100;
}

/**
 * Format a price with discount
 * @param originalPrice - Original price
 * @param discountPercentage - Discount percentage (0-100)
 * @param inKobo - Whether prices are in kobo
 * @returns Object with formatted original and discounted prices
 */
export function formatDiscountedPrice(
    originalPrice: number, 
    discountPercentage: number, 
    inKobo: boolean = false
) {
    const discountedPrice = originalPrice * (1 - discountPercentage / 100);
    
    return {
        original: formatNaira(originalPrice, inKobo),
        discounted: formatNaira(discountedPrice, inKobo),
        savings: formatNaira(originalPrice - discountedPrice, inKobo),
        discountPercentage
    };
}