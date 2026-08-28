export function TopBar({ location = "Singapore" }: { location?: string }) {
  return (
    <div className="flex items-center justify-between px-1 py-2">
      <button aria-label="Open menu" className="p-1" style={{ color: "var(--kb-on-navy)" }}>
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
  );
}
