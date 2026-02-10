import { Review } from "@/types";

export default function ReviewList({ reviews }: { reviews: Review[] }) {
    return (
        <div className="space-y-6">
            {reviews.map((review, idx) => (
                <div key={idx} className="glass-card rounded-2xl p-6 border border-white/5 bg-white/[0.02]">
                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                            <img
                                src={review.avatar}
                                alt={review.user}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-sm text-white">{review.user}</h4>
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{review.time}</span>
                            </div>
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={`material-symbols-outlined text-[14px] ${i < review.rating ? 'text-primary' : 'text-gray-700'}`}>
                                        star
                                    </span>
                                ))}
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {review.comment}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
