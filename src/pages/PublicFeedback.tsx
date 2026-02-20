import { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
// Client interface defined locally or imported if shared
interface Client {
    slug: string;
    name: string;
    reviewUrl: string; // Changed from googleReviewUrl to match DB
    logo?: string;
    suggestedReviews?: string[];
}
import { db, auth, googleProvider } from "@/lib/firebase";
import { ref, push, query, orderByChild, equalTo, onValue } from "firebase/database";
import { signInWithPopup, onAuthStateChanged, signOut, User } from "firebase/auth";

const PublicFeedback = () => {
    const [searchParams] = useSearchParams();
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Step state: 'auth' | 'rating' | 'suggestions' | 'feedback' | 'success'
    const [step, setStep] = useState<'auth' | 'rating' | 'suggestions' | 'feedback' | 'success'>('auth');

    // Legacy target URL support
    const targetUrlParam = searchParams.get("target");

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (slug) {
            const clientsRef = ref(db, 'clients');
            const clientQuery = query(clientsRef, orderByChild('slug'), equalTo(slug));

            const unsubscribe = onValue(clientQuery, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const key = Object.keys(data)[0];
                    setClient(data[key]);
                    setLoading(false);
                } else {
                    // Fallback: Search in Sellers
                    const sellersRef = ref(db, 'sellers');
                    const sellerQuery = query(sellersRef, orderByChild('slug'), equalTo(slug));

                    onValue(sellerQuery, (sellerSnapshot) => {
                        const sellerData = sellerSnapshot.val();
                        if (sellerData) {
                            const key = Object.keys(sellerData)[0];
                            const seller = sellerData[key];
                            setClient({
                                slug: seller.slug,
                                name: seller.companyName,
                                reviewUrl: seller.url, // Map seller.url to reviewUrl
                                logo: seller.qrLogo,
                                suggestedReviews: [] // Sellers might not have suggestions yet
                            });
                        } else {
                            toast.error("Client/Seller not found");
                        }
                        setLoading(false);
                    }, { onlyOnce: true });
                }
            });

            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
            // If user is logged in and we are in 'auth' step, move to 'rating'
            if (currentUser) {
                setStep('rating'); // Or maybe check if they already rated? For now, let them rate again.
            } else {
                setStep('auth');
            }
        });
        return () => unsubscribe();
    }, []);

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previews]);

    const handleGoogleSignIn = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            toast.success("Successfully signed in!");
            // Step will update in onAuthStateChanged
        } catch (error: any) {
            console.error("Error signing in:", error);
            const errorMessage = error.message || "Unknown error occurred";
            toast.error(`Failed to sign in: ${errorMessage}`);
            if (error.code === 'auth/unauthorized-domain') {
                toast.error("This domain (localhost) is not authorized in Firebase Console.");
            }
        }
    };

    const handleRatingSelect = (star: number) => {
        setRating(star);
        // Move to suggestions step immediately after rating? 
        // User said: "then stars only : next page review suggestion ai"
        // It's smoother to auto-advance or show a "Next" button. Let's auto-advance after a short delay or show a button.
        // A "Next" button is safer for user intent validation.
    };

    const handleNextToSuggestions = () => {
        if (rating === 0) {
            toast.error("Please select a rating first.");
            return;
        }

        if (rating <= 3) {
            setStep('feedback');
        } else {
            setStep('suggestions');
        }
    };

    const handleNextFromSuggestions = () => {
        // Since we only reach here for high ratings (4-5), proceed to Google
        handleHighRatingRedirect();
    };

    const handleHighRatingRedirect = async () => {
        // We might want to save the high rating analytic even if they don't leave internal feedback
        // But for now, just redirect.
        const effectiveTargetUrl = client?.reviewUrl || targetUrlParam;

        toast.success("Redirecting to Google Reviews...");

        // Save minimal interaction record if needed (optional, keeping it simple as per request)
        const newFeedback = {
            id: Date.now(),
            rating,
            comment: "Redirected to Google", // Placeholder
            email: user?.email || "",
            displayName: user?.displayName || "",
            photoURL: user?.photoURL || "",
            uid: user?.uid || "",
            images: [],
            date: new Date().toISOString(),
            targetUrl: effectiveTargetUrl || "",
            clientSlug: slug || ""
        };

        // Save to local storage only for high ratings to avoid cluttering Firebase with empty redirects if not required
        // Or if you want to track them:
        // await push(ref(db, 'feedback'), newFeedback); 
        // Current requirement says "review that review show admin feedback same as now" for LOW ratings.
        // High ratings just redirect.

        setTimeout(() => {
            if (effectiveTargetUrl) {
                window.location.href = effectiveTargetUrl;
            } else {
                toast.error("No Google Review URL configured.");
            }
        }, 2000);
    };

    const handleCopyReview = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success("Review copied to clipboard!");
        }).catch(() => toast.error("Failed to copy"));
    };

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

    const handleFeedbackSubmit = async () => {
        // Similar to original handleSubmit but only for the feedback form (<= 3 stars)
        if (!user) return;

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

        const newFeedback = {
            id: Date.now(),
            rating,
            comment: feedback || "",
            email: user.email || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            uid: user.uid || "",
            images: imagesBase64,
            date: new Date().toISOString(),
            targetUrl: client?.reviewUrl || "",
            clientSlug: slug || ""
        };

        const existingFeedback = JSON.parse(localStorage.getItem("internal_feedback") || "[]");
        localStorage.setItem("internal_feedback", JSON.stringify([newFeedback, ...existingFeedback]));

        if (rating <= 3) {
            const feedbackRef = ref(db, 'feedback');
            try {
                await push(feedbackRef, newFeedback);
                toast.success("Feedback saved to database.");
            } catch (error: any) {
                console.error("FIREBASE ERROR:", error);
                toast.error(`Database Error: ${error.message}`);
            }
        }

        setStep('success');
    };

    const handleSignOut = () => {
        signOut(auth);
        toast.info("Signed out");
    };

    if (loading || authLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (slug && !client) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-4 font-sans">
                <div className="max-w-[500px] w-full text-center space-y-4">
                    <h2 className="text-2xl font-normal text-gray-800">Client Not Found</h2>
                </div>
            </div>
        );
    }

    // --- STEP 1: AUTH ---
    if (step === 'auth' || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 font-sans">
                <div className="max-w-[400px] w-full text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-600 fill-current">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"></path>
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome</h1>
                        <p className="text-gray-600">Please sign in to share your experience with {client ? client.name : "us"}.</p>
                    </div>
                    <Button onClick={handleGoogleSignIn} className="w-full h-12 text-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                        Sign in with Google
                    </Button>
                </div>
            </div>
        );
    }

    // --- SHARED HEADER (User Info) ---
    const UserHeader = () => (
        <div className="flex flex-col items-start space-y-1 w-full mb-6">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || "User"} className="w-10 h-10 rounded-full" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-[#7B1FA2] text-white flex items-center justify-center text-lg font-normal">
                            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                        </div>
                    )}
                    <div className="flex flex-col text-left">
                        <span className="text-[1rem] font-medium text-[#3c4043]">{user?.displayName || "Google User"}</span>
                        <span className="text-[0.75rem] text-[#70757a]">Posting publicly</span>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-500 text-xs">Sign out</Button>
            </div>
        </div>
    );

    // --- STEP 2: RATING ---
    if (step === 'rating') {
        return (
            <div className="min-h-screen flex flex-col items-center bg-white font-sans sm:pt-10 p-4">
                <div className="w-full max-w-[500px] text-center space-y-8">
                    <UserHeader />
                    <h1 className="text-2xl font-medium text-[#202124]">Rate your experience</h1>
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform active:scale-95"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => handleRatingSelect(star)}
                            >
                                {star <= (hoverRating || rating) ? (
                                    <svg viewBox="0 0 24 24" className="w-12 h-12 sm:w-14 sm:h-14 fill-[#FAAF00]">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" className="w-12 h-12 sm:w-14 sm:h-14 fill-none stroke-[#dadce0] stroke-[2]">
                                        <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"></path>
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="pt-6">
                        <Button
                            onClick={handleNextToSuggestions}
                            disabled={rating === 0}
                            className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // --- STEP 3: SUGGESTIONS ---
    if (step === 'suggestions') {
        const getSmartSuggestions = () => {
            if (client?.suggestedReviews && client.suggestedReviews.length > 0) {
                return client.suggestedReviews;
            }

            // Fallback: Smart suggestions based on name/category
            const name = client?.name.toLowerCase() || "";
            if (name.includes("rainhopes") || name.includes("tech") || name.includes("software") || name.includes("it")) {
                return [
                    "Exceptional IT services! The team at Rainhopes delivered our project on time and within budget.",
                    "Highly skilled developers and great communication. They transformed our vision into reality.",
                    "Reliable and professional. Their technical expertise helped us scale our business efficiently.",
                    "Great support and maintenance. We've been working with Rainhopes for years and they never disappoint."
                ];
            }

            return [
                "Great service! Highly recommended.",
                "Very professional and friendly staff.",
                "An amazing experience from start to finish."
            ];
        };

        const suggestions = getSmartSuggestions();

        return (
            <div className="min-h-screen flex flex-col items-center bg-white font-sans sm:pt-10 p-4">
                <div className="w-full max-w-[600px] space-y-6 text-center">
                    <UserHeader />
                    <div>
                        <h2 className="text-xl font-medium text-[#202124] mb-2">Here is what others are saying</h2>
                        <p className="text-gray-600 text-sm">You can copy a review below or write your own next.</p>
                    </div>

                    <div className="grid gap-4 text-left">
                        {suggestions.map((text, i) => (
                            <div key={i} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start gap-4">
                                <p className="text-gray-700 text-sm italic leading-relaxed">"{text}"</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopyReview(text)}
                                    className="shrink-0 text-blue-600 border-blue-200 hover:bg-blue-50 mt-1"
                                >
                                    Copy
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setStep('rating')}
                            className="flex-1"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleNextFromSuggestions}
                            className="flex-1 bg-[#1a73e8] hover:bg-[#1557b0] text-white"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // --- STEP 4: FEEDBACK (Only for <= 3 stars) ---
    if (step === 'feedback') {
        return (
            <div className="min-h-screen flex flex-col items-center bg-white font-sans sm:pt-10 p-4">
                <div className="w-full max-w-[600px] space-y-6">
                    <UserHeader />
                    <div className="text-center">
                        <h2 className="text-xl font-medium text-[#202124]">Tell us how we can improve</h2>
                        <p className="text-gray-500 text-sm mt-1">We appreciate your feedback</p>
                    </div>

                    <div className="border border-[#dadce0] rounded-lg p-4 min-h-[150px] relative">
                        <textarea
                            className="w-full h-full min-h-[100px] outline-none text-[1rem] text-[#202124] placeholder:text-[#5f6368] resize-none"
                            placeholder="Share details of your own experience..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
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

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setStep('suggestions')}>Back</Button>
                        <Button
                            onClick={handleFeedbackSubmit}
                            className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-8"
                        >
                            Post Feedback
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // --- SUCCESS STEP ---
    if (step === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-4 font-sans">
                <div className="max-w-[500px] w-full text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-green-600 fill-current">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-normal text-gray-800">Thank you!</h2>
                    <p className="text-gray-600">Your feedback has been submitted successfully.</p>
                </div>
            </div>
        );
    }

    return null;
};

export default PublicFeedback;
