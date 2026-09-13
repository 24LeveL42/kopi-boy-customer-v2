"use client";

import { useCart } from "@/lib/cart-context";

export function MenuItemRow({
  kitchenId,
  kitchenName,
  item,
}: {
  kitchenId: string;
  kitchenName: string;
  item: { id: string; name: string; price: number };
}) {
  const { cart, addItem, setQuantity } = useCart();
  const quantity = cart?.kitchenId === kitchenId ? cart.items.find((i) => i.menuItemId === item.id)?.quantity ?? 0 : 0;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white p-3 shadow" style={{ color: "var(--kb-ink)" }}>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{item.name}</p>
        <p className="text-sm" style={{ color: "var(--kb-ink-soft)" }}>
          ${item.price.toFixed(2)}
        </p>
      </div>

      {quantity === 0 ? (
        <button
          onClick={() => addItem(kitchenId, kitchenName, { menuItemId: item.id, name: item.name, price: item.price })}
          className="shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold text-white"
          style={{ background: "var(--kb-green-deep)" }}
        >
          Add
        </button>
      ) : (
        <div className="flex shrink-0 items-center gap-2">
          <button
            aria-label={`Decrease ${item.name} quantity`}
            onClick={() => setQuantity(item.id, quantity - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold"
            style={{ background: "var(--kb-cream)" }}
          >
            &minus;
          </button>
          <span className="w-4 text-center text-sm font-semibold">{quantity}</span>
          <button
            aria-label={`Increase ${item.name} quantity`}
            onClick={() => setQuantity(item.id, quantity + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: "var(--kb-green-deep)" }}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
