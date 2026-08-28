export function CartButton({ count = 0 }: { count?: number }) {
  if (count <= 0) return null;
  return (
    <button
      aria-label={`Cart, ${count} items`}
      className="fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full shadow-xl sm:right-8"
      style={{ background: "linear-gradient(135deg, var(--kb-purple) 0%, var(--kb-purple-deep) 100%)" }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1.5" fill="white" stroke="none" />
        <circle cx="19" cy="21" r="1.5" fill="white" stroke="none" />
        <path d="M2.5 3h2l2.4 12.4a2 2 0 002 1.6h8.2a2 2 0 002-1.7L21 8H6" />
      </svg>
      <span
        className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white"
        style={{ background: "var(--kb-danger)" }}
      >
        {count}
      </span>
    </button>
  );
}
