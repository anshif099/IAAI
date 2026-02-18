export interface Client {
    slug: string;
    name: string;
    googleReviewUrl: string;
    logo?: string;
}

export const clients: Client[] = [
    {
        slug: "test-client",
        name: "Test Client LLC",
        googleReviewUrl: "https://www.google.com/search?q=google+reviews", // Replace with real URL later
    },
    {
        slug: "acme-corp",
        name: "Acme Corporation",
        googleReviewUrl: "https://www.google.com/maps",
    }
];

