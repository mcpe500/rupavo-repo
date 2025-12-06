'use client';

import { TipsListSection, Theme } from '../../types/storefront';

interface TipsListProps {
    section: TipsListSection;
    theme: Theme;
}

export function TipsList({ section, theme }: TipsListProps) {
    return (
        <div className="max-w-3xl mx-auto">
            {section.title && (
                <h2
                    className="text-2xl md:text-3xl font-bold text-center mb-8"
                    style={{ color: theme.text_primary }}
                >
                    {section.title}
                </h2>
            )}

            <div
                className="rounded-xl p-6"
                style={{
                    backgroundColor: theme.primary_color + '10',
                    border: `1px solid ${theme.primary_color}30`,
                }}
            >
                <ul className="space-y-3">
                    {section.items.map((tip, index) => (
                        <li
                            key={index}
                            className="flex items-start gap-3"
                        >
                            <span
                                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{
                                    backgroundColor: theme.primary_color,
                                    color: '#ffffff',
                                }}
                            >
                                {index + 1}
                            </span>
                            <span style={{ color: theme.text_primary }}>{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
