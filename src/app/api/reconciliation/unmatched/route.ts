
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        // 1. Fetch Unmatched Statement Lines
        const lines = await prisma.statementLine.findMany({
            where: { status: "unmatched" },
            orderBy: { date: 'asc' },
            take: 100
        });

        // 2. Fetch Unreconciled GL Entries
        const entries = await prisma.gLEntry.findMany({
            where: { reconciliation: null },
            include: { gl_account: true, transaction: true },
            orderBy: { posted_at: 'asc' },
            take: 100
        });

        return NextResponse.json({ lines, entries });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
