type RootSlugPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function RootSlugPage({ params }: RootSlugPageProps) {
    const { slug } = await params;

    return (
        <main className="min-h-screen flex items-center justify-center">
            <h1 className="text-4xl font-bold text-center">{slug}</h1>
        </main>
    );
}
