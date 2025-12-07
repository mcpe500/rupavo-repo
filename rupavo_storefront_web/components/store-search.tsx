"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { StoreCard } from "@/components/store-card";
import { Store } from "@/lib/mock-data";
import { AuthButton } from "@/components/AuthButton";

interface StoreSearchProps {
    initialStores: Store[];
}

export function StoreSearch({ initialStores }: StoreSearchProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const normalizedQuery = searchQuery.toLowerCase().trim();

    const filteredStores = initialStores.filter((store) => {
        if (!normalizedQuery) {
            return true;
        }

        const description = store.description?.toLowerCase() ?? "";
        return (
            store.name.toLowerCase().includes(normalizedQuery) ||
            description.includes(normalizedQuery) ||
            store.slug.toLowerCase().includes(normalizedQuery)
        );
    });

    return (
        <div className="w-full max-w-5xl flex flex-col items-center mt-8 gap-8">
            {/* Auth Button - Top Right */}
            <div className="w-full flex justify-end mb-4">
                <AuthButton />
            </div>

            {/* Branding */}
            <div className="flex flex-col items-center gap-2">
                <h1 className="text-6xl font-bold tracking-tight text-primary">
                    Rupavo
                </h1>
                <p className="text-muted-foreground">
                    Temukan toko terbaik di sekitar Anda
                </p>
            </div>

            {/* Merchant CTA - SEO optimized */}
            <aside className="text-center text-sm text-muted-foreground" aria-label="Informasi untuk pedagang">
                <p>
                    Apabila anda ingin membuka toko,{" "}
                    <a
                        href="https://github.com/mcpe500/rupavo-repo"
                        className="text-primary hover:underline font-medium"
                        title="Download Aplikasi Rupavo Merchant untuk Android"
                        rel="noopener noreferrer"
                        target="_blank"
                        aria-label="Download APK Rupavo Merchant"
                    >
                        Download APK Kami
                    </a>
                </p>
            </aside>

            {/* Search Bar */}
            <div className="w-full max-w-2xl relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-full border border-input bg-card text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all"
                    placeholder="Search for stores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Results Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {filteredStores.map((store) => (
                    <StoreCard key={store.id} store={store} />
                ))}

                {filteredStores.length === 0 && (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        No stores found matching "{searchQuery}"
                    </div>
                )}
            </div>
        </div>
    );
}
