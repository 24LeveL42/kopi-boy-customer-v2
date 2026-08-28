"use client";

import { CuisineDef, CuisineType } from "@/lib/types";

interface CuisineFilterProps {
  cuisines: CuisineDef[];
  active: CuisineType | "all";
  onSelect: (id: CuisineType | "all") => void;
}

export function CuisineFilter({ cuisines, active, onSelect }: CuisineFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Cuisine type"
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {cuisines.map((c) => {
        const isActive = c.id === active;
        return (
          <button
            key={c.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(c.id)}
            className="shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors"
            style={
              isActive
                ? { background: "var(--kb-purple)", color: "white" }
                : { background: "var(--kb-navy-raised)", color: "var(--kb-on-navy-soft)", border: "1px solid var(--kb-navy-line)" }
            }
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
