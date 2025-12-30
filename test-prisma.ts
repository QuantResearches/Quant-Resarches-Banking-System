
import prisma from "./src/lib/prisma";

async function main() {
    console.log("Checking Prisma Models...");
    const keys = Object.keys(prisma);

    // Check for specific models
    const hasCustomerProfile = "customerProfile" in prisma;
    const hasKYCDocument = "kYCDocument" in prisma;
    const hasKYCRiskProfile = "kYCRiskProfile" in prisma;

    console.log("Has customerProfile:", hasCustomerProfile);
    console.log("Has kYCDocument:", hasKYCDocument);
    console.log("Has kYCRiskProfile:", hasKYCRiskProfile);

    // List all keys that look like models (starting with lowercase, not $ or _)
    const models = keys.filter(k => !k.startsWith('$') && !k.startsWith('_'));
    console.log("Available Models:", models);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
