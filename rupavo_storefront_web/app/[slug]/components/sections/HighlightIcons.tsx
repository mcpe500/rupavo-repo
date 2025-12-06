'use client';

import { HighlightIconsSection, Theme, VisualStyle } from '../../types/storefront';

interface HighlightIconsProps {
    section: HighlightIconsSection;
    theme: Theme;
    visualStyle: VisualStyle;
}

export function HighlightIcons({ section, theme, visualStyle }: HighlightIconsProps) {
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((item, index) => (
                    <div
                        key={index}
                        className="text-center p-6"
                    >
                        <div
                            className="text-4xl mb-4 inline-block p-4 rounded-full"
                            style={{
                                backgroundColor: `${theme.primary_color}15`,
                            }}
                        >
                            {item.icon}
                        </div>
                        <h3
                            className="font-semibold text-lg mb-2"
                            style={{ color: theme.text_primary }}
                        >
                            {item.title}
                        </h3>
                        <p
                            className="text-sm"
                            style={{ color: theme.text_secondary }}
                        >
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
