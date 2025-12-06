export interface Store {
    id: string;
    name: string;
    slug: string;
    description: string;
    imageUrl?: string | null;
    tagline?: string | null;
    published?: boolean | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    ownerId?: string | null;
    businessType?: string | null;
    styleProfile?: string | null;
}
