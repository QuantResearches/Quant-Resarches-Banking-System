import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/crypto";

const customerUpdateSchema = z.object({
    full_name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits").optional(),
    address: z.string().min(5).optional(),
    status: z.enum(["active", "inactive"]).optional(),
    // Profile Fields
    dob: z.string().optional(), // Date string from input
    gender: z.string().optional(),
    marital_status: z.string().optional(),
    pan: z.string().optional(),
    aadhaar: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits").optional().or(z.literal("")),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                accounts: true,
                profile: true
            }
        });

        if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Decrypt Sensitive Data for Display
        if (customer.profile) {
            try {
                if (customer.profile.pan_encrypted) {
                    customer.profile.pan_encrypted = decrypt(customer.profile.pan_encrypted);
                }
                if (customer.profile.aadhaar_number_encrypted) {
                    customer.profile.aadhaar_number_encrypted = decrypt(customer.profile.aadhaar_number_encrypted);
                }
            } catch (e) {
                console.error("Decryption Failed for Customer:", id, e);
                // Return as is or empty if decryption fails to avoid crashing UI
            }
        }

        return NextResponse.json(customer);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "admin" && session.user.role !== "finance") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const body = await req.json();
        const {
            dob, gender, marital_status, pan, aadhaar, city, state, pincode,
            ...customerData
        } = customerUpdateSchema.parse(body);

        const oldCustomer = await prisma.customer.findUnique({
            where: { id },
            include: { profile: true }
        });
        if (!oldCustomer) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Encrypt Sensitive Data if provided
        const panEncrypted = pan ? encrypt(pan) : undefined;
        const aadhaarEncrypted = aadhaar ? encrypt(aadhaar) : undefined;

        // Separate Customer update and Profile upsert
        const updatedCustomer = await prisma.customer.update({
            where: { id },
            data: {
                ...customerData,
                profile: {
                    upsert: {
                        create: {
                            dob: dob ? new Date(dob) : null,
                            gender,
                            marital_status,
                            pan_encrypted: panEncrypted,
                            aadhaar_number_encrypted: aadhaarEncrypted,
                            city,
                            state,
                            pincode,
                            country: "IN", // Default
                            kyc_status: "PENDING_VERIFICATION"
                        },
                        update: {
                            dob: dob ? new Date(dob) : undefined,
                            gender,
                            marital_status,
                            pan_encrypted: panEncrypted, // Will only update if provided (valid string)
                            aadhaar_number_encrypted: aadhaarEncrypted,
                            city,
                            state,
                            pincode
                        }
                    }
                }
            },
            include: { profile: true }
        });

        // Audit
        await prisma.auditLog.create({
            data: {
                user_id: session.user.id,
                action: "UPDATE_CUSTOMER",
                entity_type: "Customer",
                entity_id: id,
                old_value: oldCustomer as any,
                new_value: updatedCustomer as any,
                ip_address: req.headers.get("x-forwarded-for") || "unknown",
                user_agent: req.headers.get("user-agent"),
            },
        });

        return NextResponse.json(updatedCustomer);
    } catch (error) {
        console.error("Update Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
