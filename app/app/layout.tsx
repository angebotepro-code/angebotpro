import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "./logout-button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const initials = user.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-zinc-800 bg-zinc-900 p-4">
        <Link href="/app/dashboard" className="mb-6 text-xl font-bold">
          Angebot<span className="text-emerald-400">Pro</span>
        </Link>

        <nav className="flex flex-col gap-1">
          <Link href="/app/dashboard" className={buttonVariants({ variant: "ghost", className: "justify-start text-zinc-300 hover:text-zinc-100" })}>
            Dashboard
          </Link>
          <Link href="/app/angebote/neu" className={buttonVariants({ variant: "ghost", className: "justify-start text-zinc-300 hover:text-zinc-100" })}>
            Neues Angebot
          </Link>
          <Link href="/app/einstellungen" className={buttonVariants({ variant: "ghost", className: "justify-start text-zinc-300 hover:text-zinc-100" })}>
            Einstellungen
          </Link>
        </nav>

        <div className="mt-auto">
          <Separator className="my-4 bg-zinc-800" />
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-emerald-800 text-emerald-200 text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm text-zinc-300">{user.email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
