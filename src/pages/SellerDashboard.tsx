import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { toPng, toSvg } from "html-to-image";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { Download, LogOut, LayoutDashboard, MessageSquare, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { ref, onValue, push, set, query, orderByChild, equalTo } from "firebase/database";

const SellerDashboard = () => {
    const navigate = useNavigate();
    const [seller, setSeller] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"clients" | "qr" | "feedback">("clients");

    // Clients State
    const [clients, setClients] = useState<any[]>([]);
    const [newClient, setNewClient] = useState({
        name: "",
        slug: "",
        googleReviewUrl: "",
        suggestedReviews: "" // comma separated for input
    });

    // QR State
    const [selectedClientForQr, setSelectedClientForQr] = useState<string>("");
    const [qrColor, setQrColor] = useState("#000000");
    const qrRef = useRef<HTMLDivElement>(null);

    // Feedback State
    const [feedback, setFeedback] = useState<any[]>([]);

    useEffect(() => {
        const storedSeller = localStorage.getItem("current_seller");
        if (!storedSeller) {
            toast.error("Please login first");
            navigate("/super-admin"); // Or login page
            return;
        }
        setSeller(JSON.parse(storedSeller));
    }, [navigate]);

    // Fetch Clients
    useEffect(() => {
        if (!seller?.id) return;

        const clientsRef = ref(db, 'clients');
        const clientsQuery = query(clientsRef, orderByChild('sellerId'), equalTo(seller.id));

        const unsubscribe = onValue(clientsQuery, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const clientsArray = Object.entries(data).map(([key, value]) => ({
                    ...(value as any),
                    id: key
                }));
                setClients(clientsArray);
                if (clientsArray.length > 0 && !selectedClientForQr) {
                    setSelectedClientForQr(clientsArray[0].slug);
                }
            } else {
                setClients([]);
            }
        });

        return () => unsubscribe();
    }, [seller]);

    // Fetch Feedback
    useEffect(() => {
        if (clients.length === 0) return;

        const feedbackRef = ref(db, 'feedback');
        const unsubscribe = onValue(feedbackRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Filter feedback for my clients
                const myClientSlugs = clients.map(c => c.slug);
                const feedbackArray = Object.entries(data)
                    .map(([key, value]) => ({
                        ...(value as any),
                        id: key
                    }))
                    .filter((item: any) => myClientSlugs.includes(item.clientSlug))
                    .reverse();
                setFeedback(feedbackArray);
            } else {
                setFeedback([]);
            }
        });
        return () => unsubscribe();
    }, [clients]);

    const handleLogout = () => {
        localStorage.removeItem("current_seller");
        navigate("/login");
    };

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Basic slug validation
            const slug = newClient.slug.toLowerCase().replace(/\s+/g, '-');

            const clientsRef = ref(db, 'clients');
            const newClientRef = push(clientsRef);
            await set(newClientRef, {
                ...newClient,
                slug,
                sellerId: seller.id,
                suggestedReviews: newClient.suggestedReviews.split('\n').filter(s => s.trim() !== ""),
                createdAt: new Date().toISOString()
            });

            toast.success("Client added successfully");
            setNewClient({ name: "", slug: "", googleReviewUrl: "", suggestedReviews: "" });
        } catch (error) {
            console.error("Error adding client:", error);
            toast.error("Failed to add client");
        }
    };

    const handleDownloadQr = async (format: "png" | "svg" | "pdf") => {
        if (!qrRef.current) return;
        try {
            const fileName = `${selectedClientForQr}-qr.${format}`;
            if (format === "png") {
                const dataUrl = await toPng(qrRef.current);
                const link = document.createElement("a");
                link.download = fileName;
                link.href = dataUrl;
                link.click();
            } else if (format === "svg") {
                const dataUrl = await toSvg(qrRef.current);
                const link = document.createElement("a");
                link.download = fileName;
                link.href = dataUrl;
                link.click();
            } else if (format === "pdf") {
                const dataUrl = await toPng(qrRef.current);
                const pdf = new jsPDF();
                const imgProps = pdf.getImageProperties(dataUrl);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
                pdf.save(fileName);
            }
            toast.success("QR Code downloaded");
        } catch (err) {
            toast.error("Download failed");
        }
    };

    if (!seller) return null;

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <div className="w-64 bg-card border-r h-screen p-4 flex flex-col">
                <div className="mb-8 px-4">
                    <h1 className="text-xl font-bold">{seller.companyName}</h1>
                    <p className="text-sm text-muted-foreground">Seller Dashboard</p>
                </div>
                <div className="flex-1 space-y-2">
                    <Button variant={activeTab === "clients" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("clients")}>
                        <Users className="mr-2 h-4 w-4" /> Clients
                    </Button>
                    <Button variant={activeTab === "qr" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("qr")}>
                        <LayoutDashboard className="mr-2 h-4 w-4" /> QR Gen
                    </Button>
                    <Button variant={activeTab === "feedback" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("feedback")}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Feedback
                    </Button>
                </div>
                <div className="mt-auto">
                    <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-auto">
                {activeTab === "clients" && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold">Client Management</h1>
                            <p className="text-muted-foreground">Add and manage your clients</p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Add New Client</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateClient} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Client Name</Label>
                                            <Input value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Slug (URL Friendly)</Label>
                                            <Input value={newClient.slug} onChange={e => setNewClient({ ...newClient, slug: e.target.value })} placeholder="e.g. my-business" required />
                                            <p className="text-xs text-muted-foreground">Public URL: {window.location.origin}/review/{newClient.slug || 'slug'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Google Review URL</Label>
                                            <Input value={newClient.googleReviewUrl} onChange={e => setNewClient({ ...newClient, googleReviewUrl: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Suggested Reviews (One per line)</Label>
                                            <textarea
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={newClient.suggestedReviews}
                                                onChange={e => setNewClient({ ...newClient, suggestedReviews: e.target.value })}
                                            />
                                        </div>
                                        <Button type="submit" className="w-full">Add Client</Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                {clients.map(client => (
                                    <Card key={client.id}>
                                        <CardHeader>
                                            <CardTitle>{client.name}</CardTitle>
                                            <CardDescription>/{client.slug}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <a href={client.googleReviewUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all">{client.googleReviewUrl}</a>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "qr" && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold">QR Generator</h1>
                            <p className="text-muted-foreground">Generate QR codes for your clients</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8">
                            <Card className="flex-1">
                                <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Select Client</Label>
                                        <select
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={selectedClientForQr}
                                            onChange={(e) => setSelectedClientForQr(e.target.value)}
                                        >
                                            <option value="">Select a client...</option>
                                            {clients.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Color</Label>
                                        <Input type="color" value={qrColor} onChange={e => setQrColor(e.target.value)} className="h-10 px-1" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 pt-4">
                                        <Button variant="outline" size="sm" onClick={() => handleDownloadQr("png")}>PNG</Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDownloadQr("svg")}>SVG</Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDownloadQr("pdf")}>PDF</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-center flex-1">
                                {selectedClientForQr ? (
                                    <div ref={qrRef} className="bg-white p-8 rounded-xl shadow-lg border text-center space-y-4" style={{ width: '300px' }}>
                                        <p className="font-bold text-lg mb-2">Review us on Google</p>
                                        <div className="flex justify-center">
                                            <QRCodeSVG
                                                value={`${window.location.origin}/review/${selectedClientForQr}`}
                                                size={200}
                                                fgColor={qrColor}
                                                level="H"
                                            />
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">Scan to leave a review</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-64 w-64 border-2 border-dashed rounded-xl text-muted-foreground">
                                        Select a client
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "feedback" && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold">Client Feedback</h1>
                            <p className="text-muted-foreground">Negative feedback (1-3 stars) from your clients</p>
                        </div>

                        <div className="space-y-4">
                            {feedback.length === 0 ? (
                                <p className="text-muted-foreground">No feedback found.</p>
                            ) : (
                                feedback.map((item: any) => (
                                    <Card key={item.id}>
                                        <CardHeader>
                                            <CardTitle className="flex justify-between">
                                                <span>Rating: {item.rating}/5</span>
                                                <span className="text-sm font-normal text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
                                            </CardTitle>
                                            <CardDescription>Client: {item.clientSlug}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p>{item.comment}</p>
                                            {item.images && (
                                                <div className="flex gap-2 mt-2">
                                                    {item.images.map((img: string, i: number) => (
                                                        <a key={i} href={img} target="_blank" rel="noreferrer">
                                                            <img src={img} alt="attachment" className="w-16 h-16 object-cover rounded" />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="mt-4 pt-4 border-t flex gap-4 text-sm">
                                                <div>
                                                    <span className="font-semibold">User:</span> {item.displayName}
                                                </div>
                                                <div>
                                                    <span className="font-semibold">Email:</span> {item.email}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerDashboard;
