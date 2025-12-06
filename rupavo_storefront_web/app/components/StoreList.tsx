import { getStores } from "@/lib/api";
import { StoreSearch } from "@/components/store-search";

export default async function StoreList() {
  const stores = await getStores();

  return <StoreSearch initialStores={stores} />;
}
