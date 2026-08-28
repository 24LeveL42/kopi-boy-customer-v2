"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterClick?: () => void;
}

export function SearchBar({ value, onChange, onFilterClick }: SearchBarProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white py-3.5 pl-4 pr-3 shadow-lg">
      <svg
        className="shrink-0"
        style={{ color: "var(--kb-ink-soft)" }}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by location..."
        aria-label="Search merchants"
        className="w-full bg-transparent text-[15px] outline-none placeholder:text-[var(--kb-ink-soft)]"
        style={{ color: "var(--kb-ink)" }}
      />
      <span className="h-6 w-px shrink-0" style={{ background: "var(--kb-navy-line)" }} />
      <button
        type="button"
        onClick={onFilterClick}
        aria-label="Filters"
        className="shrink-0 p-1"
        style={{ color: "var(--kb-ink)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="20" y2="12" />
          <line x1="12" y1="18" x2="20" y2="18" />
          <circle cx="6" cy="12" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="9" cy="18" r="1.6" fill="currentColor" stroke="none" />
        </svg>
      </button>
    </div>
  );
}
