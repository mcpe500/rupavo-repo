'use client';

import { GallerySection, Theme, VisualStyle } from '../../types/storefront';
import { useState } from 'react';

interface GalleryProps {
    section: GallerySection;
    theme: Theme;
    visualStyle: VisualStyle;
}

export function Gallery({ section, theme, visualStyle }: GalleryProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {section.images.map((image, index) => (
                    <div
                        key={index}
                        className="aspect-square overflow-hidden rounded-lg cursor-pointer transition-transform hover:scale-105"
                        onClick={() => setActiveIndex(index)}
                    >
                        <img
                            src={image.url}
                            alt={image.caption || `Gallery ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {activeIndex !== null && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setActiveIndex(null)}
                >
                    <div className="relative max-w-4xl w-full">
                        <img
                            src={section.images[activeIndex].url}
                            alt={section.images[activeIndex].caption || ''}
                            className="w-full h-auto rounded-lg"
                        />
                        {section.images[activeIndex].caption && (
                            <p className="text-white text-center mt-4">
                                {section.images[activeIndex].caption}
                            </p>
                        )}
                        <button
                            className="absolute top-4 right-4 text-white text-2xl"
                            onClick={() => setActiveIndex(null)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
