import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma as any), // Cast to any to handle Prisma Extension types
    session: {
        strategy: "jwt", // We use JWT to carry the session ID, effectively implementing DB sessions
        maxAge: 8 * 60 * 60, // 8 hours absolute max
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                const { email, password } = loginSchema.parse(credentials);

                // 1. Check for Brute Force (Max 5 attempts in last 15 mins)
                const recentFailures = await prisma.failedLoginAttempt.count({
                    where: {
                        email,
                        attempted_at: {
                            gte: new Date(Date.now() - 15 * 60 * 1000)
                        }
                    }
                });

                if (recentFailures >= 5) {
                    throw new Error("Account locked due to too many failed attempts. Try again later.");
                }

                // 2. Fetch User
                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user || !user.is_active) {
                    // Log failed attempt blindly to avoid user enumeration if possible, 
                    // though for internal system we might want to know.
                    // We'll trust strict internal config. 
                    // BUT if user doesn't exist, we can't really log to them?
                    // We log to FailedLoginAttempt anyway.
                    await prisma.failedLoginAttempt.create({
                        data: {
                            email,
                            ip_address: req.headers?.['x-forwarded-for'] as string || 'unknown',
                        }
                    });
                    return null;
                }

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

                // 3. Create Session
                const session = await prisma.session.create({
                    data: {
                        user_id: user.id,
                        expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
                        ip_address: req.headers?.['x-forwarded-for'] as string || 'unknown',
                        user_agent: req.headers?.['user-agent'] as string || 'unknown',
                    },
                });

                // 4. Update Last Login & Audit Log (Success)
                await prisma.user.update({
                    where: { id: user.id },
                    data: { last_login_at: new Date() }
                });

                await prisma.auditLog.create({
                    data: {
                        user_id: user.id,
                        action: "LOGIN",
                        entity_type: "Session",
                        entity_id: session.id, // Log the session ID we created
                        ip_address: req.headers?.['x-forwarded-for'] as string || 'unknown',
                        user_agent: req.headers?.['user-agent'] as string || 'unknown',
                    }
                });

                // Return user with session ID embedded
                return {
                    id: user.id,
                    role: user.role,
                    sessionId: session.id, // Custom field to pass to JWT
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                // @ts-ignore
                token.sessionId = user.sessionId;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.sessionId) {
                // Validation: Check if session exists in DB and is valid
                const dbSession = await prisma.session.findUnique({
                    where: { id: token.sessionId as string },
                });

                if (!dbSession || dbSession.expires_at < new Date()) {
                    // If session invalid/expired in DB, force logout (return empty/null session effectively)
                    // NextAuth doesn't let us throw here easily to clear cookie, but returning empty breaks access.
                    return { ...session, user: undefined } as any;
                }

                // Update last_activity logic can go here or middleware
                // Let's do it right here (async, don't await strictly to speed up)
                const now = new Date();
                const timeSinceLastActive = now.getTime() - dbSession.last_activity_at.getTime();

                // 15 mins = 15 * 60 * 1000 = 900000 ms
                if (timeSinceLastActive > 15 * 60 * 1000) {
                    // Expire it
                    await prisma.session.delete({ where: { id: dbSession.id } });
                    return { ...session, user: undefined } as any;
                }

                // Update activity
                await prisma.session.update({
                    where: { id: dbSession.id },
                    data: { last_activity_at: now }
                });

                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};
