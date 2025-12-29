
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { readFile, stat } from "fs/promises";
import path from "path";
import { createReadStream } from "fs";

// @ts-ignore
import { Readable } from "stream";

export async function GET(req: Request, props: { params: Promise<{ key: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // In a real system, we would check if 'session.user' is allowed to access this SPECIFIC key
    // by querying Prisma.KYCDocument. 
    // For MVP Mock, we strictly allow only Admin/Finance or the Owner (if we checked DB).
    // Allowing Admin/Finance for now.

    const { key } = params;

    // 1. Sanitize Key
    const safeKey = path.basename(key);
    const filePath = path.join(process.cwd(), "uploads", safeKey);

    try {
        // 2. Database Lookup & Authorization
        // @ts-ignore
        const document = await prisma.kYCDocument.findFirst({
            where: { s3_key: safeKey },
            include: { profile: { include: { customer: true } } } as any
        });

        if (!document) {
            // Security: Don't leak file existence if not in DB
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        // 3. RBAC Policy
        const allowedRoles = ["admin", "finance"];
        const isAuthorized = allowedRoles.includes(session.user.role);

        if (!isAuthorized) {
            // Audit Denial
            await prisma.auditLog.create({
                data: {
                    user_id: session.user.id,
                    action: "VIEW_DOCUMENT_DENIED",
                    entity_type: "KYCDocument",
                    entity_id: document.id,
                    ip_address: req.headers.get("x-forwarded-for"),
                    // @ts-ignore
                    user_agent: req.headers.get("user-agent"),
                    old_value: { key: safeKey }
                }
            });
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 4. Audit Success
        await prisma.auditLog.create({
            data: {
                user_id: session.user.id,
                action: "VIEW_DOCUMENT",
                entity_type: "KYCDocument",
                entity_id: document.id,
                ip_address: req.headers.get("x-forwarded-for"),
                // @ts-ignore
                user_agent: req.headers.get("user-agent"),
                new_value: { filename: safeKey, type: document.type }
            }
        });

        // 5. Secure Retrieval
        await stat(filePath);
        const fileBuffer = await readFile(filePath);

        // Determine Content Type
        let contentType = "application/octet-stream";
        if (safeKey.endsWith(".pdf")) contentType = "application/pdf";
        if (safeKey.endsWith(".jpg") || safeKey.endsWith(".jpeg")) contentType = "image/jpeg";
        if (safeKey.endsWith(".png")) contentType = "image/png";

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "private, no-store, max-age=0",
                "X-Content-Type-Options": "nosniff"
            }
        });

    } catch (error) {
        console.error("Secure Access Error:", error);
        return NextResponse.json({ error: "System Error" }, { status: 500 });
    }
}
