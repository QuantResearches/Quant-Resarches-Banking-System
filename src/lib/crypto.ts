import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

// For production, this MUST come from environment variables
const ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY
    ? Buffer.from(process.env.DATA_ENCRYPTION_KEY, 'hex')
    : Buffer.from("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", 'hex'); // 32 bytes fallback

const ALGORITHM = "aes-256-gcm";

export function encrypt(text: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Format: IV:AuthTag:EncryptedData
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decrypt(text: string): string {
    const parts = text.split(":");
    if (parts.length !== 3) throw new Error("Invalid encrypted text format");

    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encryptedText = parts[2];

    const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}
