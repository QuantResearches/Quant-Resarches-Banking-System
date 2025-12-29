
import prisma from "@/lib/prisma";

export type SecurityEventType =
    | "LOGIN_SUCCESS"
    | "LOGIN_FAIL"
    | "UNAUTHORIZED_ACCESS"
    | "SELF_APPROVAL_ATTEMPT"
    | "HIGH_VALUE_TXN"
    | "ADMIN_ACTION"
    | "AUDIT_NOTE_ADDED";

export type SecuritySeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export async function logSecurityEvent(
    eventType: SecurityEventType,
    severity: SecuritySeverity,
    description: string,
    userId?: string | null,
    req?: Request,
    metadata?: any
) {
    try {
        let ip_address = "unknown";
        let user_agent = "unknown";

        if (req) {
            ip_address = req.headers.get("x-forwarded-for") || "unknown";
            user_agent = req.headers.get("user-agent") || "unknown";
        }

        // @ts-ignore - Prisma Client might not be regenerated yet
        await prisma.securityEvent.create({
            data: {
                event_type: eventType,
                severity,
                description,
                user_id: userId,
                ip_address,
                user_agent,
                metadata: metadata ? JSON.stringify(metadata) : undefined
            }
        });
    } catch (error) {
        // Fallback: Ensure we at least log to console if DB fails (Defense in Depth)
        console.error(`[SECURITY ALERT] ${severity}: ${description}`, { userId, metadata, error });
    }
}
