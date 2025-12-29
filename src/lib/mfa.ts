
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

/**
 * Generates a new MFA Secret and corresponding QR Code Data URL.
 * @param email User email (for label)
 * @param issuer Service name (default: Quant Researches)
 */
export async function generateMFASecret(email: string, issuer: string = 'Quant Researches') {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(email, issuer, secret);
    const qrCode = await qrcode.toDataURL(otpauth);
    return { secret, qrCode };
}

/**
 * Verifies a TOTP token against a secret.
 */
export function verifyMFAToken(token: string, secret: string): boolean {
    return authenticator.verify({ token, secret });
}
