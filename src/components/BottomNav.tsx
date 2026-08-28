"use client";

import { useState } from "react";

const ITEMS = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "explore", label: "Explore", icon: ExploreIcon },
  { id: "orders", label: "Orders", icon: OrdersIcon },
  { id: "favourites", label: "Favourites", icon: HeartIcon },
  { id: "profile", label: "Profile", icon: ProfileIcon },
] as const;

export function BottomNav() {
  const [active, setActive] = useState<string>("home");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-md items-stretch justify-between rounded-t-3xl bg-white px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(0,0,0,0.15)] sm:max-w-lg"
      aria-label="Primary"
    >
      {ITEMS.map((item) => {
        const isActive = item.id === active;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className="flex flex-1 flex-col items-center gap-1 py-1.5"
            aria-current={isActive ? "page" : undefined}
            style={{ color: isActive ? "var(--kb-purple)" : "var(--kb-ink-soft)" }}
          >
            {isActive && (
              <span className="h-0.5 w-6 rounded-full" style={{ background: "var(--kb-purple)" }} />
            )}
            <Icon />
            <span className="text-[11px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9" />
    </svg>
  );
}
function ExploreIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function OrdersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="4" width="14" height="16" rx="1.5" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-7-4.35-9.5-9C.9 8.4 3 5 6.5 5c2 0 3.3 1.1 4 2.1.7-1 2-2.1 4-2.1 3.5 0 5.6 3.4 4 7-2.5 4.65-6.5 9-9 9z" />
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.7-4.2 4.9-6.5 7.5-6.5s5.8 2.3 7.5 6.5" />
    </svg>
  );
}
