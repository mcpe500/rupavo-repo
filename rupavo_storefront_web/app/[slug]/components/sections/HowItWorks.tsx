'use client';

import { Theme, VisualStyle } from '../../types/storefront';

// Flexible step type that accepts AI format
interface Step {
    title: string;
    description: string;
    step?: number;   // Component expected
    number?: number; // AI sends this
    icon?: string;
}

interface HowItWorksSection {
    type: 'how_it_works';
    title?: string;
    steps: Step[];
}

interface HowItWorksProps {
    section: HowItWorksSection;
    theme: Theme;
    visualStyle: VisualStyle;
}

export function HowItWorks({ section, theme }: HowItWorksProps) {
    // Normalize steps to handle both 'step' and 'number' from AI
    const normalizedSteps = section.steps.map((s, index) => ({
        ...s,
        stepNumber: s.step || s.number || index + 1,
    }));

    return (
        <div className="max-w-6xl mx-auto">
            {section.title && (
                <h2
                    className="text-2xl md:text-3xl font-bold text-center mb-10"
                    style={{ color: theme.text_primary }}
                >
                    {section.title}
                </h2>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {normalizedSteps.map((step, index) => (
                    <div key={index} className="text-center relative">
                        {/* Step Number */}
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4"
                            style={{
                                backgroundColor: theme.primary_color,
                                color: '#ffffff',
                            }}
                        >
                            {step.stepNumber}
                        </div>

                        {/* Connector Line (except last) */}
                        {index < normalizedSteps.length - 1 && (
                            <div
                                className="hidden md:block absolute top-7 left-1/2 w-full h-0.5"
                                style={{
                                    backgroundColor: theme.primary_color + '30',
                                }}
                            />
                        )}

                        {/* Content */}
                        <h3
                            className="font-semibold text-lg mb-2"
                            style={{ color: theme.text_primary }}
                        >
                            {step.title}
                        </h3>
                        <p
                            className="text-sm"
                            style={{ color: theme.text_secondary }}
                        >
                            {step.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
