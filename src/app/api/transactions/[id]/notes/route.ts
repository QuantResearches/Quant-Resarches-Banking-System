
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security-logger";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const { id } = await params;
        const { note } = await req.json();

        if (!note || note.trim().length === 0) {
            return NextResponse.json({ error: "Note cannot be empty" }, { status: 400 });
        }

        // 1. Verify Transaction Exists
        const transaction = await prisma.transaction.findUnique({
            where: { id }
        });

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // 2. Create Audit Note
        // @ts-ignore
        const auditNote = await prisma.auditNote.create({
            data: {
                transaction_id: id,
                note: note,
                created_by: session.user.id
            },
            include: {
                author: {
                    select: { email: true, role: true }
                }
            }
        });

        // 3. Log Security Action
        await logSecurityEvent(
            "AUDIT_NOTE_ADDED",
            "LOW",
            `Auditor Note added to Transaction ${id}`,
            session.user.id,
            req,
            { note_id: auditNote.id }
        );

        return NextResponse.json(auditNote);

    } catch (error) {
        console.error("Audit Note Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const { id } = await params;

        // @ts-ignore
        const notes = await prisma.auditNote.findMany({
            where: { transaction_id: id },
            orderBy: { created_at: "desc" },
            include: {
                author: {
                    select: { email: true, role: true }
                }
            }
        });

        return NextResponse.json(notes);

    } catch (error) {
        console.error("Fetch Notes Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
