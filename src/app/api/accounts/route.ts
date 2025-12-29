import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const accountCreateSchema = z.object({
    customer_id: z.string().uuid(),
    account_type: z.enum(["wallet", "prepaid", "internal"]),
});

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const accounts = await prisma.account.findMany({
            include: {
                customer: {
                    select: { full_name: true, email: true }
                },
                balance: true
            },
            orderBy: { created_at: "desc" }
        });
        return NextResponse.json(accounts);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "admin" && session.user.role !== "finance") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { customer_id, account_type } = accountCreateSchema.parse(body);

        // Verify customer exists and is active
        const customer = await prisma.customer.findUnique({ where: { id: customer_id } });
        if (!customer || customer.status !== "active") {
            return NextResponse.json({ error: "Invalid or inactive customer" }, { status: 400 });
        }

        // Create Account and Initial Balance (0)
        const account = await prisma.account.create({
            data: {
                customer_id,
                account_type,
                created_by: session.user.id,
                balance: {
                    create: {
                        balance: 0
                    }
                }
            },
            include: {
                balance: true
            }
        });

        // Audit
        await prisma.auditLog.create({
            data: {
                user_id: session.user.id,
                action: "CREATE_ACCOUNT",
                entity_type: "Account",
                entity_id: account.id,
                new_value: account as any,
                ip_address: req.headers.get("x-forwarded-for") || "unknown",
                user_agent: req.headers.get("user-agent"),
            },
        });

        return NextResponse.json(account, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
