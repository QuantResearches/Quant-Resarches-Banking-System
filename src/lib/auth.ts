import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { Role } from "@prisma/client";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    adapter: PrismaAdapter(prisma as any),
    session: {
        strategy: "jwt",
        maxAge: 8 * 60 * 60, // 8 hours
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                if (!credentials) return null;

                try {
                    const { email, password } = loginSchema.parse(credentials);

                    // 1. Check for Brute Force
                    // const recentFailures = await prisma.failedLoginAttempt.count({ ... }); 
                    // (Skipping for now to simplify login debug)

                    // 2. Fetch User
                    const user = await prisma.user.findUnique({
                        where: { email: email.toLowerCase() },
                    });

                    if (!user) {
                        return null;
                    }

                    if (!user.is_active) {
                        return null;
                    }

                    // 3. Verify Password
                    const isValid = await bcrypt.compare(password, user.password_hash);

                    if (!isValid) {
                        await prisma.failedLoginAttempt.create({
                            data: {
                                email,
                                ip_address: req.headers?.['x-forwarded-for'] as string || 'unknown',
                            }
                        });
                        return null;
                    }

                    // 4. Create Session (DB Side) if needed for tracking
                    // Since we use JWT strategy but want to track sessions in DB for auditing:
                    const mfaVerified = !user.mfa_enabled; // Auto-verify if MFA disabled

                    const session = await prisma.session.create({
                        data: {
                            user_id: user.id,
                            expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000),
                            ip_address: req.headers?.['x-forwarded-for'] as string || 'unknown',
                            user_agent: req.headers?.['user-agent'] as string || 'unknown',
                            is_mfa_verified: mfaVerified
                        },
                    });

                    // 5. Update Last Login
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { last_login_at: new Date() }
                    });

                    // 6. Audit Log
                    await prisma.auditLog.create({
                        data: {
                            user_id: user.id,
                            action: "LOGIN",
                            entity_type: "Session",
                            entity_id: session.id,
                            ip_address: req.headers?.['x-forwarded-for'] as string || 'unknown',
                            user_agent: req.headers?.['user-agent'] as string || 'unknown',
                        }
                    });

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.email.split('@')[0], // User model has no 'name', derived from email
                        role: user.role,
                        sessionId: session.id,
                        mfa_enabled: user.mfa_enabled,
                        is_mfa_verified: mfaVerified,
                    };

                } catch (error) {
                    console.error("[AUTH_DEBUG] Login Error:", error);
                    return null;
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                // @ts-ignore
                // @ts-ignore
                token.sessionId = user.sessionId;
                // @ts-ignore
                token.mfa_enabled = user.mfa_enabled;
                // @ts-ignore
                token.is_mfa_verified = user.is_mfa_verified; // Init from user object
            }

            console.log(`[AUTH_DEBUG] JWT Callback. Trigger: ${trigger}, MFA Verified: ${token.is_mfa_verified}`);

            if (trigger === "update" && session?.is_mfa_verified) {
                console.log("[AUTH_DEBUG] Updating JWT MFA status to TRUE");
                token.is_mfa_verified = true;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.sessionId) {
                // Verify DB session
                const dbSession = await prisma.session.findUnique({
                    where: { id: token.sessionId as string },
                });

                if (!dbSession || dbSession.expires_at < new Date()) {
                    return { ...session, user: undefined } as any; // Force Logout
                }

                // Update activity (debounced logic normally, here simplified)
                // await prisma.session.update(...)

                session.user.id = token.id as string;
                session.user.role = token.role as Role;
                session.user.email = (token.email || session.user.email) as string;
                // @ts-ignore
                session.user.mfa_enabled = token.mfa_enabled;
                // @ts-ignore
                session.user.is_mfa_verified = dbSession.is_mfa_verified;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};
