
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    try {
        const email = 'admin@quant.local'
        const password = 'Admin123$%'

        console.log('1. START_DIAGNOSIS')
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            console.log('2. USER_NOT_FOUND')
            return
        }

        console.log('2. USER_FOUND')
        console.log(`3. STATUS_ACTIVE: ${user.is_active}`)
        console.log(`4. HASH: ${user.password_hash.substring(0, 15)}...`)

        const isValid = await bcrypt.compare(password, user.password_hash)
        console.log(`5. BCRYPT_COMPARE: ${isValid}`)

    } catch (e) {
        console.error('ERROR:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
