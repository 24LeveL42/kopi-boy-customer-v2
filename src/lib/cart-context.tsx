"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Cart, CartItem } from "@/lib/types-order";

const STORAGE_KEY = "kb-cart";

interface CartContextValue {
  cart: Cart | null;
  addItem: (kitchenId: string, kitchenName: string, item: Omit<CartItem, "quantity">) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Cart lives only in the browser (localStorage) — there's no server-side
 * cart concept until checkout, when the real order gets created. Starts
 * `null` on both server and first client render (localStorage isn't
 * available during SSR) and hydrates right after mount, same tradeoff any
 * localStorage-backed state makes: a brief flash of "empty" is expected.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {
      // Private browsing, blocked storage, etc. — cart just won't persist.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (cart) localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore — see above.
    }
  }, [cart, hydrated]);

  const addItem = useCallback(
    (kitchenId: string, kitchenName: string, item: Omit<CartItem, "quantity">) => {
      if (cart && cart.kitchenId !== kitchenId) {
        const ok = window.confirm(
          `Your cart has items from ${cart.kitchenName}. Adding from ${kitchenName} will clear it. Continue?`
        );
        if (!ok) return;
      }

      setCart((prev) => {
        const base = prev && prev.kitchenId === kitchenId ? prev : { kitchenId, kitchenName, items: [] };
        const existing = base.items.find((i) => i.menuItemId === item.menuItemId);
        const items = existing
          ? base.items.map((i) => (i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + 1 } : i))
          : [...base.items, { ...item, quantity: 1 }];
        return { kitchenId, kitchenName, items };
      });
    },
    [cart]
  );

  const setQuantity = useCallback((menuItemId: string, quantity: number) => {
    setCart((prev) => {
      if (!prev) return prev;
      if (quantity <= 0) {
        const items = prev.items.filter((i) => i.menuItemId !== menuItemId);
        return items.length > 0 ? { ...prev, items } : null;
      }
      return { ...prev, items: prev.items.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i)) };
    });
  }, []);

  const clearCart = useCallback(() => setCart(null), []);

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const subtotal = cart?.items.reduce((sum, i) => sum + i.price * i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{ cart, addItem, setQuantity, clearCart, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
