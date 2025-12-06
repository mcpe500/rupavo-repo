'use client';

import { NewsletterSection, Theme, VisualStyle } from '../../types/storefront';
import { useState } from 'react';

interface NewsletterProps {
    section: NewsletterSection;
    theme: Theme;
    visualStyle: VisualStyle;
}

export function Newsletter({ section, theme, visualStyle }: NewsletterProps) {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would handle the subscription
        setSubmitted(true);
    };

    return (
        <div className="max-w-2xl mx-auto text-center">
            {section.title && (
                <h2
                    className="text-2xl md:text-3xl font-bold mb-4"
                    style={{ color: theme.text_primary }}
                >
                    {section.title}
                </h2>
            )}

            {section.subtitle && (
                <p
                    className="mb-6"
                    style={{ color: theme.text_secondary }}
                >
                    {section.subtitle}
                </p>
            )}

            {!submitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={section.placeholder || 'Email atau nomor WhatsApp'}
                        required
                        className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                        style={{
                            borderColor: theme.border_color || '#e5e7eb',
                            backgroundColor: theme.surface_color,
                        }}
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 rounded-lg font-semibold text-white transition-transform hover:scale-105"
                        style={{ backgroundColor: theme.primary_color }}
                    >
                        Daftar
                    </button>
                </form>
            ) : (
                <div
                    className="p-4 rounded-lg"
                    style={{
                        backgroundColor: theme.primary_color + '15',
                        color: theme.primary_color,
                    }}
                >
                    ✓ Terima kasih sudah mendaftar!
                </div>
            )}
        </div>
    );
}
