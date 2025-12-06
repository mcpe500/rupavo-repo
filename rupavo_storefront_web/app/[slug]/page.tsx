import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { HeroSection } from "./components/HeroSection";
import { SectionRenderer } from "./components/SectionRenderer";
import { FooterSection } from "./components/FooterSection";
import type {
    StorefrontLayout,
    Theme,
    VisualStyle,
    Hero,
    Section,
    Footer,
    Product,
    Shop
} from "./types/storefront";

type RootSlugPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

// Default theme for fallback
const defaultTheme: Theme = {
    mode: 'light',
    color_palette: 'fresh-green',
    tone: 'family-friendly',
    primary_color: '#136F63',
    secondary_color: '#FF7A3C',
    accent_color: '#FCD34D',
    background_color: '#F8FAFC',
    surface_color: '#FFFFFF',
    alternative_bg: '#F1F5F9',
    text_primary: '#1F2937',
    text_secondary: '#6B7280',
    gradient_style: 'none',
    background_pattern: 'none',
};

const defaultVisualStyle: VisualStyle = {
    border_radius: 'lg',
    shadows: 'md',
    animations: 'subtle',
    spacing: 'normal',
    composition: 'boxed',
    divider_style: 'none',
    card_style: 'soft',
    image_style: 'rounded',
    section_transition: 'straight',
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

    // Fetch storefront layout
    const { data: storefrontLayout } = await supabase
        .from("storefront_layouts")
        .select("*")
        .eq("shop_id", shop.id)
        .eq("is_active", true)
        .single();

    // Fetch products
    const { data: products } = await supabase
        .from("products")
        .select("id, name, description, price, image_url")
        .eq("shop_id", shop.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(50)
        .returns<Product[]>();

    // Parse layout data with proper typing
    const layout = storefrontLayout as StorefrontLayout | null;
    console.log({layout})
    const theme: Theme = layout?.theme || defaultTheme;
    const visualStyle: VisualStyle = layout?.visual_style || defaultVisualStyle;
    const hero: Hero | null = layout?.hero || null;
    const sections: Section[] = layout?.sections || [];
    const floatingElements: Section[] = layout?.floating_elements || [];
    const footer: Footer | null = layout?.footer || null;

    return (
        <main
            className="min-h-screen"
            style={{
                backgroundColor: theme.background_color,
                fontFamily: layout?.typography?.body_font || 'Inter, sans-serif',
            }}
        >
            {/* Announcement Bar (if present in sections) */}
            {sections.filter(s => s.type === 'announcement_bar').map((section, i) => (
                <SectionRenderer
                    key={`announcement-${i}`}
                    section={section}
                    products={products || []}
                    theme={theme}
                    visualStyle={visualStyle}
                />
            ))}

            {/* Navbar */}
            <nav
                className="sticky top-0 z-40 shadow-sm"
                style={{ backgroundColor: theme.surface_color }}
            >
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1
                        className="text-xl font-bold"
                        style={{ color: theme.primary_color }}
                    >
                        {shop.name}
                    </h1>
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                        ← Kembali
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            {hero ? (
                <HeroSection
                    hero={hero}
                    theme={theme}
                    visualStyle={visualStyle}
                    shopName={shop.name}
                />
            ) : (
                // Default hero if no layout
                <section
                    className="py-16 px-4 text-center"
                    style={{ backgroundColor: theme.primary_color }}
                >
                    <div className="max-w-3xl mx-auto text-white">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">{shop.name}</h1>
                        <p className="text-lg opacity-90">
                            {shop.tagline || shop.description || "Selamat datang di toko kami!"}
                        </p>
                    </div>
                </section>
            )}

            {/* Dynamic Sections */}
            {sections
                .filter(s => s.type !== 'announcement_bar' && s.type !== 'whatsapp_float' && s.type !== 'floating_badge')
                .map((section, index) => (
                    <SectionRenderer
                        key={section.id || `section-${index}`}
                        section={section}
                        products={products || []}
                        theme={theme}
                        visualStyle={visualStyle}
                        isAlternate={index % 2 === 1}
                    />
                ))
            }

            {/* Fallback: Default product grid if no sections */}
            {sections.length === 0 && products && products.length > 0 && (
                <section className="py-12 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl font-bold text-center mb-8">Produk Kami</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                >
                                    <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-gray-400 text-5xl">📦</div>
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
                                                className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                                                style={{ backgroundColor: theme.secondary_color }}
                                            >
                                                Beli
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
            {footer ? (
                <FooterSection
                    footer={footer}
                    theme={theme}
                    shopName={shop.name}
                />
            ) : (
                <footer
                    className="py-8 px-4 mt-8"
                    style={{ backgroundColor: theme.mode === 'dark' ? '#111' : '#111827' }}
                >
                    <div className="max-w-6xl mx-auto text-center text-white">
                        <h3 className="text-xl font-bold mb-2">{shop.name}</h3>
                        <p className="text-sm opacity-70">
                            Powered by <Link href="/" className="underline">Rupavo</Link>
                        </p>
                    </div>
                </footer>
            )}

            {/* Floating Elements */}
            {floatingElements.map((element, index) => (
                <SectionRenderer
                    key={`floating-${index}`}
                    section={element}
                    products={products || []}
                    theme={theme}
                    visualStyle={visualStyle}
                />
            ))}

            {/* WhatsApp Float from sections */}
            {sections.filter(s => s.type === 'whatsapp_float').map((section, i) => (
                <SectionRenderer
                    key={`wa-${i}`}
                    section={section}
                    products={products || []}
                    theme={theme}
                    visualStyle={visualStyle}
                />
            ))}
        </main>
    );
}
