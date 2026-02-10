"use client";

import { useEffect } from "react";

export default function Error({
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
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <h2 className="text-2xl font-bold text-red-500">Something went wrong!</h2>
            <p className="text-gray-400">{error.message}</p>
            <button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
                className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/80"
            >
                Try again
            </button>
        </div>
    );
}
