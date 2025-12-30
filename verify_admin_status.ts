
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Checking for Admin User...");
    const user = await prisma.user.findUnique({
        where: { email: 'admin@quant.local' }
    });

    if (user) {
        console.log("✅ Admin User FOUND");
        console.log(`ID: ${user.id}`);
        console.log(`Role: ${user.role}`);
        console.log(`Active: ${user.is_active}`);
        console.log(`Password Hash Length: ${user.password_hash?.length}`);
    } else {
        console.error("❌ Admin User NOT FOUND");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
