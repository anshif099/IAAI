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
    const [activeTab, setActiveTab] = useState<"clients" | "qr" | "feedback" | "profile">("clients");

    // Clients State

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
    const [qrLogo, setQrLogo] = useState<string | null>(null);
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
                    <Button variant={activeTab === "profile" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("profile")}>
                        <Users className="mr-2 h-4 w-4" /> Profile
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
                    <div className="max-w-6xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold">QR Generator</h1>
                            <p className="text-muted-foreground">Generate professional QR codes for your clients</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="h-fit">
                                <CardHeader>
                                    <CardTitle>Configuration</CardTitle>
                                    <CardDescription>Customize your QR code</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
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
                                        <div className="flex items-center gap-4">
                                            <Input
                                                type="color"
                                                value={qrColor}
                                                onChange={e => setQrColor(e.target.value)}
                                                className="w-20 h-10 p-1 cursor-pointer"
                                            />
                                            <span className="text-sm text-muted-foreground font-mono">{qrColor}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Logo Overlay (Optional)</Label>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (ev) => {
                                                            setQrLogo(ev.target?.result as string);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            {qrLogo && (
                                                <Button variant="outline" size="sm" onClick={() => setQrLogo(null)}>
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <Label>Download Options</Label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <Button variant="outline" onClick={() => handleDownloadQr("png")} disabled={!selectedClientForQr}>
                                                <Download className="mr-2 h-4 w-4" /> PNG
                                            </Button>
                                            <Button variant="outline" onClick={() => handleDownloadQr("svg")} disabled={!selectedClientForQr}>
                                                <Download className="mr-2 h-4 w-4" /> SVG
                                            </Button>
                                            <Button variant="outline" onClick={() => handleDownloadQr("pdf")} disabled={!selectedClientForQr}>
                                                <Download className="mr-2 h-4 w-4" /> PDF
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-center">
                                {selectedClientForQr ? (
                                    <div
                                        ref={qrRef}
                                        className="bg-white rounded-3xl border-4 border-white shadow-xl overflow-hidden relative"
                                        style={{
                                            width: "320px",
                                            height: "500px",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "2rem",
                                            background: "linear-gradient(to bottom, #ffffff, #f8f9fa)"
                                        }}
                                    >
                                        {/* Google Border Effect */}
                                        <div className="absolute inset-0 border-[6px] rounded-3xl pointer-events-none"
                                            style={{
                                                borderColor: "transparent",
                                                background: "linear-gradient(white, white) padding-box, linear-gradient(to right, #4285F4, #EA4335, #FBBC05, #34A853) border-box"
                                            }}
                                        />

                                        <div className="z-10 text-center space-y-1 mt-4">
                                            <p className="text-xl font-bold text-gray-700">Review us on</p>
                                            <div className="flex justify-center items-center gap-1">
                                                <span className="text-4xl font-bold text-[#4285F4]">G</span>
                                                <span className="text-4xl font-bold text-[#EA4335]">o</span>
                                                <span className="text-4xl font-bold text-[#FBBC05]">o</span>
                                                <span className="text-4xl font-bold text-[#4285F4]">g</span>
                                                <span className="text-4xl font-bold text-[#34A853]">l</span>
                                                <span className="text-4xl font-bold text-[#EA4335]">e</span>
                                            </div>
                                            <div className="flex justify-center gap-1 mt-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <svg key={star} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FBBC05" className="w-8 h-8 drop-shadow-sm">
                                                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="z-10 bg-white p-2 rounded-lg shadow-sm">
                                            <QRCodeSVG
                                                value={`${window.location.origin}/review/${selectedClientForQr}`}
                                                size={200}
                                                fgColor={qrColor}
                                                bgColor="#ffffff"
                                                level="H"
                                                imageSettings={qrLogo ? {
                                                    src: qrLogo,
                                                    x: undefined,
                                                    y: undefined,
                                                    height: 40,
                                                    width: 40,
                                                    excavate: true,
                                                } : undefined}
                                            />
                                        </div>

                                        <div className="z-10 text-center mb-4">
                                            <p className="text-sm text-gray-500 font-medium">Scan to leave a review</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-[500px] w-[320px] border-2 border-dashed rounded-xl text-muted-foreground bg-muted/10">
                                        Select a client to preview QR
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
                {activeTab === "profile" && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold">Seller Profile</h1>
                            <p className="text-muted-foreground">Your registered company details.</p>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>These details are managed by the Super Admin.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Company Name</Label>
                                        <p className="font-medium text-lg">{seller.companyName}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Seller Name</Label>
                                        <p className="font-medium text-lg">{seller.name}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Email</Label>
                                        <p className="font-medium text-lg">{seller.email}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Mobile</Label>
                                        <p className="font-medium text-lg">{seller.mobile}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Address</Label>
                                        <p className="font-medium text-lg">{seller.address}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Joined Date</Label>
                                        <p className="font-medium text-lg">{new Date(seller.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label className="text-muted-foreground">Company URL</Label>
                                        <p className="font-medium text-lg break-all">{seller.url}</p>
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label className="text-muted-foreground">Seller ID</Label>
                                        <p className="font-mono text-sm bg-muted p-2 rounded w-fit">{seller.id}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerDashboard;
