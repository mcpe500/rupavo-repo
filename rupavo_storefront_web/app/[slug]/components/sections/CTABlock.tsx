'use client';

import { Theme } from '../../types/storefront';

// Flexible CTA section type
interface CTABlockSection {
    type: 'cta_block';
    title?: string;
    subtitle?: string;
    // Both formats supported
    cta_label?: string;
    cta_url?: string;
    call_to_action_label?: string;
    call_to_action_url?: string;
}

interface CTABlockProps {
    section: CTABlockSection;
    theme: Theme;
}

export function CTABlock({ section, theme }: CTABlockProps) {
    // Support both 'cta_label' and 'call_to_action_label'
    const ctaLabel = section.cta_label || section.call_to_action_label || 'Selengkapnya';
    const ctaUrl = section.cta_url || section.call_to_action_url || '#';

    return (
        <div
            className="py-16 px-4"
            style={{
                backgroundColor: theme.primary_color,
                color: '#ffffff',
            }}
        >
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl md:text-4xl font-bold mb-4">
                    {section.title}
                </h2>
                {section.subtitle && (
                    <p className="text-lg opacity-90 mb-8">
                        {section.subtitle}
                    </p>
                )}
                <a
                    href={ctaUrl}
                    className="inline-block px-10 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg"
                    style={{
                        backgroundColor: '#ffffff',
                        color: theme.primary_color,
                    }}
                >
                    {ctaLabel}
                </a>
            </div>
        </div>
    );
}
