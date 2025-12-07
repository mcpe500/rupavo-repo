import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CheckoutClient } from "./CheckoutClient";
import { CartProvider } from "@/components/cart";

type CheckoutPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch shop by slug
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  if (shopError || !shop) {
    notFound();
  }

  return (
    <CartProvider>
      <CheckoutClient
        shopSlug={shop.slug}
        shopId={shop.id}
        shopName={shop.name}
      />
    </CartProvider>
  );
}
