'use client';

import { Theme, VisualStyle } from '../../types/storefront';
import { useState } from 'react';

// Flexible testimonial type
interface Testimonial {
    name: string;
    text: string;
    rating?: number;
    image_url?: string;
}

interface TestimonialSection {
    type: 'testimonial_carousel' | 'testimonial_grid';
    title?: string;
    testimonials?: Testimonial[];
    items?: Testimonial[]; // AI sometimes uses 'items' instead of 'testimonials'
}

interface TestimonialCarouselProps {
    section: TestimonialSection;
    theme: Theme;
    visualStyle: VisualStyle;
}

export function TestimonialCarousel({ section, theme }: TestimonialCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    // Accept both 'testimonials' and 'items' from AI
    const testimonials = section.testimonials || section.items || [];

    const renderStars = (rating: number = 5) => {
        return '⭐'.repeat(Math.min(rating, 5));
    };

    if (testimonials.length === 0) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto">
            {section.title && (
                <h2
                    className="text-2xl md:text-3xl font-bold text-center mb-8"
                    style={{ color: theme.text_primary }}
                >
                    {section.title}
                </h2>
            )}

            <div className="relative">
                {/* Testimonial Card */}
                <div
                    className="text-center p-8 rounded-xl"
                    style={{
                        backgroundColor: theme.surface_color,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    {/* Rating */}
                    <div className="text-2xl mb-4">
                        {renderStars(testimonials[activeIndex].rating)}
                    </div>

                    {/* Quote */}
                    <blockquote
                        className="text-lg md:text-xl italic mb-6"
                        style={{ color: theme.text_primary }}
                    >
                        "{testimonials[activeIndex].text}"
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center justify-center gap-3">
                        {testimonials[activeIndex].image_url ? (
                            <img
                                src={testimonials[activeIndex].image_url}
                                alt={testimonials[activeIndex].name}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        ) : (
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: theme.primary_color }}
                            >
                                {testimonials[activeIndex].name.charAt(0)}
                            </div>
                        )}
                        <span
                            className="font-semibold"
                            style={{ color: theme.text_primary }}
                        >
                            {testimonials[activeIndex].name}
                        </span>
                    </div>
                </div>

                {/* Navigation Dots */}
                {testimonials.length > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                className="w-3 h-3 rounded-full transition-colors"
                                style={{
                                    backgroundColor: index === activeIndex
                                        ? theme.primary_color
                                        : theme.text_secondary + '40',
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
