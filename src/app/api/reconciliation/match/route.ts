
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addDays, subDays } from "date-fns";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        // Fetch Unmatched Lines
        // @ts-ignore
        const lines = await prisma.statementLine.findMany({
            where: { status: 'unmatched' },
            take: 100 // Process in batches
        });

        let matchCount = 0;

        for (const line of lines) {
            // Find Candidate in GLEntry
            // Rule: Same Amount, Date +/- 1 Day
            // @ts-ignore
            const glEntry = await prisma.gLEntry.findFirst({
                where: {
                    amount: line.amount, // Exact match
                    reconciliation: null, // Not yet reconciled
                    posted_at: {
                        gte: subDays(new Date(line.date), 1),
                        lte: addDays(new Date(line.date), 1)
                    }
                }
            });

            if (glEntry) {
                // Determine GL Entry Type logic?
                // Statement Credit (+ money) = Bank Debit (Bank owes us)? No.
                // Statement Credit (+ money) = Ledger Debit (Asset Increase).
                // Statement Debit (- money) = Ledger Credit (Asset Decrease).
                // For now, assuming CSV amount is standard Signed number.

                // Perform Match
                await prisma.$transaction(async (tx) => {
                    // @ts-ignore
                    await tx.reconciliation.create({
                        data: {
                            statement_line_id: line.id,
                            gl_entry_id: glEntry.id,
                            match_method: 'auto',
                            matched_by: session.user.id
                        }
                    });

                    // @ts-ignore
                    await tx.statementLine.update({
                        where: { id: line.id },
                        data: { status: 'matched' }
                    });
                });
                matchCount++;
            }
        }

        return NextResponse.json({ success: true, matched: matchCount });

    } catch (error) {
        console.error("Auto-match error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
