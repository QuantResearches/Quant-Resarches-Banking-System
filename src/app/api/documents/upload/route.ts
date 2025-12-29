import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string; // 'KYC', 'EVIDENCE'
        const entityId = formData.get("entityId") as string; // Profile ID or Transaction ID

        if (!file || !type || !entityId) {
            return NextResponse.json({ error: "Missing file or metadata" }, { status: 400 });
        }

        const { key, size } = await uploadFile(file, type.toLowerCase());

        if (type === "KYC") {
            // Create KYC Document Record
            await prisma.kYCDocument.create({
                data: {
                    profile_id: entityId,
                    type: "AADHAAR_MASKED", // Default for now, or match upload type
                    s3_key: key,
                    is_verified: false
                }
            });
        } else if (type === "EVIDENCE") {
            await prisma.transactionEvidence.create({
                data: {
                    transaction_id: entityId,
                    filename: file.name,
                    file_path: key,
                    content_type: file.type,
                    file_size: size,
                    uploaded_by: session.user.id
                }
            });
        }

        return NextResponse.json({ success: true, key });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
