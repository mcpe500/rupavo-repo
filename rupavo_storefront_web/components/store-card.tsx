import { Store } from "@/lib/mock-data";

interface StoreCardProps {
    store: Store;
}

export function StoreCard({ store }: StoreCardProps) {
    return (
        <div className="flex flex-col border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-card text-card-foreground">
            <div className="h-40 overflow-hidden bg-muted">
                <img
                    src={store.imageUrl}
                    alt={store.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-4 flex flex-col gap-2">
                <h3 className="font-semibold text-lg">{store.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {store.description}
                </p>
            </div>
        </div>
    );
}
