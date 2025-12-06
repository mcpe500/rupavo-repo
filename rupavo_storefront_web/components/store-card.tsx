import Link from "next/link";
import { Store } from "@/lib/mock-data";

interface StoreCardProps {
    store: Store;
}

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const truncateDescription = (text = "", maxLength = 250) => {
    if (text.length <= maxLength) {
        return text;
    }

    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");

    return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength)}...`;
};

export function StoreCard({ store }: StoreCardProps) {
    const slug = store.slug || slugify(store.name);
    const imageSrc =
        store.imageUrl ??
        "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?w=800&auto=format&fit=crop&q=60";
    const summary = store.description?.trim().length
        ? store.description
        : "Store description coming soon.";

    return (
        <Link
            href={`/${slug}`}
            className="flex flex-col border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-card text-card-foreground"
        >
            <div className="h-40 overflow-hidden bg-muted">
                <img
                    src={imageSrc}
                    alt={store.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>
            <div className="p-4 flex flex-col gap-2">
                <h3 className="font-semibold text-lg">{store.name}</h3>
                <p className="text-sm text-muted-foreground">
                    {truncateDescription(summary)}
                </p>
            </div>
        </Link>
    );
}
