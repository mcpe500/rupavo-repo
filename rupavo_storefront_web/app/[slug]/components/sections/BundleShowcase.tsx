'use client';

import { BundleShowcaseSection, Product, Theme, VisualStyle } from '../../types/storefront';

interface BundleShowcaseProps {
    section: BundleShowcaseSection;
    products: Product[];
    theme: Theme;
    visualStyle: VisualStyle;
}

export function BundleShowcase({ section, products, theme, visualStyle }: BundleShowcaseProps) {
    // Helper to get product by ID
    const getProduct = (id: string) => products.find(p => p.id === id);

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.bundles.map((bundle, index) => (
                    <div
                        key={index}
                        className="rounded-xl overflow-hidden"
                        style={{
                            backgroundColor: theme.surface_color,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        {/* Bundle Products Preview */}
                        <div className="flex overflow-x-auto p-4 gap-2 bg-gray-50">
                            {bundle.product_ids.slice(0, 4).map((productId, i) => {
                                const product = getProduct(productId);
                                return (
                                    <div
                                        key={i}
                                        className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden"
                                    >
                                        {product?.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-2xl">📦</span>
                                        )}
                                    </div>
                                );
                            })}
                            {bundle.product_ids.length > 4 && (
                                <div
                                    className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center font-bold"
                                    style={{
                                        backgroundColor: theme.primary_color + '20',
                                        color: theme.primary_color,
                                    }}
                                >
                                    +{bundle.product_ids.length - 4}
                                </div>
                            )}
                        </div>

                        {/* Bundle Info */}
                        <div className="p-4">
                            <h3
                                className="font-bold text-lg mb-1"
                                style={{ color: theme.text_primary }}
                            >
                                {bundle.name}
                            </h3>
                            <p
                                className="text-sm mb-3"
                                style={{ color: theme.text_secondary }}
                            >
                                {bundle.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <span
                                    className="font-bold text-xl"
                                    style={{ color: theme.primary_color }}
                                >
                                    Rp {bundle.bundle_price.toLocaleString('id-ID')}
                                </span>
                                <button
                                    className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
                                    style={{ backgroundColor: theme.secondary_color }}
                                >
                                    Beli Paket
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
