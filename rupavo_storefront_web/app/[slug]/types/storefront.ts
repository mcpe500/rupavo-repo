// Storefront Template Types - v2 Chaos Mode Terkontrol 🔥

export type HeroLayout =
    | 'centered'
    | 'image-left'
    | 'image-right'
    | 'split'
    | 'video-bg'
    | 'carousel'
    | 'stacked'
    | 'product-focus'
    | 'story'
    | 'badge-hero';

export type HeroStyle =
    | 'minimal'
    | 'bold'
    | 'gradient'
    | 'glassmorphism'
    | 'neumorphism'
    | 'carded'
    | 'outline'
    | 'floating';

export type SectionType =
    | 'product_grid'
    | 'product_carousel'
    | 'product_featured'
    | 'category_tiles'
    | 'bundle_showcase'
    | 'highlight_strip'
    | 'highlight_icons'
    | 'usp_columns'
    | 'social_proof'
    | 'brand_strip'
    | 'testimonial_carousel'
    | 'testimonial_grid'
    | 'banner_promo'
    | 'banner_countdown'
    | 'announcement_bar'
    | 'floating_badge'
    | 'about_us'
    | 'story_timeline'
    | 'team_members'
    | 'how_it_works'
    | 'faq_accordion'
    | 'recipe_cards'
    | 'tips_list'
    | 'pricing_table'
    | 'compare_table'
    | 'cta_block'
    | 'newsletter'
    | 'contact_form'
    | 'gallery'
    | 'map_location'
    | 'whatsapp_float';

export type ColorPalette =
    | 'fresh-green'
    | 'warm-sunset'
    | 'ocean-blue'
    | 'elegant-purple'
    | 'earthy-brown'
    | 'modern-dark'
    | 'pastel-pink'
    | 'nature-earth'
    | 'coffee-dark'
    | 'fresh-market'
    | 'sea-side'
    | 'minimal-black'
    | 'soft-beige'
    | 'tropical'
    | 'berry'
    | 'custom';

export interface Theme {
    mode: 'light' | 'dark';
    color_palette: ColorPalette;
    tone: 'playful' | 'serious' | 'premium' | 'eco' | 'family-friendly';
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    surface_color: string;
    alternative_bg: string;
    text_primary: string;
    text_secondary: string;
    border_color?: string;
    gradient_style: 'none' | 'subtle' | 'bold' | 'mesh';
    gradient_colors?: string[];
    background_pattern: 'none' | 'dots' | 'grid' | 'noise';
}

export interface VisualStyle {
    border_radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    shadows: 'none' | 'sm' | 'md' | 'lg' | 'glow' | 'soft';
    animations: 'none' | 'subtle' | 'playful' | 'dynamic' | 'bouncy';
    spacing: 'compact' | 'normal' | 'airy' | 'very-airy';
    composition: 'boxed' | 'full-bleed' | 'sectioned';
    divider_style: 'none' | 'line' | 'dashed' | 'dotted' | 'wave' | 'zigzag';
    card_style: 'flat' | 'outlined' | 'soft' | 'glass' | 'elevated';
    image_style: 'square' | 'rounded' | 'circle' | 'squircle';
    section_transition: 'straight' | 'angled' | 'curve' | 'wave';
}

export interface Typography {
    heading_font: 'Inter' | 'Poppins' | 'Outfit' | 'Plus Jakarta Sans';
    body_font: 'Inter' | 'Poppins' | 'Outfit' | 'Plus Jakarta Sans';
    heading_tone: string;
    body_tone: string;
}

export interface Hero {
    layout: HeroLayout;
    style: HeroStyle;
    title: string;
    subtitle: string;
    call_to_action_label: string;
    call_to_action_url: string;
    highlight_badge?: string;
    featured_product_ids?: string[];
    background_image?: string;
}

export interface Footer {
    style: 'minimal' | 'full' | 'centered';
    show_contact: boolean;
    show_social: boolean;
    show_location: boolean;
    contact_text?: string;
    location_text?: string;
    copyright_text?: string;
    social_links?: Array<{ platform: string; url: string }>;
}

export interface SEO {
    meta_title: string;
    meta_description: string;
}

export interface BaseSection {
    type: SectionType;
    id?: string;
    title?: string;
    color_override?: {
        background?: string;
        text?: string;
        accent?: string;
    };
    background_variant?: 'solid' | 'striped' | 'soft-gradient';
}

export interface ProductGridSection extends BaseSection {
    type: 'product_grid';
    layout: '2-col' | '3-col' | '4-col' | 'list';
    product_ids?: string[];
    show_all?: boolean;
    image_ratio?: '1:1' | '4:3' | '3:4' | '16:9';
}

export interface ProductCarouselSection extends BaseSection {
    type: 'product_carousel';
    product_ids?: string[];
    auto_fill?: boolean;
    max_items?: number;
}

export interface ProductFeaturedSection extends BaseSection {
    type: 'product_featured';
    product_id?: string;
}

export interface CategoryTilesSection extends BaseSection {
    type: 'category_tiles';
    layout: 'grid-3' | 'grid-4' | 'scroll';
    categories: Array<{
        name: string;
        icon: string;
        product_count?: number;
    }>;
}

export interface HighlightStripSection extends BaseSection {
    type: 'highlight_strip';
    items: string[];
}

export interface HighlightIconsSection extends BaseSection {
    type: 'highlight_icons';
    items: Array<{
        icon: string;
        title: string;
        description: string;
    }>;
}

export interface USPColumnsSection extends BaseSection {
    type: 'usp_columns';
    columns: Array<{
        title: string;
        description: string;
        icon?: string;
    }>;
}

export interface SocialProofSection extends BaseSection {
    type: 'social_proof';
    stats: Array<{
        value: string;
        label: string;
    }>;
}

export interface TestimonialCarouselSection extends BaseSection {
    type: 'testimonial_carousel';
    testimonials: Array<{
        name: string;
        rating?: number;
        text: string;
        image_url?: string;
    }>;
}

export interface TestimonialGridSection extends BaseSection {
    type: 'testimonial_grid';
    testimonials: Array<{
        name: string;
        rating?: number;
        text: string;
        image_url?: string;
    }>;
}

export interface BannerPromoSection extends BaseSection {
    type: 'banner_promo';
    subtitle?: string;
    cta_label?: string;
    cta_url?: string;
    background_color?: string;
    text_color?: string;
}

export interface BannerCountdownSection extends BaseSection {
    type: 'banner_countdown';
    end_date: string;
    subtitle?: string;
    cta_label?: string;
    cta_url?: string;
}

export interface AnnouncementBarSection extends BaseSection {
    type: 'announcement_bar';
    message: string;
    style: 'info' | 'warning' | 'success';
}

export interface FloatingBadgeSection extends BaseSection {
    type: 'floating_badge';
    text: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    color?: string;
}

export interface AboutUsSection extends BaseSection {
    type: 'about_us';
    content: string;
    image_url?: string;
}

export interface StoryTimelineSection extends BaseSection {
    type: 'story_timeline';
    items: Array<{
        year: string;
        title: string;
        description: string;
    }>;
}

export interface TeamMembersSection extends BaseSection {
    type: 'team_members';
    members: Array<{
        name: string;
        role: string;
        image_url?: string;
        bio?: string;
    }>;
}

export interface HowItWorksSection extends BaseSection {
    type: 'how_it_works';
    steps: Array<{
        step: number;
        title: string;
        description: string;
        icon?: string;
    }>;
}

export interface FAQSection extends BaseSection {
    type: 'faq_accordion';
    items: Array<{
        question: string;
        answer: string;
    }>;
}

export interface RecipeCardsSection extends BaseSection {
    type: 'recipe_cards';
    recipes: Array<{
        name: string;
        description: string;
        products_used?: string[];
        image_url?: string;
    }>;
}

export interface TipsListSection extends BaseSection {
    type: 'tips_list';
    items: string[];
}

export interface PricingTableSection extends BaseSection {
    type: 'pricing_table';
    plans: Array<{
        name: string;
        price: number;
        description?: string;
        features: string[];
        highlight?: boolean;
    }>;
}

export interface CompareTableSection extends BaseSection {
    type: 'compare_table';
    columns: string[];
    rows: Array<{
        label: string;
        values: string[];
    }>;
}

export interface CTABlockSection extends BaseSection {
    type: 'cta_block';
    subtitle?: string;
    cta_label: string;
    cta_url: string;
}

export interface NewsletterSection extends BaseSection {
    type: 'newsletter';
    subtitle?: string;
    placeholder?: string;
}

export interface ContactFormSection extends BaseSection {
    type: 'contact_form';
    description?: string;
    fields: ('name' | 'email' | 'phone' | 'message')[];
}

export interface GallerySection extends BaseSection {
    type: 'gallery';
    images: Array<{
        url: string;
        caption?: string;
    }>;
    layout?: 'grid' | 'masonry' | 'carousel';
}

export interface MapLocationSection extends BaseSection {
    type: 'map_location';
    address: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

export interface BundleShowcaseSection extends BaseSection {
    type: 'bundle_showcase';
    bundles: Array<{
        name: string;
        description: string;
        product_ids: string[];
        bundle_price: number;
    }>;
}

export interface WhatsAppFloatSection extends BaseSection {
    type: 'whatsapp_float';
    phone_number: string;
    message?: string;
    position?: 'bottom-right' | 'bottom-left';
}

export interface BrandStripSection extends BaseSection {
    type: 'brand_strip';
    logos: Array<{
        name: string;
        image_url: string;
    }>;
}

export type Section =
    | ProductGridSection
    | ProductCarouselSection
    | ProductFeaturedSection
    | CategoryTilesSection
    | HighlightStripSection
    | HighlightIconsSection
    | USPColumnsSection
    | SocialProofSection
    | TestimonialCarouselSection
    | TestimonialGridSection
    | BannerPromoSection
    | BannerCountdownSection
    | AnnouncementBarSection
    | FloatingBadgeSection
    | AboutUsSection
    | StoryTimelineSection
    | TeamMembersSection
    | HowItWorksSection
    | FAQSection
    | RecipeCardsSection
    | TipsListSection
    | PricingTableSection
    | CompareTableSection
    | CTABlockSection
    | NewsletterSection
    | ContactFormSection
    | GallerySection
    | MapLocationSection
    | BundleShowcaseSection
    | WhatsAppFloatSection
    | BrandStripSection;

export interface StorefrontLayout {
    id?: string;
    shop_id: string;
    theme: Theme;
    visual_style: VisualStyle;
    typography: Typography;
    hero: Hero;
    sections: Section[];
    floating_elements?: Section[];
    footer: Footer;
    seo?: SEO;
    version?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_active?: boolean;
}

export interface Shop {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    tagline: string | null;
    business_type: string | null;
}
