"use client";

import { useState } from "react";
import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

export function TopBar({ location = "Singapore" }: { location?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-1 py-2">
        <button
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
          className="p-1"
          style={{ color: "var(--kb-on-navy)" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>

        <span className="font-display text-xl font-extrabold tracking-tight kb-gradient-text">
          KOPI BOY
        </span>

        <button
          className="flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium"
          style={{ color: "var(--kb-on-navy)" }}
          aria-label={`Location: ${location}`}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="3" fill="var(--kb-purple)" />
            <circle cx="12" cy="12" r="7" stroke="var(--kb-purple)" strokeWidth="1.8" />
            <line x1="12" y1="1.5" x2="12" y2="4.5" stroke="var(--kb-purple)" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="12" y1="19.5" x2="12" y2="22.5" stroke="var(--kb-purple)" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="1.5" y1="12" x2="4.5" y2="12" stroke="var(--kb-purple)" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="19.5" y1="12" x2="22.5" y2="12" stroke="var(--kb-purple)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {location}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <button
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div
            className="absolute inset-y-0 left-0 w-72 max-w-[80%] p-5"
            style={{ background: "var(--kb-navy)" }}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-extrabold kb-gradient-text">KOPI BOY</span>
              <button
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                style={{ color: "var(--kb-on-navy)" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </svg>
              </button>
            </div>

            <nav className="mt-6 space-y-1">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium"
                style={{ color: "var(--kb-on-navy)" }}
              >
                Home
              </Link>
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium"
                style={{ color: "var(--kb-on-navy)" }}
              >
                My Profile
              </Link>
            </nav>

            <div className="mt-6 border-t pt-4" style={{ borderColor: "var(--kb-navy-line)" }}>
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
