'use client';

import { FAQSection, Theme } from '../../types/storefront';
import { useState } from 'react';

interface FAQProps {
    section: FAQSection;
    theme: Theme;
}

export function FAQ({ section, theme }: FAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

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

            <div className="space-y-3">
                {section.items.map((item, index) => (
                    <div
                        key={index}
                        className="rounded-lg overflow-hidden"
                        style={{
                            backgroundColor: theme.surface_color,
                            border: `1px solid ${theme.border_color || '#e5e7eb'}`,
                        }}
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full flex items-center justify-between p-4 text-left"
                        >
                            <span
                                className="font-medium"
                                style={{ color: theme.text_primary }}
                            >
                                {item.question}
                            </span>
                            <span
                                className="text-xl transition-transform"
                                style={{
                                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0)',
                                }}
                            >
                                ▼
                            </span>
                        </button>
                        {openIndex === index && (
                            <div
                                className="px-4 pb-4"
                                style={{ color: theme.text_secondary }}
                            >
                                {item.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
