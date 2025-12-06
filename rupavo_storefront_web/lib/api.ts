import { mockStores, Store } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

// This is a draft for when we connect to Supabase
// export const getStoresFromSupabase = async (): Promise<Store[]> => {
//   const supabase = createClient();
//   const { data, error } = await supabase.from('stores').select('*');
//   if (error) {
//     console.error('Error fetching stores:', error);
//     return [];
//   }
//   return data as Store[];
// };

export const getStores = async (): Promise<Store[]> => {
    // Simulate network delay if desired, or return immediately
    // await new Promise((resolve) => setTimeout(resolve, 500));

    // TODO: Switch to getStoresFromSupabase() when backend is ready
    return mockStores;
};
