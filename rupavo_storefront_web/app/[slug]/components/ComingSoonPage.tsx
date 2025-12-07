import Link from "next/link";

interface ComingSoonPageProps {
    shopName: string;
}

export function ComingSoonPage({ shopName }: ComingSoonPageProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-md mx-auto px-6 text-center">
                {/* Icon */}
                <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <span className="text-5xl">🏗️</span>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    {shopName}
                </h1>
                <p className="text-xl text-slate-600 mb-6">
                    Segera Hadir!
                </p>

                {/* Description */}
                <p className="text-slate-500 mb-8">
                    Toko ini sedang dalam persiapan. Silakan cek kembali nanti untuk melihat produk-produk menarik yang akan tersedia.
                </p>

                {/* Back button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
                >
                    ← Kembali ke Beranda
                </Link>

                {/* Powered by */}
                <p className="mt-12 text-sm text-slate-400">
                    Powered by{" "}
                    <Link href="/" className="text-amber-600 hover:text-amber-700 font-medium">
                        Rupavo
                    </Link>
                </p>
            </div>
        </div>
    );
}
