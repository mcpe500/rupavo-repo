export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import StoreList from "./components/StoreList";

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center bg-background text-foreground p-4">
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading stores...</p>
                    </div>
                </div>
            }>
                <StoreList />
            </Suspense>
        </main>
    );
}
