import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "documents");

// Ensure root exists
if (!fs.existsSync(STORAGE_ROOT)) {
    fs.mkdirSync(STORAGE_ROOT, { recursive: true });
}

export async function uploadFile(file: File, folder: string = "general"): Promise<{ key: string, size: number, type: string }> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name);
    const key = `${folder}/${randomUUID()}${ext}`;
    const fullPath = path.join(STORAGE_ROOT, key);

    // Ensure folder exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.writeFile(fullPath, buffer);

    return {
        key,
        size: file.size,
        type: file.type
    };
}

export async function getFileStream(key: string) {
    const fullPath = path.join(STORAGE_ROOT, key);
    if (!fs.existsSync(fullPath)) {
        throw new Error("File not found");
    }
    return fs.createReadStream(fullPath);
}

export async function getFilePath(key: string) {
    const fullPath = path.join(STORAGE_ROOT, key);
    if (!fs.existsSync(fullPath)) {
        throw new Error("File not found");
    }
    return fullPath;
}
