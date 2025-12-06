import { getStores } from "@/lib/api";
import { StoreSearch } from "@/components/store-search";

export default async function Home() {
  const stores = await getStores();

  return (
    <main className="min-h-screen flex flex-col items-center bg-background text-foreground p-4">
      <StoreSearch initialStores={stores} />
    </main>
  );
}
