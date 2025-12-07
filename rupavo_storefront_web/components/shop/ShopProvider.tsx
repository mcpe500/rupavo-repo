"use client";

import { createContext, useContext } from "react";

export interface ShopContextType {
  id: string;
  name: string;
  slug: string;
}

const ShopContext = createContext<ShopContextType | null>(null);

export function ShopProvider({
  children,
  shop,
}: {
  children: React.ReactNode;
  shop: ShopContextType;
}) {
  return <ShopContext.Provider value={shop}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
