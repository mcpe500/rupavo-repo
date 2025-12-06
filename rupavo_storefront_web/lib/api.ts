import { Store } from "@/lib/mock-data";
import { hasEnvVars } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

type ShopRow = {
    id: string;
    owner_id: string | null;
    name: string | null;
    slug: string | null;
    description: string | null;
    tagline: string | null;
    storefront_published: boolean | null;
    style_profile: string | null;
    business_type: string | null;
    created_at: string | null;
    updated_at: string | null;
};

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1508898578281-774ac4893c0c?w=800&auto=format&fit=crop&q=60";

export const getStores = async (): Promise<Store[]> => {
    if (!hasEnvVars) {
        console.warn(
            "Supabase environment variables are missing. Unable to load shops."
        );
        return [];
    }

    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("shops")
            .select(
                "id, owner_id, name, slug, description, tagline, storefront_published, style_profile, business_type, created_at, updated_at"
            )
            .order("created_at", { ascending: false })
            .returns<ShopRow[]>();

        if (error) {
            console.error("Error fetching shops from Supabase:", error);
            return [];
        }

        return (data ?? []).map((shop) => ({
            id: shop.id,
            ownerId: shop.owner_id,
            name: shop.name ?? "Untitled Shop",
            slug: shop.slug ?? shop.id,
            description: shop.description ?? shop.tagline ?? "",
            tagline: shop.tagline,
            published: shop.storefront_published,
            createdAt: shop.created_at,
            updatedAt: shop.updated_at,
            businessType: shop.business_type,
            styleProfile: shop.style_profile,
            imageUrl: FALLBACK_IMAGE,
        }));
    } catch (error) {
        console.error("Unexpected error fetching shops from Supabase:", error);
        return [];
    }
};
