'use client';

import { SocialProofSection, Theme } from '../../types/storefront';

interface SocialProofProps {
    section: SocialProofSection;
    theme: Theme;
}

export function SocialProof({ section, theme }: SocialProofProps) {
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {section.stats.map((stat, index) => (
                    <div key={index} className="text-center p-4">
                        <div
                            className="text-3xl md:text-4xl font-bold mb-1"
                            style={{ color: theme.primary_color }}
                        >
                            {stat.value}
                        </div>
                        <div
                            className="text-sm"
                            style={{ color: theme.text_secondary }}
                        >
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
