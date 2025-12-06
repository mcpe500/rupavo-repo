'use client';

import { Theme } from '../../types/storefront';

// Flexible section type that accepts both AI formats
interface HighlightItem {
    icon?: string;
    text?: string;
}

interface HighlightStripSection {
    type: 'highlight_strip';
    title?: string;
    items: (string | HighlightItem)[];
}

interface HighlightStripProps {
    section: HighlightStripSection;
    theme: Theme;
}

export function HighlightStrip({ section, theme }: HighlightStripProps) {
    // Normalize items to handle both string[] and {icon, text}[] formats
    const normalizedItems = section.items.map((item) => {
        if (typeof item === 'string') {
            return { icon: '✓', text: item };
        }
        return { icon: item.icon || '✓', text: item.text || '' };
    });

    return (
        <div
            className="py-4 overflow-hidden"
            style={{
                backgroundColor: theme.primary_color,
                color: '#ffffff',
            }}
        >
            <div className="max-w-6xl mx-auto px-4">
                {section.title && (
                    <h3 className="text-center font-semibold mb-3 opacity-90">
                        {section.title}
                    </h3>
                )}
                <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm md:text-base">
                    {normalizedItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className="opacity-80">{item.icon}</span>
                            <span>{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
