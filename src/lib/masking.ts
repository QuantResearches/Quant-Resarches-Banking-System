
/**
 * Bank-Grade Data Masking Utilities
 * Used to protect PII in UI and Logs.
 */

export function maskPAN(pan: string | null | undefined): string {
    if (!pan) return "N/A";
    if (pan.length < 4) return "****";
    return `XXXX-XXXX-${pan.slice(-4)}`;
}

export function maskEmail(email: string | null | undefined): string {
    if (!email) return "";
    const [local, domain] = email.split("@");
    if (!domain) return "****";
    const maskedLocal = local.length > 2 ? `${local.slice(0, 2)}***` : `${local}***`;
    return `${maskedLocal}@${domain}`;
}

export function maskPhone(phone: string | null | undefined): string {
    if (!phone) return "";
    return `******${phone.slice(-4)}`;
}

export function maskPassport(passport: string | null | undefined): string {
    if (!passport) return "";
    return `*****${passport.slice(-2)}`;
}
