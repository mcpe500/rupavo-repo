'use client';

import { StoryTimelineSection, Theme } from '../../types/storefront';

interface StoryTimelineProps {
    section: StoryTimelineSection;
    theme: Theme;
}

export function StoryTimeline({ section, theme }: StoryTimelineProps) {
    return (
        <div className="max-w-4xl mx-auto">
            {section.title && (
                <h2
                    className="text-2xl md:text-3xl font-bold text-center mb-10"
                    style={{ color: theme.text_primary }}
                >
                    {section.title}
                </h2>
            )}

            <div className="relative">
                {/* Timeline Line */}
                <div
                    className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 transform md:-translate-x-1/2"
                    style={{ backgroundColor: theme.primary_color + '30' }}
                />

                {/* Timeline Items */}
                {section.items.map((item, index) => (
                    <div
                        key={index}
                        className={`relative flex items-start mb-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                            }`}
                    >
                        {/* Dot */}
                        <div
                            className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 z-10"
                            style={{
                                backgroundColor: theme.primary_color,
                                border: `3px solid ${theme.surface_color}`,
                            }}
                        />

                        {/* Content */}
                        <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'
                            }`}>
                            <span
                                className="inline-block px-3 py-1 rounded-full text-sm font-bold mb-2"
                                style={{
                                    backgroundColor: theme.primary_color,
                                    color: '#ffffff',
                                }}
                            >
                                {item.year}
                            </span>
                            <h3
                                className="font-semibold text-lg mb-1"
                                style={{ color: theme.text_primary }}
                            >
                                {item.title}
                            </h3>
                            <p
                                className="text-sm"
                                style={{ color: theme.text_secondary }}
                            >
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
