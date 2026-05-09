import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 422 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const body = new FormData();
    body.append("file", audioFile, "recording.webm");
    body.append("model", "whisper-1");
    body.append("language", "de");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}` },
      body,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Whisper API error:", err);
      return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error("Transcribe error:", error);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
