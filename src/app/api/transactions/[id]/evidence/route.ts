
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const { id } = await params; // Await params for Next.js 15+ support
        // Expecting FormData for real file upload in Vercel Blob
        // But for this V1 json mock, we can't upload 'real' files easily without client-side FormData.
        // I'll assume the client is sending JSON for now as per previous step, BUT Vercel Blob needs a file/blob.
        // So I will convert the 'filename' placeholder to a text file for demo purposes, 
        // OR ask the user: "To use Vercel Blob, we need to implement Client-Side File Upload properly".
        // The previous "Evidence Upload" was a mock accepting JSON.
        // To make it real, I need to read `req.formData()`.

        // Let's switch to FormData handling.
        const contentType = req.headers.get('content-type') || '';
        if (!contentType.includes('multipart/form-data')) {
            // Fallback for V1 demo: Create a text blob from JSON description
            const body = await req.json();
            const blob = await put(`evidence/${id}-${Date.now()}.txt`, "This is a placeholder for evidence content: " + body.filename, {
                access: 'public',
            });

            // @ts-ignore
            const evidence = await prisma.transactionEvidence.create({
                data: {
                    transaction_id: id,
                    filename: body.filename || "placeholder.txt",
                    file_path: blob.url,
                    content_type: "text/plain",
                    file_size: 100,
                    uploaded_by: session.user.id
                }
            });
            return NextResponse.json({ success: true, evidence });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const documentType = formData.get('documentType') as string || 'general';

        // Fetch Transaction to get Customer ID for folder structure
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: { account: true }
        });

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        const customerId = transaction.account.customer_id;
        // Sanitize documentType to ensure folder safety
        const safeDocType = documentType.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();

        const folderPath = `customers/${customerId}/${safeDocType}/`;
        const finalPath = folderPath + file.name;

        const blob = await put(finalPath, file, {
            access: 'public',
            addRandomSuffix: true,
        });

        // @ts-ignore
        const evidence = await prisma.transactionEvidence.create({
            data: {
                transaction_id: id,
                filename: file.name,
                file_path: blob.url,
                content_type: file.type,
                file_size: file.size,
                uploaded_by: session.user.id
            }
        });

        return NextResponse.json({ success: true, evidence });

    } catch (error) {
        console.error("Evidence Upload error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
