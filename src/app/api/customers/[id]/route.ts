import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const customerUpdateSchema = z.object({
    full_name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits").optional(),
    address: z.string().min(5).optional(),
    status: z.enum(["active", "inactive"]).optional(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: { accounts: true }
        });

        if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json(customer);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "admin" && session.user.role !== "finance") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const body = await req.json();
        const data = customerUpdateSchema.parse(body);

        const oldCustomer = await prisma.customer.findUnique({ where: { id } });
        if (!oldCustomer) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const updatedCustomer = await prisma.customer.update({
            where: { id },
            data,
        });

        // Audit
        await prisma.auditLog.create({
            data: {
                user_id: session.user.id,
                action: "UPDATE_CUSTOMER",
                entity_type: "Customer",
                entity_id: id,
                old_value: oldCustomer as any,
                new_value: updatedCustomer as any,
                ip_address: req.headers.get("x-forwarded-for") || "unknown",
                user_agent: req.headers.get("user-agent"),
            },
        });

        return NextResponse.json(updatedCustomer);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
