export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-50">
      <main className="flex flex-col items-center gap-8 text-center px-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Angebot<span className="text-emerald-400">Pro</span>
        </h1>
        <p className="max-w-md text-lg text-zinc-400">
          KI-gestützte Angebote für österreichische Handwerker.
          Sprich dein Angebot ein — wir machen den Rest.
        </p>
        <p className="text-sm text-zinc-600">Coming Soon</p>
      </main>
    </div>
  );
}
