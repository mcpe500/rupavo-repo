'use client';

import { CategoryTilesSection, Theme, VisualStyle } from '../../types/storefront';

interface CategoryTilesProps {
    section: CategoryTilesSection;
    theme: Theme;
    visualStyle: VisualStyle;
}

export function CategoryTiles({ section, theme, visualStyle }: CategoryTilesProps) {
    const gridCols = {
        'grid-3': 'grid-cols-2 md:grid-cols-3',
        'grid-4': 'grid-cols-2 md:grid-cols-4',
        'scroll': 'flex overflow-x-auto',
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

            <div className={`${gridCols[section.layout] || 'grid-cols-2 md:grid-cols-4'} grid gap-4`}>
                {section.categories.map((category, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center p-6 rounded-xl cursor-pointer transition-all hover:scale-105"
                        style={{
                            backgroundColor: theme.surface_color,
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                        }}
                    >
                        <span className="text-4xl mb-3">{category.icon}</span>
                        <h3
                            className="font-semibold text-center"
                            style={{ color: theme.text_primary }}
                        >
                            {category.name}
                        </h3>
                        {category.product_count !== undefined && (
                            <span
                                className="text-sm mt-1"
                                style={{ color: theme.text_secondary }}
                            >
                                {category.product_count} produk
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
