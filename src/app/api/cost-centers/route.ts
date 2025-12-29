
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // @ts-ignore
    const costCenters = await prisma.costCenter.findMany({
        orderBy: { code: 'asc' }
    });

    return NextResponse.json({ costCenters });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { code, name, description } = body;

        if (!code || !name) {
            return NextResponse.json({ error: "Code and Name are required" }, { status: 400 });
        }

        // @ts-ignore
        const costCenter = await prisma.costCenter.create({
            data: { code, name, description }
        });

        return NextResponse.json(costCenter);

    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ error: "Code must be unique" }, { status: 400 });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
