import { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { clients, Client } from "@/data/clients";
import { db } from "@/lib/firebase";
import { ref, push } from "firebase/database";

const PublicFeedback = () => {
    const [searchParams] = useSearchParams();
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);

    // Legacy target URL support
    const targetUrlParam = searchParams.get("target");

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (slug) {
            const foundClient = clients.find(c => c.slug === slug);
            if (foundClient) {
                setClient(foundClient);
            } else {
                toast.error("Client not found");
                // Optional: navigate to 404
            }
        }
        setLoading(false);
    }, [slug]);

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previews]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...files]);

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeFile = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        // Convert images to Base64 for internal storage
        let imagesBase64: string[] = [];
        if (selectedFiles.length > 0) {
            try {
                imagesBase64 = await Promise.all(selectedFiles.map(convertToBase64));
            } catch (error) {
                console.error("Error converting images", error);
                toast.error("Failed to process images");
                return;
            }
        }

        const effectiveTargetUrl = client?.googleReviewUrl || targetUrlParam;

        // Always save to localStorage
        const newFeedback = {
            id: Date.now(),
            rating,
            comment: feedback,
            images: imagesBase64,
            date: new Date().toISOString(),
            targetUrl: effectiveTargetUrl,
            clientSlug: slug // Track which client this was for
        };

        const existingFeedback = JSON.parse(localStorage.getItem("internal_feedback") || "[]");
        localStorage.setItem("internal_feedback", JSON.stringify([newFeedback, ...existingFeedback]));

        // Save to Firebase Realtime Database
        if (rating < 4) {
            try {
                const feedbackRef = ref(db, 'feedback');
                await push(feedbackRef, newFeedback);
            } catch (error) {
                console.error("Error saving to Firebase:", error);
                toast.error("Failed to save feedback online, but saved locally.");
            }
        }

        setSubmitted(true);

        if (rating >= 4 && effectiveTargetUrl) {
            toast.success("Redirecting to Google...");

            if (selectedFiles.length > 0) {
                toast.info("Note: Please re-select your photos on Google Review page.", {
                    duration: 4000,
                });
            }

            // Copy feedback to clipboard to help user
            navigator.clipboard.writeText(feedback).then(() => {
                toast.info("Review text copied to clipboard!");
            }).catch(() => { });

            // Delay to allow reading the toast
            setTimeout(() => {
                window.location.href = effectiveTargetUrl;
            }, 2500);
        } else {
            toast.success("Thank you for your feedback!");
        }
    };

    const handleCancel = () => {
        setRating(0);
        setFeedback("");
        setSelectedFiles([]);
        setPreviews([]);
        toast.info("Feedback cleared");
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (slug && !client) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-4 font-sans">
                <div className="max-w-[500px] w-full text-center space-y-4">
                    <h2 className="text-2xl font-normal text-gray-800">Client Not Found</h2>
                    <p className="text-gray-600">The requested client could not be found.</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-4 font-sans">
                <div className="max-w-[500px] w-full text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-600 fill-current">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-normal text-gray-800">Thanks for sharing!</h2>
                    <p className="text-gray-600">
                        {rating >= 4
                            ? "Redirecting you to Google Reviews..."
                            : "Your feedback helps us improve."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center bg-white font-sans sm:pt-10">
            <div className="w-full max-w-[700px] p-4 sm:p-6 space-y-6">

                {/* Header */}
                <div className="text-center space-y-1">
                    <h1 className="text-[1.375rem] leading-[1.75rem] font-normal text-[#202124]">
                        {client ? client.name : "Rainhopes"}
                    </h1>
                </div>

                {/* User Info */}
                <div className="flex flex-col items-start space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#7B1FA2] text-white flex items-center justify-center text-lg font-normal">
                            W
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[1rem] font-medium text-[#3c4043]">Google User</span>
                            <span className="text-[0.75rem] text-[#70757a] flex items-center gap-1">
                                Posting publicly across Google
                                <svg focusable="false" viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#70757a]"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Star Rating */}
                <div className="flex justify-center py-2">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform active:scale-95"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                {star <= (hoverRating || rating) ? (
                                    <svg viewBox="0 0 24 24" className="w-10 h-10 sm:w-12 sm:h-12 fill-[#FAAF00]">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" className="w-10 h-10 sm:w-12 sm:h-12 fill-none stroke-[#dadce0] stroke-[2]">
                                        <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"></path>
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input Area */}
                <div className="border border-[#dadce0] rounded-lg p-4 min-h-[150px]">
                    <textarea
                        className="w-full h-full min-h-[100px] outline-none text-[1rem] text-[#202124] placeholder:text-[#5f6368] resize-none"
                        placeholder="Share details of your own experience at this place"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                    />
                    {/* Image Previews */}
                    {previews.length > 0 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                            {previews.map((src, index) => (
                                <div key={index} className="relative flex-shrink-0">
                                    <img src={src} alt="Preview" className="w-20 h-20 object-cover rounded-md border" />
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-md hover:bg-gray-100"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-600">
                                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Photos Button */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 w-full py-2.5 border border-[#dadce0] rounded-[4px] text-[#1a73e8] hover:bg-[#f1f3f4] transition-colors font-medium"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                        <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"></path>
                    </svg>
                    Add photos & videos
                </button>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={handleCancel}
                        className="px-6 py-2 rounded-[4px] text-[#1a73e8] font-medium hover:bg-[#f8f9fa] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0}
                        className={`px-8 py-2 rounded-[4px] font-medium transition-colors ${rating === 0
                            ? "bg-[#e5e5e5] text-[#a8a8a8] cursor-not-allowed"
                            : "bg-[#1a73e8] text-white hover:bg-[#1557b0] shadow-sm"
                            }`}
                    >
                        Post
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PublicFeedback;
