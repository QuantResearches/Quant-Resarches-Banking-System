import { Role } from "@prisma/client"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: Role
            mfa_enabled?: boolean
            is_mfa_verified?: boolean
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        role: Role
        sessionId?: string
        mfa_enabled?: boolean;
        is_mfa_verified?: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: Role
        sessionId?: string
        mfa_enabled?: boolean;
        is_mfa_verified?: boolean;
    }
}
