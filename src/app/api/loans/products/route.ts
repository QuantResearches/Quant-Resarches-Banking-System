import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
// @ts-ignore
import { InterestType } from "@prisma/client";

const productSchema = z.object({
    name: z.string().min(3),
    description: z.string().optional(),
    min_amount: z.number().positive(),
    max_amount: z.number().positive(),
    min_tenure_months: z.number().int().positive(),
    max_tenure_months: z.number().int().positive(),
    interest_rate_min: z.number().min(0),
    interest_rate_max: z.number().min(0),
    interest_type: z.enum(["FLAT_RATE", "REDUCING_BALANCE"]),
});

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // @ts-ignore
        const products = await prisma.loanProduct.findMany({
            where: { active: true },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const data = productSchema.parse(body);

        if (data.min_amount > data.max_amount) {
            return NextResponse.json({ error: "Min amount cannot be greater than Max amount" }, { status: 400 });
        }
        if (data.min_tenure_months > data.max_tenure_months) {
            return NextResponse.json({ error: "Min tenure cannot be greater than Max tenure" }, { status: 400 });
        }
        if (data.interest_rate_min > data.interest_rate_max) {
            return NextResponse.json({ error: "Min interest cannot be greater than Max interest" }, { status: 400 });
        }

        // @ts-ignore
        const product = await prisma.loanProduct.create({
            data: {
                ...data,
                created_at: new Date(), // Explicitly set for consistnecy
            }
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        // @ts-ignore
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Loan Product with this name already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
