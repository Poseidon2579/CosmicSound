
export default function HomeSkeleton() {
    return (
        <div className="bg-background-dark min-h-screen p-8 flex flex-col gap-10 animate-pulse">
            {/* Hero Skeleton */}
            <div className="w-full h-96 bg-white/5 rounded-3xl" />

            {/* Row Skeleton */}
            <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="min-w-[200px] h-64 bg-white/5 rounded-xl" />
                ))}
            </div>

            {/* Row Skeleton */}
            <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="min-w-[200px] h-64 bg-white/5 rounded-xl" />
                ))}
            </div>
        </div>
    );
}
