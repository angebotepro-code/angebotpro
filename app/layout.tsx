import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "AngebotPro — AI-Angebote für österreichische Handwerker",
    template: "%s | AngebotPro",
  },
  description:
    "KI-gestützte Angebotserstellung in 2 Minuten. Sprich dein Angebot ein — wir schreiben den Rest. PDF, E-Mail, korrekte MwSt, DSGVO-konform. Für Elektriker, Installateure, Maler & mehr.",
  keywords: [
    "Angebot schreiben",
    "Handwerker Software",
    "KI Angebot",
    "Angebotsgenerator",
    "Kostenvoranschlag",
    "Österreich",
    "Elektriker",
    "Installateur",
    "Maler",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "AngebotPro — AI-Angebote in 2 Minuten",
    description:
      "KI-gestützte Angebotserstellung. Sprechen → Generieren → Versenden. Für österreichische Handwerker.",
    type: "website",
    locale: "de_AT",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
