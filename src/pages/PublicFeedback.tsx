import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";

const PublicFeedback = () => {
    const [searchParams] = useSearchParams();
    const targetUrl = searchParams.get("target");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [submitted, setSubmitted] = useState(false);

    // Removed useEffect for auto-redirect

    const handleSubmit = () => {
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        // Always save to localStorage
        const newFeedback = {
            id: Date.now(),
            rating,
            comment: feedback,
            date: new Date().toISOString(),
            targetUrl
        };

        const existingFeedback = JSON.parse(localStorage.getItem("internal_feedback") || "[]");
        localStorage.setItem("internal_feedback", JSON.stringify([newFeedback, ...existingFeedback]));

        setSubmitted(true);

        if (rating >= 4 && targetUrl) {
            toast.success("Thank you! Redirecting to Google to post your review...");
            // Copy feedback to clipboard to help user
            navigator.clipboard.writeText(feedback).then(() => {
                toast.info("Review text copied to clipboard!");
            }).catch(() => { });

            // Slight delay to allow reading the toast
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 2000);
        } else {
            toast.success("Thank you for your feedback!");
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Star className="w-6 h-6 text-green-600 fill-green-600" />
                        </div>
                        <CardTitle>Thank You!</CardTitle>
                        <CardDescription>
                            {rating >= 4
                                ? "Redirecting you to Google Reviews..."
                                : "We appreciate your feedback and will use it to improve our services."}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <CardTitle>How was your experience?</CardTitle>
                    <CardDescription>
                        Please rate your experience with us.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={`w-10 h-10 ${star <= (hoverRating || rating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="text-center text-sm font-medium text-muted-foreground min-h-[20px]">
                        {rating > 0 && (
                            rating >= 4 ? "Excellent! Please write your review below." : "Tell us how we can improve."
                        )}
                    </div>

                    {rating > 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <Textarea
                                placeholder={rating >= 4 ? "Share your experience..." : "What went wrong? Please share details..."}
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="min-h-[100px]"
                            />
                            <Button onClick={handleSubmit} className="w-full">
                                {rating >= 4 ? "Submit & Post on Google" : "Submit Feedback"}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PublicFeedback;
