"use client";

import { useState, useEffect, useRef } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface IntelligentSearchInputProps {
    initialValue?: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
}

export default function IntelligentSearchInput({
    initialValue = "",
    placeholder = "Buscar en el cosmos...",
    onSearch
}: IntelligentSearchInputProps) {
    const [query, setQuery] = useState(initialValue);
    const router = useRouter();
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (query.length >= 3) {
            const timeoutId = setTimeout(() => {
                if (onSearch) onSearch(query);
                // Trigger natural navigation if we are not already on search page
                // or just let the parent handle it via onSearch
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [query, onSearch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            if (onSearch) onSearch(query);
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative group min-w-[300px] w-full">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full h-12 pl-12 pr-6 rounded-full bg-white/5 border border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-lg"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
        </form>
    );
}
