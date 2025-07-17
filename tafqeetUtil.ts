const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

function convertLessThanOneThousand(n: number): string {
    if (n === 0) return '';
    let result = '';

    if (n >= 100) {
        result += hundreds[Math.floor(n / 100)];
        n %= 100;
        if (n > 0) result += ' و';
    }

    if (n >= 20) {
        const one = n % 10;
        if (one > 0) {
            result += ones[one] + ' و';
        }
        result += tens[Math.floor(n / 10)];
    } else if (n >= 10) {
        if (n === 10) return result + 'عشرة';
        if (n === 11) return result + 'أحد عشر';
        if (n === 12) return result + 'اثنا عشر';
        return result + ones[n % 10] + ' عشر';
    } else if (n > 0) {
        result += ones[n];
    }

    return result.trim().replace(/و\s*$/, '');
}

export function tafqeet(num: number): string {
    if (num === 0) return 'فقط لا غير';

    const getCurrency = (n: number) => {
        const remainder100 = n % 100;
        if (n === 1) return 'جنيه مصري';
        if (n === 2) return 'جنيهان مصريان';
        if (remainder100 >= 3 && remainder100 <= 10) return 'جنيهات مصرية';
        return 'جنيهًا مصريًا';
    };

    if (num === 1) return 'فقط جنيه مصري واحد لا غير';
    if (num === 2) return 'فقط جنيهان مصريان لا غير';
    
    let words = [];
    const billions = Math.floor(num / 1000000000);
    const millions = Math.floor((num % 1000000000) / 1000000);
    const thousands = Math.floor((num % 1000000) / 1000);
    const remainder = num % 1000;

    if (billions > 0) {
        let text;
        if (billions === 1) text = 'مليار';
        else if (billions === 2) text = 'ملياران';
        else if (billions >= 3 && billions <= 10) text = convertLessThanOneThousand(billions) + ' مليارات';
        else text = convertLessThanOneThousand(billions) + ' مليار';
        words.push(text);
    }

    if (millions > 0) {
        let text;
        if (millions === 1) text = 'مليون';
        else if (millions === 2) text = 'مليونان';
        else if (millions >= 3 && millions <= 10) text = convertLessThanOneThousand(millions) + ' ملايين';
        else text = convertLessThanOneThousand(millions) + ' مليون';
        words.push(text);
    }
    
    if (thousands > 0) {
        let text;
        if (thousands === 1) text = 'ألف';
        else if (thousands === 2) text = 'ألفان';
        else if (thousands >= 3 && thousands <= 10) text = convertLessThanOneThousand(thousands) + ' آلاف';
        else text = convertLessThanOneThousand(thousands) + ' ألف';
        words.push(text);
    }

    if (remainder > 0) {
        words.push(convertLessThanOneThousand(remainder));
    }
    
    const currency = getCurrency(num);
    const numberAsText = words.join(' و');

    return `فقط ${numberAsText} ${currency} لا غير`;
}