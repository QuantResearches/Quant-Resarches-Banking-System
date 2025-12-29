
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Safety Check: Don't run if Admin exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: "admin@quant.local" }
        });

        if (existingAdmin) {
            return NextResponse.json({ message: "System already initialized. Admin exists." }, { status: 400 });
        }

        // 2. Create Default Admin
        const hashedPassword = await bcrypt.hash("Admin123$%", 10);
        const admin = await prisma.user.create({
            data: {
                email: "admin@quant.local",
                password_hash: hashedPassword,
                role: "admin",
                is_active: true,
            }
        });

        // 3. Seed GL Accounts
        const glAccounts = [
            { code: '1000', name: 'Cash Vault', type: 'asset', is_system: true },
            { code: '2000', name: 'Customer Deposits (Liabilities)', type: 'liability', is_system: true },
            { code: '3000', name: 'Transaction Fees', type: 'income', is_system: true },
            { code: '4000', name: 'Operating Expenses', type: 'expense', is_system: true },
            { code: '1001', name: 'Suspense Account', type: 'asset', is_system: true },
        ];

        for (const acc of glAccounts) {
            await prisma.gLAccount.upsert({
                where: { code: acc.code },
                update: {},
                create: {
                    code: acc.code,
                    name: acc.name,
                    type: acc.type as any,
                    is_system: acc.is_system
                }
            });
        }

        return NextResponse.json({
            message: "Setup Complete! System Initialized.",
            credentials: {
                email: "admin@quant.local",
                password: "Admin123$%"
            },
            next_step: "Go to /login"
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
