import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const adminClient = createAdminClient();

    // Fetch current state for revision snapshot
    const { data: current } = await adminClient
      .from("Angebot")
      .select("*")
      .eq("id", id)
      .single();

    // Build revision entry
    const revisionEntry = {
      timestamp: new Date().toISOString(),
      editor: user.email,
      snapshot: current ? {
        einleitung: current.einleitung,
        positions: current.positions,
        subtotalNet: current.subtotalNet,
        mwstRate: current.mwstRate,
        mwstTotal: current.mwstTotal,
        totalGross: current.totalGross,
        zahlungsbedingungen: current.zahlungsbedingungen,
        gewaehrleistung: current.gewaehrleistung,
        schlussformel: current.schlussformel,
        title: current.title,
      } : null,
    };

    // Get existing revisions and append
    const existing = (current?.revisions as any[]) ?? [];
    const updatedRevisions = [...existing, revisionEntry];

    const { data, error } = await adminClient
      .from("Angebot")
      .update({ ...body, revisions: updatedRevisions })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("Angebot")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from("Angebot")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
