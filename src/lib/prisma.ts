import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient().$extends({
        query: {
            $allModels: {
                async delete({ model, args, query }: any) {
                    const ALLOWED_MODELS = ['Session', 'IdempotencyLog', 'FailedLoginAttempt'];
                    if (!ALLOWED_MODELS.includes(model)) {
                        throw new Error(`[CRITICAL] DATABASE IMMUTABILITY VIOLATION: Deleting records from table '${model}' is strictly forbidden by policy.`);
                    }
                    return query(args);
                },
                async deleteMany({ model, args, query }: any) {
                    const ALLOWED_MODELS = ['Session', 'IdempotencyLog', 'FailedLoginAttempt'];
                    if (!ALLOWED_MODELS.includes(model)) {
                        throw new Error(`[CRITICAL] DATABASE IMMUTABILITY VIOLATION: Deleting records from table '${model}' is strictly forbidden by policy.`);
                    }
                    return query(args);
                }
            }
        }
    })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
