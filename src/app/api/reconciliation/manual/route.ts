
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
        const { lineId, entryId } = await req.json();

        if (!lineId || !entryId) return NextResponse.json({ error: "Missing IDs" }, { status: 400 });

        const result = await prisma.$transaction(async (tx) => {
            // 1. Verify existence
            const line = await tx.statementLine.findUnique({ where: { id: lineId } });
            const entry = await tx.gLEntry.findUnique({ where: { id: entryId } });

            if (!line || !entry) throw new Error("Line or Entry not found");
            if (line.status === "matched") throw new Error("Line already matched");

            // 2. Create Match
            const reconciliation = await tx.reconciliation.create({
                data: {
                    statement_line_id: lineId,
                    gl_entry_id: entryId,
                    matched_by: session.user.id,
                    match_method: "manual"
                }
            });

            // 3. Update Line Status
            await tx.statementLine.update({
                where: { id: lineId },
                data: { status: "matched" }
            });

            return reconciliation;
        });

        return NextResponse.json(result);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
