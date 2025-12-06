'use client';

import { TeamMembersSection, Theme, VisualStyle } from '../../types/storefront';

interface TeamMembersProps {
    section: TeamMembersSection;
    theme: Theme;
    visualStyle: VisualStyle;
}

export function TeamMembers({ section, theme, visualStyle }: TeamMembersProps) {
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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {section.members.map((member, index) => (
                    <div
                        key={index}
                        className="text-center p-4 rounded-xl"
                        style={{
                            backgroundColor: theme.surface_color,
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                        }}
                    >
                        {member.image_url ? (
                            <img
                                src={member.image_url}
                                alt={member.name}
                                className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                            />
                        ) : (
                            <div
                                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4"
                                style={{
                                    backgroundColor: theme.primary_color,
                                    color: '#ffffff',
                                }}
                            >
                                {member.name.charAt(0)}
                            </div>
                        )}
                        <h3
                            className="font-semibold"
                            style={{ color: theme.text_primary }}
                        >
                            {member.name}
                        </h3>
                        <p
                            className="text-sm"
                            style={{ color: theme.primary_color }}
                        >
                            {member.role}
                        </p>
                        {member.bio && (
                            <p
                                className="text-xs mt-2"
                                style={{ color: theme.text_secondary }}
                            >
                                {member.bio}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
