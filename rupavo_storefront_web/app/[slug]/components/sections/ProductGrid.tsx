'use client';

import { ProductGridSection, Product, Theme, VisualStyle } from '../../types/storefront';
import { useCart } from '@/components/cart';
import { useShop } from '@/components/shop';

interface ProductGridProps {
    section: ProductGridSection;
    products: Product[];
    theme: Theme;
    visualStyle: VisualStyle;
}

export function ProductGrid({ section, products, theme, visualStyle }: ProductGridProps) {
    const { addToCart } = useCart();
    const shop = useShop();
    const borderRadius = getBorderRadius(visualStyle.border_radius);
    const shadow = getShadow(visualStyle.shadows);

    // Filter products by IDs if specified, otherwise show all
    const displayProducts = section.product_ids?.length
        ? products.filter(p => section.product_ids!.includes(p.id))
        : products;

    // Grid columns based on layout
    const gridCols = {
        '2-col': 'grid-cols-1 sm:grid-cols-2',
        '3-col': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        '4-col': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
        'list': 'grid-cols-1',
    };

    // Card styles based on visual style
    const cardStyle = getCardStyle(visualStyle.card_style, theme);

    const handleAddToCart = (product: Product) => {
        addToCart(
            {
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url ?? undefined,
            },
            shop.id,
            shop.slug
        );
    };

    return (
        <div className="max-w-6xl mx-auto">
            {section.title && (
                <h2
                    className="text-2xl md:text-3xl font-bold text-center mb-8"
                    style={{ color: theme.text_primary }}
                >
                    {section.title}
                </h2>
            )}

            {displayProducts.length > 0 ? (
                <div className={`grid ${gridCols[section.layout || '3-col']} gap-6`}>
                    {displayProducts.map((product) => (
                        <div
                            key={product.id}
                            className="overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                            style={{
                                ...cardStyle,
                                borderRadius: borderRadius,
                                boxShadow: shadow,
                            }}
                        >
                            <div
                                className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden"
                                style={{
                                    aspectRatio: getAspectRatio(section.image_ratio),
                                }}
                            >
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
                                <h3
                                    className="font-semibold text-lg mb-1"
                                    style={{ color: theme.text_primary }}
                                >
                                    {product.name}
                                </h3>
                                {product.description && (
                                    <p
                                        className="text-sm line-clamp-2 mb-3"
                                        style={{ color: theme.text_secondary }}
                                    >
                                        {product.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between">
                                    <span
                                        className="font-bold text-lg"
                                        style={{ color: theme.primary_color }}
                                    >
                                        Rp {product.price.toLocaleString('id-ID')}
                                    </span>
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="px-4 py-2 text-white text-sm font-medium transition-colors hover:opacity-90"
                                        style={{
                                            backgroundColor: theme.secondary_color,
                                            borderRadius: borderRadius,
                                        }}
                                    >
                                        Beli
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-10">
                    Belum ada produk yang tersedia.
                </p>
            )}
        </div>
    );
}

function getBorderRadius(radius: VisualStyle['border_radius']): string {
    const map = {
        'none': '0',
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        'full': '1.5rem',
    };
    return map[radius] || '0.5rem';
}

function getShadow(shadow: VisualStyle['shadows']): string {
    const map = {
        'none': 'none',
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        'glow': '0 0 20px rgba(0, 0, 0, 0.1)',
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08)',
    };
    return map[shadow] || 'none';
}

function getCardStyle(style: VisualStyle['card_style'], theme: Theme): React.CSSProperties {
    switch (style) {
        case 'flat':
            return { backgroundColor: theme.surface_color };
        case 'outlined':
            return {
                backgroundColor: theme.surface_color,
                border: `1px solid ${theme.border_color || '#e5e7eb'}`,
            };
        case 'soft':
            return {
                backgroundColor: theme.surface_color,
                boxShadow: '0 2px 15px rgba(0, 0, 0, 0.05)',
            };
        case 'glass':
            return {
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
            };
        case 'elevated':
            return {
                backgroundColor: theme.surface_color,
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            };
        default:
            return { backgroundColor: theme.surface_color };
    }
}

function getAspectRatio(ratio?: string): string {
    switch (ratio) {
        case '1:1': return '1/1';
        case '4:3': return '4/3';
        case '3:4': return '3/4';
        case '16:9': return '16/9';
        default: return '1/1';
    }
}
