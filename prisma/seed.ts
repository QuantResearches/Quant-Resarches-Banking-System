import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@quant.local'
    const password = process.env.ADMIN_PASSWORD || 'Admin123$%' // Fallback or env

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create Admin User
    const admin = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password_hash: hashedPassword,
            role: 'admin',
            is_active: true,
        },
    })

    console.log({ admin })

    // Seed/Ensure GL Chart of Accounts
    const glAccounts = [
        { code: '1000', name: 'Cash Vault', type: 'asset', is_system: true },
        { code: '2000', name: 'Customer Deposits (Liabilities)', type: 'liability', is_system: true },
        { code: '3000', name: 'Transaction Fees', type: 'income', is_system: true },
        { code: '4000', name: 'Operating Expenses', type: 'expense', is_system: true },
        { code: '1001', name: 'Suspense Account', type: 'asset', is_system: true },
    ]

    for (const acc of glAccounts) {
        // @ts-ignore
        await prisma.gLAccount.upsert({
            where: { code: acc.code },
            update: {},
            create: {
                code: acc.code,
                name: acc.name,
                type: acc.type as any, // 'asset' etc.
                is_system: acc.is_system
            }
        })
    }
    console.log('GL Accounts Seeded')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
