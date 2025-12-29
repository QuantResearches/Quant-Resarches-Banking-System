import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuditFilters from "./AuditFilters";
import AuditLogTable from "./AuditLogTable";

export const dynamic = 'force-dynamic';

export default async function AuditLogsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const session = await getServerSession(authOptions);

    if (session?.user.role !== "admin") {
        redirect("/dashboard");
    }

    const searchParams = await props.searchParams;
    const { entity_type, action, entity_id } = searchParams;

    const where: any = {};
    if (entity_type) where.entity_type = entity_type;
    if (action) where.action = action;
    if (entity_id) where.entity_id = { contains: entity_id as string };

    const { start_date, end_date } = searchParams;
    if (start_date || end_date) {
        where.created_at = {};
        if (start_date) where.created_at.gte = new Date(start_date as string);
        if (end_date) {
            const end = new Date(end_date as string);
            end.setHours(23, 59, 59, 999); // End of day
            where.created_at.lte = end;
        }
    }

    const logs = await prisma.auditLog.findMany({
        where,
        include: {
            user: { select: { email: true, role: true } }
        },
        orderBy: { created_at: "desc" },
        take: 100
    });

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-6">Audit Logs</h1>
            <AuditFilters />
            <AuditLogTable logs={logs} />
        </div>
    );
}
