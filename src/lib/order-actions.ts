"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Places an order from the client's cart. Re-fetches real menu_items prices
 * and computes the subtotal itself here — never trust a client-supplied
 * price or total, since this is called directly from client cart state.
 *
 * Returns the new order id rather than calling redirect() itself: this is
 * invoked from inside a client-side try/catch (to surface errors on the
 * button), and redirect() throws internally, which a wrapping catch would
 * swallow as a failure. The caller navigates after a successful return.
 */
export async function placeOrder(
  kitchenId: string,
  items: { menuItemId: string; quantity: number }[]
): Promise<{ orderId: string }> {
  if (items.length === 0) throw new Error("Your cart is empty.");
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Invalid item quantity in cart.");
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to place an order.");

  const { data: kitchen } = await supabase
    .from("kitchens")
    .select("id, is_live")
    .eq("id", kitchenId)
    .maybeSingle();
  if (!kitchen || !kitchen.is_live) throw new Error("This kitchen isn't accepting orders right now.");

  const { data: menuItems, error: menuError } = await supabase
    .from("menu_items")
    .select("id, name, price")
    .eq("kitchen_id", kitchenId)
    .in(
      "id",
      items.map((i) => i.menuItemId)
    );
  if (menuError) throw new Error(`Couldn't load menu: ${menuError.message}`);

  const menuById = new Map((menuItems ?? []).map((m) => [m.id, m]));
  const orderItems = items.map((i) => {
    const menuItem = menuById.get(i.menuItemId);
    if (!menuItem) throw new Error("One of the items in your cart is no longer available.");
    return { menu_item_id: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: i.quantity };
  });

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ customer_id: user.id, kitchen_id: kitchenId, subtotal })
    .select("id")
    .single();
  if (orderError) throw new Error(`Couldn't place order: ${orderError.message}`);

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));
  if (itemsError) throw new Error(`Couldn't save order items: ${itemsError.message}`);

  return { orderId: order.id };
}
