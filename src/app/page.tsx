import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const session = await getServerSession(authOptions);

    if (session) {
      redirect("/dashboard");
    } else {
      redirect("/login");
    }
  } catch (error: any) {
    console.error("Critical Startup Error:", error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-100 text-red-800 font-mono text-sm overflow-auto">
        <div className="max-w-4xl w-full bg-white p-6 shadow-lg rounded border border-red-200 space-y-4">
          <h1 className="text-xl font-bold border-b border-red-100 pb-2">System Startup Failure (500)</h1>

          <div className="space-y-2">
            <h2 className="font-semibold text-gray-700">Error Details:</h2>
            <div className="bg-red-50 p-4 rounded border border-red-100 whitespace-pre-wrap word-break-all">
              {error.message}
            </div>
            {error.code && <div>Code: {error.code}</div>}
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold text-gray-700">Environment Diagnostics:</h2>
            <ul className="list-disc list-inside bg-gray-50 p-4 rounded border border-gray-200">
              <li>NODE_ENV: {process.env.NODE_ENV}</li>
              <li>POSTGRES_PRISMA_URL: {process.env.POSTGRES_PRISMA_URL ? "Defined (Length: " + process.env.POSTGRES_PRISMA_URL.length + ")" : "MISSING"}</li>
              <li>POSTGRES_URL_NON_POOLING: {process.env.POSTGRES_URL_NON_POOLING ? "Defined (Length: " + process.env.POSTGRES_URL_NON_POOLING.length + ")" : "MISSING"}</li>
              <li>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? "Defined (Length: " + process.env.NEXTAUTH_SECRET.length + ")" : "MISSING"}</li>
              <li>NEXTAUTH_URL: {process.env.NEXTAUTH_URL || "MISSING"}</li>
            </ul>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            *This screen is only visible because we caught the error in page.tsx. Please screenshot this and share it.*
          </p>
        </div>
      </div>
    );
  }
}
