"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Scan",
    href: "/scan",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    label: "Projects",
    href: "/projects",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "History",
    href: "/history",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: "Patterns",
    href: "/patterns",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Documentation",
    href: "/docs",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] h-screen bg-aegis-dark border-r border-aegis-dark-border flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-aegis-dark-border">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="text-aegis-accent transition-transform duration-200 group-hover:scale-110">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <path d="M12 2H20L27 9V20L27 23L20 30H12L5 23V20V9L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <line x1="10" y1="22" x2="14.5" y2="6" stroke="currentColor" strokeWidth="1.2" />
              <line x1="22" y1="22" x2="17.5" y2="6" stroke="currentColor" strokeWidth="1.2" />
              <line x1="11.5" y1="16" x2="20.5" y2="16" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="16" cy="16" r="1.2" fill="currentColor" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white tracking-tight group-hover:text-aegis-accent transition-colors duration-200">Aegis</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5 group ${
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-[#777] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-aegis-accent rounded-r" />
              )}
              <span className={`transition-colors duration-150 ${isActive ? "text-aegis-accent" : "text-[#555] group-hover:text-aegis-accent/60"}`}>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Version Tag */}
      <div className="px-5 pb-2">
        <p className="text-[9px] text-[#333] font-mono">v0.1.0-alpha</p>
      </div>

      {/* Bottom */}
      <div className="p-3 border-t border-aegis-dark-border">
        <div className="px-3 py-2 rounded-lg bg-white/[0.03]">
          <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">Current Project</p>
          <p className="text-xs text-[#888] truncate">Demo Contract</p>
        </div>
      </div>
    </aside>
  );
}
