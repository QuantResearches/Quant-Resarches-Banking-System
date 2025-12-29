
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const reviewSchema = z.object({
    profile_id: z.string().uuid(),
    action: z.enum(["APPROVE", "REJECT"]),
    reason: z.string().optional()
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { profile_id, action, reason } = reviewSchema.parse(body);

        const newStatus = action === "APPROVE" ? "VERIFIED" : "REJECTED";

        // Update Profile
        // @ts-ignore
        const updatedProfile = await prisma.customerProfile.update({
            where: { id: profile_id },
            data: {
                kyc_status: newStatus,
                last_kyc_date: new Date(),
                // If Approved, maybe set next_rekyc_date = now + 1 year
                next_rekyc_date: action === "APPROVE" ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null
            }
        });

        // Also Mark Documents as Verified if Approved? 
        // Or keep them separate. Standard is granular verification.
        // For MVP, if Profile is Approved, we assume docs are verified by the Checker.
        if (action === "APPROVE") {
            // @ts-ignore
            await prisma.kYCDocument.updateMany({
                where: { profile_id },
                data: {
                    is_verified: true,
                    verified_at: new Date(),
                    verified_by: session.user.id
                }
            });
        }

        return NextResponse.json(updatedProfile);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
