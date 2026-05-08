import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminClient = createAdminClient();

    const { data: angebot, error } = await adminClient
      .from("Angebot")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !angebot) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Get company info
    const { data: company } = await adminClient
      .from("Company")
      .select("name, address")
      .eq("id", angebot.companyId)
      .single();

    return NextResponse.json({
      id: angebot.id,
      number: angebot.number,
      title: angebot.title,
      status: angebot.status,
      einleitung: angebot.einleitung,
      positions: angebot.positions,
      subtotalNet: angebot.subtotalNet,
      mwstRate: angebot.mwstRate,
      mwstTotal: angebot.mwstTotal,
      totalGross: angebot.totalGross,
      zahlungsbedingungen: angebot.zahlungsbedingungen,
      gewaehrleistung: angebot.gewaehrleistung,
      schlussformel: angebot.schlussformel,
      createdAt: angebot.createdAt,
      companyName: company?.name ?? "Handwerksbetrieb",
      companyAddress: company?.address ?? "",
      acceptedByName: angebot.acceptedByName ?? null,
      acceptedAt: angebot.acceptedAt ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load quote" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, email } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 422 });
    }

    const adminClient = createAdminClient();

    // Check if not already accepted
    const { data: existing } = await adminClient
      .from("Angebot")
      .select("status")
      .eq("id", id)
      .single();

    if (existing?.status === "accepted") {
      return NextResponse.json({ error: "Quote already accepted" }, { status: 409 });
    }

    const forwarded = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";

    const { error } = await adminClient
      .from("Angebot")
      .update({
        status: "accepted",
        acceptedAt: new Date().toISOString(),
        acceptedByName: name.trim(),
        acceptedByEmail: email?.trim() || null,
        signatureIP: forwarded.split(",")[0]?.trim(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Signing failed" }, { status: 500 });
  }
}
