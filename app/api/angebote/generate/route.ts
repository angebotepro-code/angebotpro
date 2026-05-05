import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAngebot } from "@/lib/ai/generate-angebot";

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    // Parse request
    const body = await request.json();
    const { input_text, trade } = body;

    if (!input_text || input_text.trim().length < 10) {
      return NextResponse.json(
        {
          error: "Bitte beschreiben Sie die Arbeit genauer. Mindestens: Art der Arbeit, Ort, ungefährer Umfang.",
        },
        { status: 422 }
      );
    }

    // Generate Angebot via AI
    const angebot = await generateAngebot({
      inputText: input_text,
      trade,
    });

    // Get or create user's company
    const adminClient = createAdminClient();

    // Check if user exists in our User table
    let { data: userRecord } = await adminClient
      .from("User")
      .select("id, companyId")
      .eq("email", user.email!)
      .maybeSingle();

    let companyId = userRecord?.companyId;

    // Auto-create Company + User if first-time user
    if (!userRecord) {
      const { data: company } = await adminClient
        .from("Company")
        .insert({ name: user.email!.split("@")[0] })
        .select("id")
        .single();

      if (company) {
        companyId = company.id;
        await adminClient.from("User").insert({
          email: user.email!,
          companyId: company.id,
          role: "admin",
        });
      }
    }

    // Generate Angebot number: YYYY-NNNN
    const year = new Date().getFullYear();
    const { count } = await adminClient
      .from("Angebot")
      .select("*", { count: "exact", head: true })
      .eq("companyId", companyId || "");

    const nextNumber = String((count ?? 0) + 1).padStart(4, "0");
    const number = `${year}-${nextNumber}`;

    // Save to database
    const { data: savedAngebot, error: saveError } = await adminClient
      .from("Angebot")
      .insert({
        companyId: companyId!,
        number,
        title: angebot.positionen[0]?.beschreibung?.slice(0, 80) ?? "Angebot",
        status: "draft",
        inputText: input_text,
        inputType: "text",
        positions: angebot.positionen,
        subtotalNet: angebot.subtotalNet,
        mwstTotal: angebot.mwstTotal,
        totalGross: angebot.totalGross,
        mwstRate: angebot.mwstRate,
        zahlungsbedingungen: angebot.zahlungsbedingungen,
        gewaehrleistung: angebot.gewaehrleistung,
        einleitung: angebot.einleitung,
        schlussformel: angebot.schlussformel,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save Angebot:", saveError);
      // Still return the generated data even if save fails
    }

    return NextResponse.json({
      id: savedAngebot?.id,
      number: savedAngebot?.number ?? number,
      ...angebot,
    });
  } catch (error) {
    console.error("Angebot generation error:", error);
    return NextResponse.json(
      { error: "Fehler bei der Angebotserstellung. Bitte versuchen Sie es erneut." },
      { status: 500 }
    );
  }
}
