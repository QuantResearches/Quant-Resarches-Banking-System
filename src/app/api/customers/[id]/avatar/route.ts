
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { put, del } from "@vercel/blob";
import path from "path";

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Validate File Type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "File must be an image" }, { status: 400 });
        }

        // Validate File Size (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File size exceeds 5MB" }, { status: 400 });
        }

        const filename = `${id} -${Date.now()}${path.extname(file.name)} `;

        // Upload to Vercel Blob
        const blob = await put(`avatars / ${filename} `, file, {
            access: 'public',
        });

        // Handle Previous Avatar Cleanup
        const oldProfile = await prisma.customerProfile.findUnique({
            where: { customer_id: id },
            select: { profile_picture: true }
        });

        if (oldProfile?.profile_picture) {
            try {
                // Check if it's a blob url before deleting
                if (oldProfile.profile_picture.includes('.public.blob.vercel-storage.com')) {
                    await del(oldProfile.profile_picture);
                }
            } catch (err) {
                console.error("Failed to delete old avatar:", err);
            }
        }

        await prisma.customerProfile.upsert({
            where: { customer_id: id },
            create: {
                customer_id: id,
                profile_picture: blob.url
            },
            update: {
                profile_picture: blob.url
            }
        });

        return NextResponse.json({ message: "Avatar updated", url: blob.url });

    } catch (error) {
        console.error("Avatar Upload Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
        const profile = await prisma.customerProfile.findUnique({
            where: { customer_id: id },
            select: { profile_picture: true }
        });

        if (profile?.profile_picture) {
            try {
                if (profile.profile_picture.includes('.public.blob.vercel-storage.com')) {
                    await del(profile.profile_picture);
                }
            } catch (err) {
                console.warn("Failed to delete file:", err);
            }
        }

        await prisma.customerProfile.update({
            where: { customer_id: id },
            data: { profile_picture: null }
        });

        return NextResponse.json({ message: "Avatar removed" });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
