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

    // Seed Loan Products
    const loanProducts = [
        {
            name: "Personal Loan",
            description: "Unsecured personal loan for any purpose",
            min_amount: 50000,
            max_amount: 1500000,
            min_tenure_months: 12,
            max_tenure_months: 60,
            interest_rate_min: 10.5,
            interest_rate_max: 16.0,
            interest_type: "REDUCING_BALANCE" as const
        },
        {
            name: "Home Loan",
            description: "Secured loan for purchasing or constructing a home",
            min_amount: 500000,
            max_amount: 10000000,
            min_tenure_months: 60,
            max_tenure_months: 360,
            interest_rate_min: 8.50,
            interest_rate_max: 10.50,
            interest_type: "REDUCING_BALANCE" as const
        }
    ]

    for (const p of loanProducts) {
        // @ts-ignore
        await prisma.loanProduct.upsert({
            where: { name: p.name },
            update: {},
            create: {
                ...p,
                // @ts-ignore
                interest_type: p.interest_type,
                active: true
            }
        })
    }
    console.log('Loan Products Seeded')
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
