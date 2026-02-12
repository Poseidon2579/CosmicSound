import Link from "next/link";
import { Search as SearchIcon, ArrowLeft } from "lucide-react";
import SearchResults from "./SearchResults";
import IntelligentSearchInput from "@/components/IntelligentSearchInput";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: { q?: string };
}) {
    const query = searchParams.q || "";

    // Fetch from our local API
    let localResults = [];
    if (query) {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
            const res = await fetch(`${baseUrl}/api/songs?q=${encodeURIComponent(query)}&limit=50`, {
                next: { revalidate: 3600 }
            });
            const data = await res.json();
            localResults = data.songs || [];
        } catch (err) {
            console.error("Search fetch failed", err);
        }
    }

    return (
        <main className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto bg-background-dark">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors mb-8">
                <ArrowLeft size={18} /> Volver al Inicio
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-white text-4xl md:text-6xl font-black mb-4">Mapa de la Galaxia</h1>
                    <p className="text-gray-400 text-lg">
                        {query ? `Explorando resultados para "${query}"` : "Explora el cosmos musical"}
                    </p>
                </div>

                <IntelligentSearchInput initialValue={query} />
            </div>

            <SearchResults initialResults={localResults} query={query} />
        </main>
    );
}
