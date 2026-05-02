const unitsWords = [
    "нуль",
    "один",
    "два",
    "три",
    "чотири",
    "п'ять",
    "шість",
    "сім",
    "вісім",
    "дев'ять",
];
const teensWords = [
    "одинадцять",
    "дванадцять",
    "тринадцять",
    "чотирнадцять",
    "п'ятнадцять",
    "шістнадцять",
    "сімнадцять",
    "вісімнадцять",
    "дев'ятнадцять",
];
const tensWords = [
    "",
    "десять",
    "двадцять",
    "тридцять",
    "сорок",
    "п'ятдесят",
    "шістдесят",
    "сімдесят",
    "вісімдесят",
    "дев'яносто",
];
const hundredsWords = [
    "",
    "сто",
    "двісті",
    "триста",
    "чотириста",
    "п'ятсот",
    "шістсот",
    "сімсот",
    "вісімсот",
    "дев'ятсот",
];

function convertToWords(num: number): string {
    if (num === 0) return "нуль";

    const parts: string[] = [];

    const millions = Math.floor(num / 1000000);
    if (millions > 0) {
        parts.push(convertGroup(millions));
        parts.push(getMillionForm(millions));
    }

    const thousands = Math.floor((num % 1000000) / 1000);
    if (thousands > 0) {
        parts.push(convertGroup(thousands, true));
        parts.push(getThousandForm(thousands));
    }

    const units = num % 1000;
    if (units > 0) {
        const lastDigit = num % 10;
        const lastTwoDigits = num % 100;
        const useFeminine =
            (lastDigit === 1 || lastDigit === 2) && !(lastTwoDigits >= 11 && lastTwoDigits <= 19);
        parts.push(convertGroup(units, useFeminine));
    }

    return parts.join(" ");
}

function convertGroup(num: number, feminine: boolean = false): string {
    const parts: string[] = [];

    const hundreds = Math.floor(num / 100);
    if (hundreds > 0) {
        parts.push(hundredsWords[hundreds]);
    }

    const remainder = num % 100;
    if (remainder > 0) {
        parts.push(convertTens(remainder, feminine));
    }

    return parts.join(" ");
}

function convertTens(num: number, feminine: boolean): string {
    if (num < 10) {
        return getUnitWord(num, feminine);
    }

    if (num >= 11 && num <= 19) {
        return teensWords[num - 11];
    }

    const tens = Math.floor(num / 10);
    const units = num % 10;

    if (units === 0) {
        return tensWords[tens];
    }

    return `${tensWords[tens]} ${getUnitWord(units, feminine)}`;
}

function getUnitWord(num: number, feminine: boolean): string {
    if (feminine && num === 1) return "одна";
    if (feminine && num === 2) return "дві";
    return unitsWords[num];
}

function getThousandForm(num: number): string {
    const lastTwo = num % 100;
    const lastOne = num % 10;

    if (lastTwo >= 11 && lastTwo <= 19) return "тисяч";
    if (lastOne === 1) return "тисяча";
    if (lastOne >= 2 && lastOne <= 4) return "тисячі";
    return "тисяч";
}

function getMillionForm(num: number): string {
    const lastTwo = num % 100;
    const lastOne = num % 10;

    if (lastTwo >= 11 && lastTwo <= 19) return "мільйонів";
    if (lastOne === 1) return "мільйон";
    if (lastOne >= 2 && lastOne <= 4) return "мільйони";
    return "мільйонів";
}

function getCurrencyForm(num: number, form1: string, form2: string, form3: string): string {
    const lastTwo = num % 100;
    const lastOne = num % 10;

    if (lastTwo >= 11 && lastTwo <= 19) return form3;
    if (lastOne === 1) return form1;
    if (lastOne >= 2 && lastOne <= 4) return form2;
    return form3;
}

/**
 * Convert number to Ukrainian words for money format
 * @throws Error if number is negative
 */
export function formatNumber(num: number): string {
    if (num < 0) throw new Error("Number must be non-negative");

    const hryvnia = Math.floor(num);
    const kopiyky = Math.round((num - hryvnia) * 100);

    const hryvniaText = convertToWords(hryvnia);
    const hryvniaCurrency = getCurrencyForm(hryvnia, "гривня", "гривні", "гривень");

    const kopiykyText = kopiyky.toString().padStart(2, "0");

    return `${hryvniaText} ${hryvniaCurrency}, ${kopiykyText} копійок`;
}
