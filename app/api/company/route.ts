import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Find user's company
    const { data: userRecord } = await adminClient
      .from("User")
      .select("companyId")
      .eq("email", user.email!)
      .maybeSingle();

    if (!userRecord?.companyId) {
      return NextResponse.json({});
    }

    const { data: company } = await adminClient
      .from("Company")
      .select("*")
      .eq("id", userRecord.companyId)
      .single();

    return NextResponse.json(company ?? {});
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const body = await request.json();

    // Find user's company
    const { data: userRecord } = await adminClient
      .from("User")
      .select("companyId")
      .eq("email", user.email!)
      .maybeSingle();

    if (!userRecord?.companyId) {
      // Auto-create company
      const { data: company } = await adminClient
        .from("Company")
        .insert({ name: body.name || user.email!.split("@")[0] })
        .select("id")
        .single();

      if (company) {
        await adminClient.from("User").insert({
          email: user.email!,
          companyId: company.id,
          role: "admin",
        });

        const { data: updated } = await adminClient
          .from("Company")
          .update({
            name: body.name,
            address: body.address,
            uidNumber: body.uidNumber,
            defaultHourlyRate: body.defaultHourlyRate,
            defaultMwst: body.defaultMwst,
            phone: body.phone,
            email: body.email,
            website: body.website,
            agbText: body.agbText,
          })
          .eq("id", company.id)
          .select()
          .single();

        return NextResponse.json(updated);
      }
    }

    // Update existing company
    const { data: updated } = await adminClient
      .from("Company")
      .update({
        name: body.name,
        address: body.address,
        uidNumber: body.uidNumber,
        defaultHourlyRate: body.defaultHourlyRate,
        defaultMwst: body.defaultMwst,
        phone: body.phone,
        email: body.email,
        website: body.website,
        agbText: body.agbText,
      })
      .eq("id", userRecord!.companyId)
      .select()
      .single();

    return NextResponse.json(updated ?? {});
  } catch {
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
