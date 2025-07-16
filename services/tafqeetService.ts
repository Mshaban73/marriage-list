const ones: string[] = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const teens: string[] = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const tens: string[] = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const hundreds: string[] = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

/**
 * Converts a number from 1 to 999 into its Arabic word representation.
 * @param {number} num The number to convert (1-999).
 * @returns {string} The Arabic text.
 */
function convert999(num: number): string {
    if (num === 0) return '';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
        const one = num % 10;
        const ten = Math.floor(num / 10);
        return (one > 0 ? ones[one] + ' و' : '') + tens[ten];
    }
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return hundreds[hundred] + (remainder > 0 ? ' و' + convert999(remainder) : '');
}

/**
 * Converts a number into a full Arabic textual representation (Tafqeet) for currency.
 * @param {number} amount The numeric amount.
 * @returns {string} The full Tafqeet string.
 */
export const tafqeet = (amount: number): string => {
    if (typeof amount !== 'number' || !isFinite(amount) || amount < 0) {
        return '...';
    }
    if (amount === 0) {
        return 'فقط صفر جنيهًا مصريًا لا غير';
    }

    const num = Math.floor(amount);
    if (num > 999999999) {
        return 'المبلغ كبير جدًا للتحويل';
    }

    if (num === 1) return 'فقط جنيه مصري واحد لا غير';
    if (num === 2) return 'فقط جنيهان مصريان لا غير';

    let parts: string[] = [];

    const millions = Math.floor(num / 1000000);
    if (millions > 0) {
        if (millions === 1) parts.push('مليون');
        else if (millions === 2) parts.push('مليونان');
        else if (millions >= 3 && millions <= 10) parts.push(convert999(millions) + ' ملايين');
        else parts.push(convert999(millions) + ' مليون');
    }

    const thousands = Math.floor((num % 1000000) / 1000);
    if (thousands > 0) {
        if (thousands === 1) parts.push('ألف');
        else if (thousands === 2) parts.push('ألفان');
        else if (thousands >= 3 && thousands <= 10) parts.push(convert999(thousands) + ' آلاف');
        else parts.push(convert999(thousands) + ' ألف');
    }

    const remainder = num % 1000;
    if (remainder > 0) {
        parts.push(convert999(remainder));
    }
    
    const text = parts.join(' و');

    let currency: string;
    const lastTwoDigits = num % 100;

    if (lastTwoDigits >= 3 && lastTwoDigits <= 10) {
        currency = 'جنيهات مصرية';
    } else {
        currency = 'جنيهًا مصريًا';
    }
    
    return `فقط ${text} ${currency} لا غير`;
};