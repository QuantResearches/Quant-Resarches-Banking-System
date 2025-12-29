
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const { name, start_date, end_date } = await req.json();

        // @ts-ignore
        const period = await prisma.fiscalPeriod.create({
            data: {
                name,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                status: 'open'
            }
        });

        return NextResponse.json({ success: true, period });

    } catch (error) {
        console.error("Create Period error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
