'use client';

import { BannerCountdownSection, Theme } from '../../types/storefront';
import { useEffect, useState } from 'react';

interface BannerCountdownProps {
    section: BannerCountdownSection;
    theme: Theme;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export function BannerCountdown({ section, theme }: BannerCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const endDate = new Date(section.end_date).getTime();
            const now = new Date().getTime();
            const difference = endDate - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [section.end_date]);

    return (
        <div
            className="py-10 px-4"
            style={{
                backgroundColor: theme.secondary_color,
                color: '#ffffff',
            }}
        >
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {section.title}
                </h2>
                {section.subtitle && (
                    <p className="text-lg opacity-90 mb-6">
                        {section.subtitle}
                    </p>
                )}

                {/* Countdown Timer */}
                <div className="flex justify-center gap-4 mb-6">
                    {[
                        { value: timeLeft.days, label: 'Hari' },
                        { value: timeLeft.hours, label: 'Jam' },
                        { value: timeLeft.minutes, label: 'Menit' },
                        { value: timeLeft.seconds, label: 'Detik' },
                    ].map((item, index) => (
                        <div key={index} className="text-center">
                            <div
                                className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-2xl md:text-3xl font-bold rounded-lg"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                }}
                            >
                                {item.value.toString().padStart(2, '0')}
                            </div>
                            <div className="text-xs mt-1 opacity-80">{item.label}</div>
                        </div>
                    ))}
                </div>

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
