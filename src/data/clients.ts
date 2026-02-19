export interface Client {
    slug: string;
    name: string;
    googleReviewUrl: string;
    logo?: string;
    suggestedReviews?: string[];
}

export const clients: Client[] = [
    {
        slug: "test-client",
        name: "Test Client LLC",
        googleReviewUrl: "https://www.google.com/search?q=google+reviews", // Replace with real URL later
        suggestedReviews: [
            "Great service! The team was very professional and helped me with everything I needed.",
            "Highly recommend! Quick response time and excellent results.",
            "Fantastic experience. Will definitely use their services again."
        ]
    },
    {
        slug: "acme-corp",
        name: "Acme Corporation",
        googleReviewUrl: "https://www.google.com/maps",
        suggestedReviews: [
            "Top notch quality products. exceeded my expectations!",
            "Customer support is amazing. Solved my issue in minutes.",
            "Reliable and trustworthy. A pleasure to do business with."
        ]
    }
];

