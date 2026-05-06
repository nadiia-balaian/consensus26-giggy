"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  /** Highlight active when path starts with any of these prefixes. */
  match: string[];
};

const NAV: NavItem[] = [
  { label: "Mission Market", href: "/", match: ["/"] },
  { label: "Create Mission", href: "/create", match: ["/create"] },
  { label: "Mission Details", href: "/mission/m_001", match: ["/mission"] },
  { label: "Agent Dashboard", href: "/agent", match: ["/agent"] },
  { label: "Receipts", href: "/receipt/r_001", match: ["/receipt"] },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/") return pathname === "/";
  return item.match.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col gap-6 border-r-[3px] border-ink bg-bg px-6 py-7">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-full border-ink-3 bg-sky shadow-doodle-sm">
          <span className="block size-3 rounded-full bg-ink/0 ring-2 ring-ink" />
        </span>
        <span className="font-display text-3xl font-extrabold tracking-tight">
          Giggy
        </span>
      </Link>

      <nav className="mt-2 flex flex-col gap-2">
        {NAV.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-2xl px-4 py-2.5 text-[0.95rem] font-semibold tracking-tight transition-colors",
                active
                  ? "border-ink-2 bg-coral shadow-doodle-sm"
                  : "border-2 border-transparent hover:border-ink hover:bg-white",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t-2 border-dashed border-ink/40 pt-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/60">
          User / Org
        </span>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border-ink-2 bg-sky px-3 py-1 text-xs font-bold tracking-wide">
          BAL: 4,050 GIG
        </span>
      </div>
    </aside>
  );
}
