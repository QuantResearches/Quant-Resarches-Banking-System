
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const customers = await prisma.customer.findMany({
            where: { status: "active" },
            select: { id: true, full_name: true, email: true },
            orderBy: { full_name: 'asc' }
        });
        return NextResponse.json(customers);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { createHash } from "crypto";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();

        // Basic Validation
        if (!body.full_name || !body.email || !body.phone || !body.address || !body.dob || !body.pan || !body.aadhaar_number) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const {
            full_name, email, phone, address,
            dob, gender, marital_status, father_name,
            city, state, pincode, nationality,
            pan, aadhaar_number,
            risk_category, pep_flag
        } = body;

        // 1. Check for duplicate PAN or Aadhaar using Hashes
        const panHash = createHash('sha256').update(pan.toUpperCase()).digest('hex');
        const aadhaarHash = createHash('sha256').update(aadhaar_number).digest('hex');

        const existingProfile = await prisma.customerProfile.findFirst({
            where: {
                OR: [
                    { pan_hash: panHash },
                    { aadhaar_hash: aadhaarHash }
                ]
            }
        });

        if (existingProfile) {
            return NextResponse.json({ error: "Customer with this PAN or Aadhaar already exists." }, { status: 409 });
        }

        // Transactional Creation
        const result = await prisma.$transaction(async (tx) => {
            // 2. Create Customer Core Record
            const customer = await tx.customer.create({
                data: {
                    full_name,
                    cif_number: `80${Math.floor(100000000 + Math.random() * 900000000)}`, // 11 Digits (80 + 9 random)
                    email,
                    phone,
                    address, // This is current address summary
                    created_by: session.user.id
                }
            });

            // 3. Encrypt Sensitive Data
            const panEncrypted = encrypt(pan.toUpperCase());
            const aadhaarEncrypted = encrypt(aadhaar_number);

            // 4. Create Detailed Profile
            await tx.customerProfile.create({
                data: {
                    customer_id: customer.id,
                    dob: new Date(dob),
                    gender,
                    marital_status,
                    father_name,
                    country: nationality || "INDIAN",
                    current_address: address,
                    permanent_address: address,
                    city,
                    state,
                    pincode,
                    pan_encrypted: panEncrypted,
                    pan_hash: panHash,
                    aadhaar_number_encrypted: aadhaarEncrypted,
                    aadhaar_hash: aadhaarHash,
                    kyc_status: "PENDING_VERIFICATION"
                }
            });

            // 5. Create Risk Profile
            await tx.kYCRiskProfile.create({
                data: {
                    profile_id: (await tx.customerProfile.findUnique({ where: { customer_id: customer.id } }))!.id,
                    risk_rating: risk_category, // LOW, MEDIUM, HIGH
                    pep_status: pep_flag === "on" || pep_flag === true,
                    last_review_date: new Date(),
                    next_review_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days review
                }
            });

            return customer;
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Create Customer Error:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Customer with this email already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: "Failed to create customer record" }, { status: 500 });
    }
}
