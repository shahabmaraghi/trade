export default function normalizePhonenumber(phonenumber: string): string {
    // Remove all non-digit characters
    const digitsOnly = phonenumber.replace(/\D/g, '');

    let normalized: string;

    if (digitsOnly.startsWith('989')) { // +989 or 989
        normalized = `+${digitsOnly}`;
    } else if (digitsOnly.startsWith('09')) { // 09
        normalized = `+98${digitsOnly.substring(1)}`;
    } else if (digitsOnly.startsWith('9') && digitsOnly.length === 10) { // 9
        normalized = `+98${digitsOnly}`;
    } else if (digitsOnly.startsWith('0098')) { // 0098
        normalized = `+${digitsOnly.substring(2)}`;
    } else {
        throw new Error(`Invalid phone number format: ${phonenumber}`);
    }

    // Final validation
    if (!/^\+989\d{9}$/.test(normalized)) {
        throw new Error(`Invalid phone number: ${normalized}`);
    }

    return normalized;
}