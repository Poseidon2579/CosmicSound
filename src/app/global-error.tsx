"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html>
            <body className="bg-background-dark text-white flex items-center justify-center min-h-screen flex-col gap-4">
                <h2 className="text-2xl font-bold text-red-500">Something went wrong!</h2>
                <p className="text-gray-400">{error.message}</p>
                <button
                    onClick={() => reset()}
                    className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/80"
                >
                    Try again
                </button>
            </body>
        </html>
    );
}
