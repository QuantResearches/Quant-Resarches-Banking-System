import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;
        const method = req.method;

        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        const role = token.role;

        // Admin Only Routes
        if (path.startsWith("/api/users") || path.startsWith("/api/audit-logs") || path.startsWith("/audit")) {
            if (role !== "admin") {
                return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
            }
        }

        // Finance/Admin Write Operations
        if (method === "POST" || method === "PATCH" || method === "DELETE") {

            // Viewer cannot write anything
            if (role === "viewer") {
                return NextResponse.json({ error: "Forbidden: Read-only access" }, { status: 403 });
            }

            // Transactions - Finance Only (and Admin)
            if (path.startsWith("/api/transactions")) {
                const validRoles = ["finance", "admin"];
                if (!validRoles.includes(role as string)) {
                    return NextResponse.json({ error: "Forbidden: Finance role required" }, { status: 403 });
                }
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
        secret: process.env.NEXTAUTH_SECRET, // Explicitly load secret
    }
);

export const config = {
    matcher: ["/dashboard/:path*", "/customers/:path*", "/accounts/:path*", "/transactions/:path*", "/reports/:path*", "/audit/:path*", "/api/:path*"],
};
