
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        env: {
            node_env: process.env.NODE_ENV,
            has_db_url: !!process.env.DATABASE_URL,
            has_auth_secret: !!process.env.NEXTAUTH_SECRET
        }
    });
}
