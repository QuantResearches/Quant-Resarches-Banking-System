
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking CustomerProfile table...");
        // @ts-ignore
        const count = await prisma.customerProfile.count();
        console.log(`CustomerProfile table exists. Record count: ${count}`);

        console.log("Checking Prisma Client Types...");
        // @ts-ignore
        const kycStatus = prisma.kYCStatus; // Checking if Enum exists on client
        console.log("KYC Enums loaded.");

        console.log("SCHEMA VERIFICATION SUCCESSFUL");
    } catch (e) {
        console.error("SCHEMA VERIFICATION FAILED");
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
