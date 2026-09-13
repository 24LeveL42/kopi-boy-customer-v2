"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white py-3.5 pl-4 pr-4 shadow-lg">
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
    </div>
  );
}
