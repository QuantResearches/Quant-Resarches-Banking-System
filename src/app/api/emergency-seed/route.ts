import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
    try {
        const email = 'admin@quant.local';
        const password = 'Admin123$%';
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password_hash: hashedPassword,
                role: 'admin',
                is_active: true
            },
            create: {
                email,
                password_hash: hashedPassword,
                role: 'admin',
                is_active: true
            }
        });

        return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
