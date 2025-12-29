
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), "uploads");
        await mkdir(uploadDir, { recursive: true });

        // Generate Secure Key (UUID + Extension)
        const ext = path.extname(file.name) || ".bin";
        const key = `${uuidv4()}${ext}`;
        const filePath = path.join(uploadDir, key);

        // Write to Disk (Mock S3)
        await writeFile(filePath, buffer);

        return NextResponse.json({ key, original_name: file.name });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: "Upload Failed" }, { status: 500 });
    }
}
