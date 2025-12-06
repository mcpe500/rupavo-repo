'use client';

import { AnnouncementBarSection } from '../../types/storefront';

interface AnnouncementBarProps {
    section: AnnouncementBarSection;
}

export function AnnouncementBar({ section }: AnnouncementBarProps) {
    const styles = {
        info: { bg: '#3B82F6', icon: 'ℹ️' },
        warning: { bg: '#F59E0B', icon: '⚠️' },
        success: { bg: '#10B981', icon: '✅' },
    };

    const style = styles[section.style] || styles.info;

    return (
        <div
            className="py-3 px-4 text-center text-white"
            style={{ backgroundColor: style.bg }}
        >
            <span className="mr-2">{style.icon}</span>
            <span className="font-medium">{section.message}</span>
        </div>
    );
}
