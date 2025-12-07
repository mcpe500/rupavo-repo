"use client";

import { CartProvider, CartDrawer, CartIcon } from "@/components/cart";
import { ShopProvider } from "@/components/shop";

interface ShopLayoutClientProps {
  children: React.ReactNode;
  shop: {
    id: string;
    name: string;
    slug: string;
  };
}

export function ShopLayoutClient({ children, shop }: ShopLayoutClientProps) {
  return (
    <CartProvider>
      <ShopProvider shop={shop}>
        {children}
        <CartDrawer />
      </ShopProvider>
    </CartProvider>
  );
}

export { CartIcon };
