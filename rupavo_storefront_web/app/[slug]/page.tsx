import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

type RootSlugPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

type Shop = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    tagline: string | null;
    business_type: string | null;
};

type Product = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
};

type StorefrontLayout = {
    id: string;
    shop_id: string;
    theme: {
        mode?: string;
        primary_color?: string;
        secondary_color?: string;
        background_color?: string;
        accent_style?: string;
    };
    layout: {
        hero?: {
            title?: string;
            subtitle?: string;
            call_to_action_label?: string;
            highlight_badge?: string;
        };
        sections?: Array<{
            type: string;
            title?: string;
            items?: string[];
            product_ids?: string[];
            layout?: string;
        }>;
        footer?: {
            show_contact?: boolean;
            contact_text?: string;
            location_text?: string;
        };
    };
};

export default async function RootSlugPage({ params }: RootSlugPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // Fetch shop by slug
    const { data: shop, error: shopError } = await supabase
        .from("shops")
        .select("id, name, slug, description, tagline, business_type")
        .eq("slug", slug)
        .single<Shop>();

    if (shopError || !shop) {
        notFound();
    }

    // Fetch products for this shop
    const { data: products } = await supabase
        .from("products")
        .select("id, name, description, price, image_url")
        .eq("shop_id", shop.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(20)
        .returns<Product[]>();

    // Fetch storefront layout
    const { data: storefrontLayout } = await supabase
        .from("storefront_layouts")
        .select("*")
        .eq("shop_id", shop.id)
        .eq("is_active", true)
        .single<StorefrontLayout>();

    const theme = storefrontLayout?.theme || {
        primary_color: "#136F63",
        secondary_color: "#FF7A3C",
        background_color: "#F8FAFC",
    };

    const layout = storefrontLayout?.layout || {};
    const hero = layout.hero || {};
    const sections = layout.sections || [];
    const footer = layout.footer || {};

    return (
        <main
            className="min-h-screen"
            style={{ backgroundColor: theme.background_color }}
        >
            {/* Hero Section */}
            <section
                className="py-16 px-4"
                style={{ backgroundColor: theme.primary_color }}
            >
                <div className="max-w-5xl mx-auto text-center text-white">
                    {hero.highlight_badge && (
                        <span className="inline-block px-3 py-1 mb-4 text-sm font-semibold rounded-full bg-white/20">
                            {hero.highlight_badge}
                        </span>
                    )}
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        {hero.title || shop.name}
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">
                        {hero.subtitle || shop.tagline || shop.description || "Selamat datang di toko kami!"}
                    </p>
                    {hero.call_to_action_label && (
                        <a
                            href="#products"
                            className="inline-block px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
                            style={{ backgroundColor: theme.secondary_color, color: "white" }}
                        >
                            {hero.call_to_action_label}
                        </a>
                    )}
                </div>
            </section>

            {/* Sections */}
            {sections.map((section, idx) => (
                <section key={idx} className="py-12 px-4">
                    <div className="max-w-5xl mx-auto">
                        {section.type === "highlight_strip" && section.items && (
                            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                                {section.items.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm"
                                    >
                                        <span className="text-green-600">✓</span>
                                        <span className="font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {section.type === "product_grid" && (
                            <div id="products">
                                {section.title && (
                                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                                        {section.title}
                                    </h2>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(products || []).map((product) => (
                                        <div
                                            key={product.id}
                                            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                        >
                                            <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="text-gray-400 text-4xl">📦</div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                                                {product.description && (
                                                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                                                        {product.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <span
                                                        className="font-bold text-lg"
                                                        style={{ color: theme.primary_color }}
                                                    >
                                                        Rp {product.price.toLocaleString("id-ID")}
                                                    </span>
                                                    <button
                                                        className="px-3 py-1.5 rounded-lg text-white text-sm font-medium"
                                                        style={{ backgroundColor: theme.secondary_color }}
                                                    >
                                                        + Keranjang
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {(!products || products.length === 0) && (
                                    <p className="text-center text-gray-500 py-10">
                                        Belum ada produk yang tersedia.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            ))}

            {/* Default products grid if no sections defined */}
            {sections.length === 0 && products && products.length > 0 && (
                <section id="products" className="py-12 px-4">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                            Produk Kami
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-gray-400 text-4xl">📦</div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                                        {product.description && (
                                            <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                                                {product.description}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span
                                                className="font-bold text-lg"
                                                style={{ color: theme.primary_color }}
                                            >
                                                Rp {product.price.toLocaleString("id-ID")}
                                            </span>
                                            <button
                                                className="px-3 py-1.5 rounded-lg text-white text-sm font-medium"
                                                style={{ backgroundColor: theme.secondary_color }}
                                            >
                                                + Keranjang
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer
                className="py-8 px-4 mt-8"
                style={{ backgroundColor: theme.primary_color }}
            >
                <div className="max-w-5xl mx-auto text-center text-white">
                    <h3 className="text-xl font-bold mb-2">{shop.name}</h3>
                    {footer.contact_text && (
                        <p className="opacity-90 mb-1">📞 {footer.contact_text}</p>
                    )}
                    {footer.location_text && (
                        <p className="opacity-90 mb-4">📍 {footer.location_text}</p>
                    )}
                    <p className="text-sm opacity-70">
                        Powered by <Link href="/" className="underline hover:opacity-100">Rupavo</Link>
                    </p>
                </div>
            </footer>
        </main>
    );
}
