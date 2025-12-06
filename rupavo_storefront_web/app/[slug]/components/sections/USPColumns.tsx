'use client';

import { USPColumnsSection, Theme, VisualStyle } from '../../types/storefront';

interface USPColumnsProps {
    section: USPColumnsSection;
    theme: Theme;
    visualStyle: VisualStyle;
}

export function USPColumns({ section, theme, visualStyle }: USPColumnsProps) {
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {section.columns.map((column, index) => (
                    <div key={index} className="text-center">
                        {column.icon && (
                            <div
                                className="text-3xl mb-3"
                            >
                                {column.icon}
                            </div>
                        )}
                        <h3
                            className="font-bold text-xl mb-2"
                            style={{ color: theme.primary_color }}
                        >
                            {column.title}
                        </h3>
                        <p
                            className="text-base"
                            style={{ color: theme.text_secondary }}
                        >
                            {column.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
