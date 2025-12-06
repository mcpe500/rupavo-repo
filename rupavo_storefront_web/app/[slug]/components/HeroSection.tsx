'use client';

import { Hero, Theme, VisualStyle } from '../types/storefront';

interface HeroSectionProps {
    hero: Hero;
    theme: Theme;
    visualStyle: VisualStyle;
    shopName: string;
}

export function HeroSection({ hero, theme, visualStyle, shopName }: HeroSectionProps) {
    const borderRadius = getBorderRadius(visualStyle.border_radius);

    // Determine background style based on hero style
    const getBackgroundStyle = (): React.CSSProperties => {
        switch (hero.style) {
            case 'gradient':
                return {
                    background: theme.gradient_colors
                        ? `linear-gradient(135deg, ${theme.gradient_colors.join(', ')})`
                        : `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})`,
                };
            case 'glassmorphism':
                return {
                    background: `rgba(255, 255, 255, 0.1)`,
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                };
            case 'neumorphism':
                return {
                    background: theme.background_color,
                    boxShadow: '20px 20px 60px #bebebe, -20px -20px 60px #ffffff',
                };
            case 'bold':
                return {
                    background: theme.primary_color,
                };
            default:
                return {
                    background: theme.primary_color,
                };
        }
    };

    // Render based on layout
    const renderHeroContent = () => {
        switch (hero.layout) {
            case 'centered':
                return (
                    <div className="text-center max-w-4xl mx-auto">
                        {hero.highlight_badge && (
                            <span
                                className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4"
                                style={{
                                    backgroundColor: theme.accent_color,
                                    color: theme.text_primary,
                                }}
                            >
                                {hero.highlight_badge}
                            </span>
                        )}
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">{hero.title}</h1>
                        <p className="text-lg md:text-xl opacity-90 mb-8">{hero.subtitle}</p>
                        <a
                            href={hero.call_to_action_url}
                            className="inline-block px-8 py-4 rounded-lg font-semibold text-lg transition-transform hover:scale-105"
                            style={{
                                backgroundColor: theme.secondary_color,
                                color: '#ffffff',
                                borderRadius: borderRadius,
                            }}
                        >
                            {hero.call_to_action_label}
                        </a>
                    </div>
                );

            case 'split':
            case 'image-left':
            case 'image-right':
                const isImageLeft = hero.layout === 'image-left';
                return (
                    <div className={`grid md:grid-cols-2 gap-8 items-center ${isImageLeft ? '' : 'md:flex-row-reverse'}`}>
                        <div className={`${isImageLeft ? 'md:order-2' : 'md:order-1'}`}>
                            {hero.highlight_badge && (
                                <span
                                    className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4"
                                    style={{
                                        backgroundColor: theme.accent_color,
                                        color: theme.text_primary,
                                    }}
                                >
                                    {hero.highlight_badge}
                                </span>
                            )}
                            <h1 className="text-3xl md:text-5xl font-bold mb-4">{hero.title}</h1>
                            <p className="text-lg opacity-90 mb-6">{hero.subtitle}</p>
                            <a
                                href={hero.call_to_action_url}
                                className="inline-block px-6 py-3 rounded-lg font-semibold transition-transform hover:scale-105"
                                style={{
                                    backgroundColor: theme.secondary_color,
                                    color: '#ffffff',
                                    borderRadius: borderRadius,
                                }}
                            >
                                {hero.call_to_action_label}
                            </a>
                        </div>
                        <div className={`${isImageLeft ? 'md:order-1' : 'md:order-2'}`}>
                            {hero.background_image ? (
                                <img
                                    src={hero.background_image}
                                    alt={shopName}
                                    className="w-full h-64 md:h-96 object-cover"
                                    style={{ borderRadius: borderRadius }}
                                />
                            ) : (
                                <div
                                    className="w-full h-64 md:h-96 flex items-center justify-center text-6xl"
                                    style={{
                                        backgroundColor: theme.surface_color,
                                        borderRadius: borderRadius,
                                        opacity: 0.3,
                                    }}
                                >
                                    🏪
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'stacked':
                return (
                    <div className="text-center">
                        <h1 className="text-5xl md:text-7xl font-bold mb-4">{hero.title}</h1>
                        <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-3xl mx-auto">{hero.subtitle}</p>
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            {hero.highlight_badge && (
                                <span
                                    className="px-4 py-2 rounded-full text-sm font-medium"
                                    style={{
                                        backgroundColor: theme.accent_color,
                                        color: theme.text_primary,
                                    }}
                                >
                                    {hero.highlight_badge}
                                </span>
                            )}
                        </div>
                        <a
                            href={hero.call_to_action_url}
                            className="inline-block px-8 py-4 rounded-lg font-semibold text-lg transition-transform hover:scale-105"
                            style={{
                                backgroundColor: theme.secondary_color,
                                color: '#ffffff',
                                borderRadius: borderRadius,
                            }}
                        >
                            {hero.call_to_action_label}
                        </a>
                    </div>
                );

            case 'story':
                return (
                    <div className="max-w-3xl mx-auto text-center md:text-left">
                        <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">{hero.title}</h1>
                        <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed">{hero.subtitle}</p>
                        <a
                            href={hero.call_to_action_url}
                            className="inline-block px-6 py-3 rounded-lg font-semibold transition-transform hover:scale-105"
                            style={{
                                backgroundColor: theme.secondary_color,
                                color: '#ffffff',
                                borderRadius: borderRadius,
                            }}
                        >
                            {hero.call_to_action_label}
                        </a>
                    </div>
                );

            case 'badge-hero':
                return (
                    <div className="text-center">
                        <div className="flex flex-wrap justify-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">⭐ 4.9 Rating</span>
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">🚚 Free Ongkir</span>
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">💯 Garansi</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">{hero.title}</h1>
                        <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">{hero.subtitle}</p>
                        <a
                            href={hero.call_to_action_url}
                            className="inline-block px-8 py-4 rounded-lg font-semibold text-lg transition-transform hover:scale-105"
                            style={{
                                backgroundColor: theme.secondary_color,
                                color: '#ffffff',
                                borderRadius: borderRadius,
                            }}
                        >
                            {hero.call_to_action_label}
                        </a>
                    </div>
                );

            case 'product-focus':
                return (
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="order-2 md:order-1">
                            <span
                                className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4"
                                style={{
                                    backgroundColor: theme.accent_color,
                                    color: theme.text_primary,
                                }}
                            >
                                {hero.highlight_badge || 'Best Seller'}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-bold mb-4">{hero.title}</h1>
                            <p className="text-lg opacity-90 mb-6">{hero.subtitle}</p>
                            <a
                                href={hero.call_to_action_url}
                                className="inline-block px-6 py-3 rounded-lg font-semibold transition-transform hover:scale-105"
                                style={{
                                    backgroundColor: theme.secondary_color,
                                    color: '#ffffff',
                                    borderRadius: borderRadius,
                                }}
                            >
                                {hero.call_to_action_label}
                            </a>
                        </div>
                        <div className="order-1 md:order-2 flex justify-center">
                            <div
                                className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center text-8xl"
                                style={{
                                    backgroundColor: theme.surface_color,
                                    borderRadius: borderRadius,
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                }}
                            >
                                📦
                            </div>
                        </div>
                    </div>
                );

            default:
                // Fallback to centered
                return (
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">{hero.title}</h1>
                        <p className="text-lg md:text-xl opacity-90 mb-8">{hero.subtitle}</p>
                        <a
                            href={hero.call_to_action_url}
                            className="inline-block px-8 py-4 rounded-lg font-semibold text-lg transition-transform hover:scale-105"
                            style={{
                                backgroundColor: theme.secondary_color,
                                color: '#ffffff',
                                borderRadius: borderRadius,
                            }}
                        >
                            {hero.call_to_action_label}
                        </a>
                    </div>
                );
        }
    };

    // Container style based on hero style
    const containerClass = hero.style === 'carded'
        ? 'rounded-2xl mx-4 md:mx-8 my-4'
        : '';

    return (
        <section
            className={`py-16 md:py-24 px-4 text-white ${containerClass}`}
            style={getBackgroundStyle()}
        >
            <div className="max-w-6xl mx-auto">
                {renderHeroContent()}
            </div>
        </section>
    );
}

// Helper function for border radius
function getBorderRadius(radius: VisualStyle['border_radius']): string {
    switch (radius) {
        case 'none':
            return '0';
        case 'sm':
            return '0.25rem';
        case 'md':
            return '0.5rem';
        case 'lg':
            return '0.75rem';
        case 'xl':
            return '1rem';
        case 'full':
            return '9999px';
        default:
            return '0.5rem';
    }
}
