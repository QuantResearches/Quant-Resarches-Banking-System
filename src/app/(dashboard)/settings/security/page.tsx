
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MFASettings from "./MFASettings";

export const dynamic = 'force-dynamic';

export default async function SecuritySettingsPage() {
    const session = await getServerSession(authOptions);

    // Default to false if not found
    let mfaEnabled = false;

    if (session?.user?.id) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            // @ts-ignore
            select: { mfa_enabled: true }
        });
        mfaEnabled = (user as any)?.mfa_enabled || false;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Security Settings</h1>
            <p className="text-gray-600 mb-8 max-w-2xl">
                Manage your account security preferences.
                Bank policy recommends enabling Multi-Factor Authentication (MFA) for all users managing financial data.
            </p>

            <MFASettings mfaEnabled={mfaEnabled} />
        </div>
    );
}
