
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { customer_id } = body;

        // If session is customer, force their own ID
        // If session is Admin, allow passing customer_id

        // MVP: Admin creates the profile shell
        if (session.user.role !== "admin" && session.user.role !== "finance") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Check if exists
        // @ts-ignore
        const existing = await prisma.customerProfile.findUnique({
            where: { customer_id }
        });

        if (existing) {
            return NextResponse.json({ error: "Profile already exists" }, { status: 409 });
        }

        // Create Profile
        // @ts-ignore
        const profile = await prisma.customerProfile.create({
            data: {
                customer_id,
                kyc_status: "DRAFT"
            }
        });

        return NextResponse.json(profile, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const customer_id = searchParams.get("customer_id");

    if (!customer_id) return NextResponse.json({ error: "Missing customer_id" }, { status: 400 });

    try {
        // @ts-ignore
        const profile = await prisma.customerProfile.findUnique({
            where: { customer_id },
            include: { documents: true, risk_profile: true }
        });

        return NextResponse.json(profile || { message: "No Profile Found" });
    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
