'use client';

import { PricingTableSection, Theme, VisualStyle } from '../../types/storefront';

interface PricingTableProps {
    section: PricingTableSection;
    theme: Theme;
    visualStyle: VisualStyle;
}

export function PricingTable({ section, theme }: PricingTableProps) {
    return (
        <div className="max-w-5xl mx-auto">
            {section.title && (
                <h2
                    className="text-2xl md:text-3xl font-bold text-center mb-8"
                    style={{ color: theme.text_primary }}
                >
                    {section.title}
                </h2>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {section.plans.map((plan, index) => (
                    <div
                        key={index}
                        className="rounded-xl p-6 transition-transform hover:scale-105"
                        style={{
                            backgroundColor: theme.surface_color,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                            outline: plan.highlight ? `2px solid ${theme.primary_color}` : 'none',
                        }}
                    >
                        {plan.highlight && (
                            <span
                                className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
                                style={{
                                    backgroundColor: theme.primary_color,
                                    color: '#ffffff',
                                }}
                            >
                                Populer
                            </span>
                        )}

                        <h3
                            className="font-bold text-xl mb-2"
                            style={{ color: theme.text_primary }}
                        >
                            {plan.name}
                        </h3>

                        <div className="mb-4">
                            <span
                                className="text-3xl font-bold"
                                style={{ color: theme.primary_color }}
                            >
                                Rp {plan.price.toLocaleString('id-ID')}
                            </span>
                        </div>

                        {plan.description && (
                            <p
                                className="text-sm mb-4"
                                style={{ color: theme.text_secondary }}
                            >
                                {plan.description}
                            </p>
                        )}

                        <ul className="space-y-2 mb-6">
                            {plan.features.map((feature, i) => (
                                <li
                                    key={i}
                                    className="flex items-center gap-2 text-sm"
                                    style={{ color: theme.text_primary }}
                                >
                                    <span style={{ color: theme.primary_color }}>✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            className="w-full py-3 rounded-lg font-semibold transition-colors"
                            style={{
                                backgroundColor: plan.highlight ? theme.primary_color : theme.surface_color,
                                color: plan.highlight ? '#ffffff' : theme.primary_color,
                                border: `2px solid ${theme.primary_color}`,
                            }}
                        >
                            Pilih Paket
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
