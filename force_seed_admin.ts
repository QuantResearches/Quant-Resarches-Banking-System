
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@quant.local';
    console.log(`Seeding/Resetting user: ${email}`);

    const hashedPassword = await bcrypt.hash('Admin123$%', 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password_hash: hashedPassword,
            is_active: true,
            role: 'admin'
        },
        create: {
            email,
            password_hash: hashedPassword,
            role: 'admin',
            is_active: true
        }
    });

    console.log('User upserted successfully:', user.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
