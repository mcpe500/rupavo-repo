'use client';

import { AboutUsSection, Theme, VisualStyle } from '../../types/storefront';

interface AboutUsProps {
    section: AboutUsSection;
    theme: Theme;
    visualStyle: VisualStyle;
}

export function AboutUs({ section, theme, visualStyle }: AboutUsProps) {
    const hasImage = !!section.image_url;

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

            <div className={`${hasImage ? 'grid md:grid-cols-2 gap-8 items-center' : ''}`}>
                {hasImage && (
                    <div className="order-2 md:order-1">
                        <img
                            src={section.image_url!}
                            alt="Tentang Kami"
                            className="w-full h-64 md:h-80 object-cover rounded-xl"
                        />
                    </div>
                )}
                <div className={hasImage ? 'order-1 md:order-2' : 'max-w-3xl mx-auto text-center'}>
                    <p
                        className="text-lg leading-relaxed"
                        style={{ color: theme.text_secondary }}
                    >
                        {section.content}
                    </p>
                </div>
            </div>
        </div>
    );
}
