
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma, LineStatus } from "@prisma/client";

// Simple CSV Parser (handling quoted fields)
function parseCSV(text: string) {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;

        const row: string[] = [];
        let inQuotes = false;
        let currentValue = "";

        for (let char of line) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                row.push(currentValue.trim());
                currentValue = "";
            } else {
                currentValue += char;
            }
        }
        row.push(currentValue.trim());

        // Map to object based on headers
        const obj: any = {};
        headers.forEach((h, index) => {
            obj[h] = row[index]?.replace(/^"|"$/g, ""); // Strip surrounding quotes
        });
        data.push(obj);
    }
    return data;
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const { filename, csvContent } = await req.json();

        if (!csvContent || !filename) {
            return NextResponse.json({ error: "Missing filename or csvContent" }, { status: 400 });
        }

        const parsedRows = parseCSV(csvContent);

        if (parsedRows.length === 0) {
            return NextResponse.json({ error: "Empty or invalid CSV" }, { status: 400 });
        }

        // Validate Headers (Loose check)
        // Expected: Date, Description, Amount
        if (!parsedRows[0].date || !parsedRows[0].amount) {
            return NextResponse.json({ error: "Invalid CSV Format. Required headers: Date, Amount, Description, Reference(optional)" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Statement Header
            // @ts-ignore
            const statement = await tx.bankStatement.create({
                data: {
                    filename,
                    uploaded_by: session.user.id,
                    status: 'pending'
                }
            });

            // 2. Create Lines
            const linesData = parsedRows.map((row: any) => ({
                statement_id: statement.id,
                // Parse date (Assume YYYY-MM-DD or standard JS parseable)
                date: new Date(row.date),
                amount: new Prisma.Decimal(row.amount),
                description: row.description || "No Description",
                reference: row.reference || null,
                status: LineStatus.unmatched
            }));

            // @ts-ignore
            await tx.statementLine.createMany({
                data: linesData
            });

            return statement;
        });

        return NextResponse.json({ success: true, statementId: result.id, count: parsedRows.length });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
