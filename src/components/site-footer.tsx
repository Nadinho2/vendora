import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/30 backdrop-blur supports-[backdrop-filter]:bg-background/20">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div>© {new Date().getFullYear()} Vendora</div>
          <div className="text-xs">BUY BETTER WITH VENDORA</div>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/admin/import" className="hover:text-foreground">
            Admin
          </Link>
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            Vercel
          </a>
        </div>
      </div>
    </footer>
  );
}
