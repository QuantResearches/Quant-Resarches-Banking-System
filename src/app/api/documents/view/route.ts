import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFilePath } from "@/lib/storage";
import prisma from "@/lib/prisma";
import fs from "fs";

export const dynamic = 'force-dynamic';

// Handles: /api/documents/[id]/view
// id can be KYCDocument ID or Evidence ID
// For simplicity, we assume the ID passed IS the s3_key or we look it up.
// Actually, better to pass the Record ID, look it up to get the key, then stream.
// To keep it generic, let's assume we pass a 'docId' and a 'type'.
// Or just pass the 'key' (encoded) if we trust the user to have the key? NO.
// Best approach: /api/documents/view?id=DOC_UUID&type=KYC
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type"); // 'KYC' or 'EVIDENCE'

    if (!id || !type) return NextResponse.json({ error: "Missing params" }, { status: 400 });

    try {
        let key = "";
        let filename = "document";

        if (type === "KYC") {
            const doc = await prisma.kYCDocument.findUnique({ where: { id } });
            if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
            key = doc.s3_key;
            filename = `kyc-${id}`;
        } else if (type === "EVIDENCE") {
            const doc = await prisma.transactionEvidence.findUnique({ where: { id } });
            if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
            key = doc.file_path;
            filename = doc.filename;
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        // Audit Log Access
        await prisma.auditLog.create({
            data: {
                user_id: session.user.id,
                action: "VIEW_DOCUMENT",
                entity_type: type,
                entity_id: id,
            }
        });

        const filePath = await getFilePath(key);
        const fileBuffer = fs.readFileSync(filePath);

        // Return as Stream/Blob
        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": "application/pdf", // Or detect mime type
                "Content-Disposition": `inline; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error("View Document Error:", error);
        return NextResponse.json({ error: "Access Denied or Not Found" }, { status: 404 });
    }
}
