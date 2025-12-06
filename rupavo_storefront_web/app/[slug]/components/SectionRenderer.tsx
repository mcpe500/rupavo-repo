'use client';

import { Section, Product, Theme, VisualStyle } from '../types/storefront';
import { ProductGrid } from './sections/ProductGrid';
import { ProductCarousel } from './sections/ProductCarousel';
import { HighlightStrip } from './sections/HighlightStrip';
import { HighlightIcons } from './sections/HighlightIcons';
import { USPColumns } from './sections/USPColumns';
import { SocialProof } from './sections/SocialProof';
import { TestimonialCarousel } from './sections/TestimonialCarousel';
import { BannerPromo } from './sections/BannerPromo';
import { BannerCountdown } from './sections/BannerCountdown';
import { AboutUs } from './sections/AboutUs';
import { HowItWorks } from './sections/HowItWorks';
import { StoryTimeline } from './sections/StoryTimeline';
import { FAQ } from './sections/FAQ';
import { CTABlock } from './sections/CTABlock';
import { WhatsAppFloat } from './sections/WhatsAppFloat';
import { AnnouncementBar } from './sections/AnnouncementBar';
import { CategoryTiles } from './sections/CategoryTiles';
import { TipsList } from './sections/TipsList';
import { TeamMembers } from './sections/TeamMembers';
import { PricingTable } from './sections/PricingTable';
import { Newsletter } from './sections/Newsletter';
import { Gallery } from './sections/Gallery';
import { BundleShowcase } from './sections/BundleShowcase';

interface SectionRendererProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    section: Section | any; // Accept any format from AI
    products: Product[];
    theme: Theme;
    visualStyle: VisualStyle;
    isAlternate?: boolean;
}

export function SectionRenderer({
    section,
    products,
    theme,
    visualStyle,
    isAlternate = false,
}: SectionRendererProps) {
    // Get background color based on alternate or override
    const bgColor = section.color_override?.background
        || (isAlternate ? theme.alternative_bg : theme.surface_color);

    const textColor = section.color_override?.text || theme.text_primary;

    // Common wrapper style
    const wrapperStyle: React.CSSProperties = {
        backgroundColor: bgColor,
        color: textColor,
        padding: getPadding(visualStyle.spacing),
    };

    switch (section.type) {
        case 'product_grid':
            return (
                <div style={wrapperStyle}>
                    <ProductGrid
                        section={section}
                        products={products}
                        theme={theme}
                        visualStyle={visualStyle}
                    />
                </div>
            );

        case 'product_carousel':
            return (
                <div style={wrapperStyle}>
                    <ProductCarousel
                        section={section}
                        products={products}
                        theme={theme}
                        visualStyle={visualStyle}
                    />
                </div>
            );

        case 'highlight_strip':
            return (
                <HighlightStrip
                    section={section}
                    theme={theme}
                />
            );

        case 'highlight_icons':
            return (
                <div style={wrapperStyle}>
                    <HighlightIcons
                        section={section}
                        theme={theme}
                        visualStyle={visualStyle}
                    />
                </div>
            );

        case 'usp_columns':
            return (
                <div style={wrapperStyle}>
                    <USPColumns
                        section={section}
                        theme={theme}
                        visualStyle={visualStyle}
                    />
                </div>
            );

        case 'social_proof':
            return (
                <div style={wrapperStyle}>
                    <SocialProof
                        section={section}
                        theme={theme}
                    />
                </div>
            );

        case 'testimonial_carousel':
        case 'testimonial_grid':
            return (
                <div style={wrapperStyle}>
                    <TestimonialCarousel
                        section={section}
                        theme={theme}
                        visualStyle={visualStyle}
                    />
                </div>
            );

        case 'banner_promo':
            return (
                <BannerPromo
                    section={section}
                    theme={theme}
                />
            );

        case 'banner_countdown':
            return (
                <BannerCountdown
                    section={section}
                    theme={theme}
                />
            );

        case 'announcement_bar':
            return (
                <AnnouncementBar section={section} />
            );

        case 'about_us':
            return (
                <div style={wrapperStyle}>
                    <AboutUs
                        section={section}
                        theme={theme}
                        visualStyle={visualStyle}
                    />
                </div>
            );

        case 'how_it_works':
            return (
                <div style={wrapperStyle}>
                    <HowItWorks
                        section={section}
                        theme={theme}
                        visualStyle={visualStyle}
                    />
                </div>
            );

        case 'story_timeline':
            return (
                <div style={wrapperStyle}>
                    <StoryTimeline
                        section={section}
                        theme={theme}
                    />
                </div>
            );

        case 'team_members':
            return (
                <div style={wrapperStyle}>
                    <TeamMembers
                        section={section}
                        theme={theme}
                        visualStyle={visualStyle}
                    />
                </div>
            );

        case 'faq_accordion':
            return (
                <div style={wrapperStyle}>
                    <FAQ
                        section={section}
                        theme={theme}
                    />
                </div>
            );

        case 'tips_list':
            return (
                <div style={wrapperStyle}>
                    <TipsList
                        section={section}
                        theme={theme}
                    />
                </div>
            );

        case 'pricing_table':
            return (
                <div style={wrapperStyle}>
                    <PricingTable
                        section={section}
                        theme={theme}
                        visualStyle={visualStyle}
                    />
                </div>
            );

        case 'category_tiles':
            return (
                <div style={wrapperStyle}>
                    <CategoryTiles
                        section={section}
                        theme={theme}
                        visualStyle={visualStyle}
                    />
                </div>
            );

        case 'cta_block':
            return (
                <CTABlock
                    section={section}
                    theme={theme}
                />
            );

        case 'newsletter':
            return (
                <div style={wrapperStyle}>
                    <Newsletter
                        section={section}
                        theme={theme}
                        visualStyle={visualStyle}
                    />
                </div>
            );

        case 'gallery':
            return (
                <div style={wrapperStyle}>
                    <Gallery
                        section={section}
                        theme={theme}
                        visualStyle={visualStyle}
                    />
                </div>
            );

        case 'bundle_showcase':
            return (
                <div style={wrapperStyle}>
                    <BundleShowcase
                        section={section}
                        products={products}
                        theme={theme}
                        visualStyle={visualStyle}
                    />
                </div>
            );

        case 'whatsapp_float':
            return (
                <WhatsAppFloat section={section} />
            );

        default:
            // Fallback for unimplemented sections
            console.warn(`Unknown section type: ${(section as Section).type}`);
            return null;
    }
}

// Helper function for spacing
function getPadding(spacing: VisualStyle['spacing']): string {
    switch (spacing) {
        case 'compact':
            return '2rem 1rem';
        case 'normal':
            return '3rem 1rem';
        case 'airy':
            return '4rem 1rem';
        case 'very-airy':
            return '6rem 1rem';
        default:
            return '3rem 1rem';
    }
}
