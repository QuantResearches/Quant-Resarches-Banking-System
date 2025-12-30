
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@quant.local';
    console.log(`Checking user: ${email}`);

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log('User NOT FOUND in database.');
        } else {
            console.log('User found:', {
                id: user.id,
                email: user.email,
                role: user.role,
                is_active: user.is_active,
                password_hash_prefix: user.password_hash.substring(0, 10) + '...'
            });

            const validPassword = 'Admin123$%';
            const isMatch = await bcrypt.compare(validPassword, user.password_hash);
            console.log(`Password 'Admin123$%' match: ${isMatch}`);
        }
    } catch (err) {
        console.error("Database Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
