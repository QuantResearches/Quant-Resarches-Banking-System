
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function checkIdempotency(req: Request) {
    const key = req.headers.get("Idempotency-Key");
    if (!key) return null; // No key, proceed normally

    // @ts-ignore
    const log = await prisma.idempotencyLog.findUnique({
        where: { key }
    });

    if (log) {
        // Return stored response
        return NextResponse.json(log.response, { status: log.status });
    }

    return null; // Not found, proceed
}

export async function saveIdempotency(req: Request, response: any, status: number) {
    const key = req.headers.get("Idempotency-Key");
    if (!key) return;

    try {
        // @ts-ignore
        await prisma.idempotencyLog.create({
            data: {
                key,
                path: req.url,
                method: req.method,
                status,
                response,
                created_at: new Date()
            }
        });
    } catch (e) {
        // Ignore duplicate key errors if race condition
        console.error("Idempotency Save Error", e);
    }
}
