
import prisma from './src/lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
    const email = 'admin@quant.local';
    console.log(`Checking user: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.log('User NOT FOUND in database.');
        return;
    }

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

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
