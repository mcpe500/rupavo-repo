'use client';

import { Theme } from '../../types/storefront';

// Flexible Banner Promo section type
interface BannerPromoSection {
    type: 'banner_promo';
    title?: string;
    subtitle?: string;
    description?: string; // AI sometimes uses 'description' instead of 'subtitle'
    cta_label?: string;
    cta_url?: string;
    background_color?: string;
    text_color?: string;
}

interface BannerPromoProps {
    section: BannerPromoSection;
    theme: Theme;
}

export function BannerPromo({ section, theme }: BannerPromoProps) {
    const bgColor = section.background_color || theme.secondary_color;
    const textColor = section.text_color || '#ffffff';

    // Accept both 'subtitle' and 'description'
    const subtitle = section.subtitle || section.description;

    return (
        <div
            className="py-12 px-4"
            style={{
                backgroundColor: bgColor,
                color: textColor,
            }}
        >
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                    {section.title}
                </h2>
                {subtitle && (
                    <p className="text-lg md:text-xl opacity-90 mb-6">
                        {subtitle}
                    </p>
                )}
                {section.cta_label && (
                    <a
                        href={section.cta_url || '#'}
                        className="inline-block px-8 py-3 rounded-lg font-semibold transition-transform hover:scale-105"
                        style={{
                            backgroundColor: theme.accent_color || '#ffffff',
                            color: theme.text_primary,
                        }}
                    >
                        {section.cta_label}
                    </a>
                )}
            </div>
        </div>
    );
}
