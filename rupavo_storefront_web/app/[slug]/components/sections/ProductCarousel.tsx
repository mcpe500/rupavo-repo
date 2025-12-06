'use client';

import { ProductCarouselSection, Product, Theme, VisualStyle } from '../../types/storefront';
import { useState, useRef } from 'react';

interface ProductCarouselProps {
    section: ProductCarouselSection;
    products: Product[];
    theme: Theme;
    visualStyle: VisualStyle;
}

export function ProductCarousel({ section, products, theme, visualStyle }: ProductCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    // Filter products or use all
    const displayProducts = section.product_ids?.length
        ? products.filter(p => section.product_ids!.includes(p.id))
        : section.auto_fill
            ? products.slice(0, section.max_items || 8)
            : products;

    const borderRadius = getBorderRadius(visualStyle.border_radius);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const scrollAmount = 300;
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
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

            <div className="relative">
                {/* Left Arrow */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors"
                        style={{ backgroundColor: theme.surface_color }}
                    >
                        ←
                    </button>
                )}

                {/* Products Container */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {displayProducts.map((product) => (
                        <div
                            key={product.id}
                            className="flex-none w-64 overflow-hidden transition-transform hover:scale-[1.02]"
                            style={{
                                backgroundColor: theme.surface_color,
                                borderRadius: borderRadius,
                                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
                            }}
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
                                <h3
                                    className="font-semibold mb-1 truncate"
                                    style={{ color: theme.text_primary }}
                                >
                                    {product.name}
                                </h3>
                                <span
                                    className="font-bold"
                                    style={{ color: theme.primary_color }}
                                >
                                    Rp {product.price.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Arrow */}
                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors"
                        style={{ backgroundColor: theme.surface_color }}
                    >
                        →
                    </button>
                )}
            </div>
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
