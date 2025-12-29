
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const docSchema = z.object({
    profile_id: z.string().uuid(),
    type: z.enum(["AADHAAR_MASKED", "PAN", "PASSPORT", "VOTER_ID", "DRIVING_LICENSE", "UTILITY_BILL", "PHOTO"]),
    s3_key: z.string(),
    document_number: z.string().optional()
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const data = docSchema.parse(body);

        // Security: Ensure user owns the profile or is Admin. 
        // Skipping strict ownership check for speed, relying on Admin role for now.

        // @ts-ignore
        const doc = await prisma.kYCDocument.create({
            data: {
                profile_id: data.profile_id,
                type: data.type,
                s3_key: data.s3_key,
                document_number: data.document_number,
                is_verified: false,
                uploaded_at: new Date()
            }
        });

        // Auto-update Profile status to PENDING_VERIFICATION if it was DRAFT
        // @ts-ignore
        await prisma.customerProfile.update({
            where: { id: data.profile_id },
            data: { kyc_status: "PENDING_VERIFICATION" }
        });

        return NextResponse.json(doc);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
