'use client';

import { Footer, Theme } from '../types/storefront';
import Link from 'next/link';

interface FooterSectionProps {
    footer: Footer;
    theme: Theme;
    shopName: string;
}

export function FooterSection({ footer, theme, shopName }: FooterSectionProps) {
    const bgColor = theme.mode === 'dark' ? '#111' : '#111827';

    if (footer.style === 'minimal') {
        return (
            <footer className="py-6 px-4 mt-8" style={{ backgroundColor: bgColor }}>
                <div className="max-w-6xl mx-auto text-center text-white">
                    <p className="text-sm opacity-70">
                        {footer.copyright_text || `© ${new Date().getFullYear()} ${shopName}. Hak cipta dilindungi.`}
                    </p>
                </div>
            </footer>
        );
    }

    if (footer.style === 'centered') {
        return (
            <footer className="py-10 px-4 mt-8 text-center" style={{ backgroundColor: bgColor }}>
                <div className="max-w-6xl mx-auto text-white">
                    <h3 className="text-2xl font-bold mb-3">{shopName}</h3>

                    {footer.show_contact && footer.contact_text && (
                        <p className="opacity-80 mb-2">{footer.contact_text}</p>
                    )}

                    {footer.show_location && footer.location_text && (
                        <p className="opacity-60 text-sm mb-4">{footer.location_text}</p>
                    )}

                    {footer.show_social && footer.social_links && footer.social_links.length > 0 && (
                        <div className="flex justify-center gap-4 mb-4">
                            {footer.social_links.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="opacity-80 hover:opacity-100 transition-opacity"
                                >
                                    {getSocialIcon(link.platform)}
                                </a>
                            ))}
                        </div>
                    )}

                    <p className="text-sm opacity-50 mt-6">
                        {footer.copyright_text || `© ${new Date().getFullYear()} ${shopName}`}
                    </p>
                    <p className="text-xs opacity-30 mt-1">
                        Powered by <Link href="/" className="underline">Rupavo</Link>
                    </p>
                </div>
            </footer>
        );
    }

    // Full footer (default)
    return (
        <footer className="py-12 px-4 mt-8" style={{ backgroundColor: bgColor }}>
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
                    {/* Brand Column */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">{shopName}</h3>
                        <p className="text-sm opacity-70 leading-relaxed">
                            Terima kasih sudah mengunjungi toko kami. Kami selalu siap melayani Anda dengan produk terbaik.
                        </p>
                    </div>

                    {/* Contact Column */}
                    {footer.show_contact && (
                        <div>
                            <h4 className="font-semibold mb-4">Hubungi Kami</h4>
                            {footer.contact_text && (
                                <p className="text-sm opacity-80 mb-2">{footer.contact_text}</p>
                            )}
                            {footer.location_text && (
                                <p className="text-sm opacity-60">{footer.location_text}</p>
                            )}
                        </div>
                    )}

                    {/* Social Column */}
                    {footer.show_social && (
                        <div>
                            <h4 className="font-semibold mb-4">Ikuti Kami</h4>
                            {footer.social_links && footer.social_links.length > 0 && (
                                <div className="flex gap-4">
                                    {footer.social_links.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="opacity-80 hover:opacity-100 transition-opacity text-2xl"
                                        >
                                            {getSocialIcon(link.platform)}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-white">
                    <p className="text-sm opacity-50">
                        {footer.copyright_text || `© ${new Date().getFullYear()} ${shopName}. Hak cipta dilindungi.`}
                    </p>
                    <p className="text-xs opacity-30 mt-2 md:mt-0">
                        Powered by <Link href="/" className="underline">Rupavo</Link>
                    </p>
                </div>
            </div>
        </footer>
    );
}

function getSocialIcon(platform: string): string {
    const icons: Record<string, string> = {
        instagram: '📷',
        facebook: '📘',
        twitter: '🐦',
        tiktok: '🎵',
        youtube: '▶️',
        whatsapp: '💬',
        linkedin: '💼',
        telegram: '✈️',
    };
    return icons[platform.toLowerCase()] || '🔗';
}
