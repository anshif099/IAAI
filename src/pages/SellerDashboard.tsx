import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { toPng, toSvg } from "html-to-image";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { Download, LogOut, LayoutDashboard, MessageSquare, Users, Trash2, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { ref, onValue, push, set, query, orderByChild, equalTo, update, remove } from "firebase/database";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const stripSensitiveSellerData = (sellerData: any) => {
    if (!sellerData) return sellerData;
    const { password, ...safeSeller } = sellerData;
    return safeSeller;
};

const SellerDashboard = () => {
    const navigate = useNavigate();
    const [seller, setSeller] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"clients" | "qr" | "feedback" | "profile">("clients");
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Clients State
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClientForDetails, setSelectedClientForDetails] = useState<any>(null);
    const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);
    const [newClient, setNewClient] = useState({
        name: "",
        companyName: "",
        slug: "",
        reviewUrl: "",
        mobile: "",
        email: "",
        password: "",
        address: "",
        suggestedReviews: "" // comma separated for input
    });

    // QR State
    // const [selectedClientForQr, setSelectedClientForQr] = useState<string>(""); // Removed
    // const [qrColor, setQrColor] = useState("#000000"); // Using seller.qrColor directly
    // const [qrLogo, setQrLogo] = useState<string | null>(null); // Using seller.qrLogo directly
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
        const loadedSeller = JSON.parse(storedSeller);
        setSeller(loadedSeller);

        // Ensure slug exists in DB for QR generation and Public Review
        if (!loadedSeller.slug) {
            const derivedSlug = loadedSeller.companyName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            const updatedSeller = { ...loadedSeller, slug: derivedSlug };

            // Update Local State
            setSeller(updatedSeller);
            localStorage.setItem("current_seller", JSON.stringify(stripSensitiveSellerData(updatedSeller)));

            // Update Firebase
            const sellerRef = ref(db, `sellers/${loadedSeller.id}`);
            update(sellerRef, { slug: derivedSlug }).catch(err => console.error("Failed to auto-save slug", err));
        }
    }, [navigate]);

    // Keep seller state synced with Firebase so Super Admin updates are reflected in QR Gen.
    useEffect(() => {
        if (!seller?.id) return;

        const sellerRef = ref(db, `sellers/${seller.id}`);
        const unsubscribe = onValue(sellerRef, (snapshot) => {
            const latestSeller = snapshot.val();
            if (!latestSeller) return;

            const syncedSeller = { ...latestSeller, id: seller.id };
            setSeller((currentSeller: any) => {
                if (JSON.stringify(currentSeller) === JSON.stringify(syncedSeller)) {
                    return currentSeller;
                }

                localStorage.setItem("current_seller", JSON.stringify(stripSensitiveSellerData(syncedSeller)));
                return syncedSeller;
            });
        });

        return () => unsubscribe();
    }, [seller?.id]);

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
            } else {
                setClients([]);
            }
        });

        return () => unsubscribe();
    }, [seller]);

    // Fetch Feedback
    useEffect(() => {
        if (!seller?.id) return; // Need seller id to fetch their incoming feedback

        const feedbackRef = ref(db, 'feedback');
        const unsubscribe = onValue(feedbackRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Filter feedback meant only for this seller (no `clientSlug`)
                const feedbackArray = Object.entries(data)
                    .map(([key, value]) => ({
                        ...(value as any),
                        id: key
                    }))
                    .filter((item: any) => item.sellerId === seller.id && !item.clientSlug)
                    .reverse();
                setFeedback(feedbackArray);
            } else {
                setFeedback([]);
            }
        });
        return () => unsubscribe();
    }, [seller]);

    const handleDeleteFeedback = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this feedback?")) {
            try {
                const feedbackRef = ref(db, `feedback/${id}`);
                await remove(feedbackRef);
                toast.success("Feedback deleted successfully");
            } catch (error) {
                console.error("Error deleting feedback:", error);
                toast.error("Failed to delete feedback");
            }
        }
    };

    const handleLoginAsClient = (clientData: any) => {
        // We set the target client to local storage and navigate directly
        localStorage.setItem("current_client", JSON.stringify(clientData));
        toast.success(`Logged in as ${clientData.name}`);
        navigate("/client-dashboard");
    };

    const handleLogout = () => {
        localStorage.removeItem("current_seller");
        navigate("/login");
    };

    const handleUpdateProfile = async () => {
        if (!seller) return;
        try {
            const sellerRef = ref(db, `sellers/${seller.id}`);
            const slug = seller.slug || seller.companyName.toLowerCase().replace(/\s+/g, '-');
            const updateData = {
                ...seller,
                slug,
                qrColor: seller.qrColor || "#000000",
                qrLogo: seller.qrLogo || null
            };
            const { id, ...dataToSave } = updateData;

            await set(sellerRef, dataToSave);

            // Update local state with the new slug
            const updatedSellerLocal = { ...updateData, id: seller.id };
            setSeller(updatedSellerLocal);
            localStorage.setItem("current_seller", JSON.stringify(stripSensitiveSellerData(updatedSellerLocal)));

            toast.success("Profile updated successfully");
            setIsEditingProfile(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        }
    };

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Auto-generate slug from Company Name
            const slug = newClient.companyName
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '') || `client-${Date.now()}`;

            const clientsRef = ref(db, 'clients');
            const newClientRef = push(clientsRef);
            await set(newClientRef, {
                ...newClient,
                slug,
                sellerId: seller.id,
                suggestedReviews: newClient.suggestedReviews.split('\n').filter(s => s.trim() !== ""),
                createdAt: new Date().toISOString()
            });

            toast.success("Client created successfully");
            setNewClient({
                name: "",
                companyName: "",
                slug: "",
                reviewUrl: "",
                mobile: "",
                email: "",
                password: "",
                address: "",
                suggestedReviews: ""
            });
        } catch (error) {
            console.error("Error creating client:", error);
            toast.error("Failed to create client");
        }
    };

    const handleDownloadQr = async (format: "png" | "svg" | "pdf") => {
        if (!qrRef.current) return;
        try {
            const fileName = `${seller.companyName.replace(/\s+/g, '-').toLowerCase()}-qr.${format}`;
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

    const handleTabChange = (tab: "clients" | "qr" | "feedback" | "profile") => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
    };

    const SidebarContent = () => (
        <div className="w-64 bg-card h-full p-4 flex flex-col shrink-0">
            <div className="mb-8 px-4 shrink-0">
                <h1 className="text-xl font-bold">{seller.companyName}</h1>
                <p className="text-sm text-muted-foreground">Seller Dashboard</p>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto">
                <Button variant={activeTab === "clients" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => handleTabChange("clients")}>
                    <Users className="mr-2 h-4 w-4" /> Clients
                </Button>
                <Button variant={activeTab === "qr" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => handleTabChange("qr")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> QR Gen
                </Button>
                <Button variant={activeTab === "feedback" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => handleTabChange("feedback")}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Feedback
                </Button>
                <Button variant={activeTab === "profile" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => handleTabChange("profile")}>
                    <Users className="mr-2 h-4 w-4" /> Profile
                </Button>
            </div>
            <div className="mt-auto shrink-0 pt-4">
                <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-background w-full overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-64 bg-card border-r flex-col shrink-0">
                <SidebarContent />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 bg-card border-b h-16 shrink-0">
                    <span className="font-bold text-lg flex items-center">
                        <LayoutDashboard className="h-6 w-6 text-primary mr-2" />
                        Dashboard
                    </span>
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64">
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex-1 overflow-auto p-4 md:p-8">
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
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Client Name</Label>
                                                    <Input
                                                        placeholder="e.g. John Doe"
                                                        value={newClient.name}
                                                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Company Name</Label>
                                                    <Input
                                                        placeholder="e.g. Doe Industries"
                                                        value={newClient.companyName}
                                                        onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Review URL</Label>
                                                    <Input
                                                        placeholder="https://g.page/..."
                                                        value={newClient.reviewUrl}
                                                        onChange={(e) => setNewClient({ ...newClient, reviewUrl: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Mobile</Label>
                                                    <Input
                                                        placeholder="Mobile Number"
                                                        value={newClient.mobile}
                                                        onChange={(e) => setNewClient({ ...newClient, mobile: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Email</Label>
                                                    <Input
                                                        type="email"
                                                        placeholder="client@example.com"
                                                        value={newClient.email}
                                                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Password</Label>
                                                    <Input
                                                        type="password"
                                                        placeholder="Password"
                                                        value={newClient.password}
                                                        onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Address</Label>
                                                    <Input
                                                        placeholder="Full Address"
                                                        value={newClient.address}
                                                        onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Suggested Positive Reviews (One per line)</Label>
                                                <textarea
                                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    placeholder="Great service!&#10;Highly recommended."
                                                    value={newClient.suggestedReviews}
                                                    onChange={(e) => setNewClient({ ...newClient, suggestedReviews: e.target.value })}
                                                    rows={3}
                                                />
                                            </div>
                                            <Button type="submit" className="w-full">Create Client</Button>
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
                                                <a href={client.reviewUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all block mb-4">{client.reviewUrl}</a>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => {
                                                            setSelectedClientForDetails(client);
                                                            setIsClientDetailsOpen(true);
                                                        }}
                                                    >
                                                        View Details
                                                    </Button>
                                                    <Button
                                                        className="flex-1"
                                                        onClick={() => handleLoginAsClient(client)}
                                                    >
                                                        Login as Client
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Client Details Dialog */}
                    <Dialog open={isClientDetailsOpen} onOpenChange={setIsClientDetailsOpen}>
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Client Details</DialogTitle>
                                <DialogDescription>Full information for {selectedClientForDetails?.name}</DialogDescription>
                            </DialogHeader>
                            {selectedClientForDetails && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="col-span-2">
                                            <Label className="text-muted-foreground">Client Name</Label>
                                            <p className="font-medium text-lg">{selectedClientForDetails.name}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <Label className="text-muted-foreground">Company Name</Label>
                                            <p className="font-medium text-lg">{selectedClientForDetails.companyName}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <Label className="text-muted-foreground">URL Slug</Label>
                                            <p className="font-medium font-mono p-1 bg-muted rounded w-fit">{selectedClientForDetails.slug}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <Label className="text-muted-foreground">Review URL</Label>
                                            <a href={selectedClientForDetails.reviewUrl} target="_blank" rel="noreferrer" className="block font-medium text-blue-600 hover:underline break-all">
                                                {selectedClientForDetails.reviewUrl}
                                            </a>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Mobile</Label>
                                            <p className="font-medium">{selectedClientForDetails.mobile}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Email</Label>
                                            <p className="font-medium break-all">{selectedClientForDetails.email}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Password</Label>
                                            <p className="font-medium font-mono bg-muted p-1 rounded w-fit">{selectedClientForDetails.password}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <Label className="text-muted-foreground">Address</Label>
                                            <p className="font-medium">{selectedClientForDetails.address}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <Label className="text-muted-foreground">Suggested Reviews</Label>
                                            <div className="bg-muted p-2 rounded text-sm whitespace-pre-line">
                                                {selectedClientForDetails.suggestedReviews && selectedClientForDetails.suggestedReviews.length > 0
                                                    ? selectedClientForDetails.suggestedReviews.join('\n')
                                                    : "No suggestions provided."}
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-xs text-muted-foreground pt-4 border-t">
                                            Created: {new Date(selectedClientForDetails.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button onClick={() => setIsClientDetailsOpen(false)}>Close</Button>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>

                    {activeTab === "qr" && (
                        <div className="max-w-6xl mx-auto space-y-8">
                            <div>
                                <h1 className="text-3xl font-bold">QR Generator</h1>
                                <p className="text-muted-foreground">Generate and customize your company's review QR code.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card className="flex-1">
                                    <CardHeader>
                                        <CardTitle>Appearance</CardTitle>
                                        <CardDescription>Customize how your QR code looks.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>QR Color</Label>
                                            <div className="flex items-center gap-4">
                                                <Input
                                                    type="color"
                                                    value={seller.qrColor || "#000000"}
                                                    onChange={(e) => setSeller({ ...seller, qrColor: e.target.value })}
                                                    className="w-16 h-10 p-1 cursor-pointer"
                                                />
                                                <span className="text-muted-foreground text-sm font-mono">{seller.qrColor || "#000000"}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Logo Overlay</Label>
                                            <div className="flex items-center gap-4">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onload = (ev) => {
                                                                setSeller({ ...seller, qrLogo: ev.target?.result as string });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                                {seller.qrLogo && (
                                                    <Button variant="outline" size="sm" onClick={() => setSeller({ ...seller, qrLogo: null })}>
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Upload a square image (PNG/JPG) to place in the center.</p>
                                        </div>

                                        {/* Save Settings Button */}
                                        <div className="pt-4 border-t">
                                            <Button onClick={handleUpdateProfile} className="w-full">
                                                Save QR Settings
                                            </Button>
                                            <p className="text-xs text-muted-foreground text-center mt-2">Saves valid color/logo settings to your profile.</p>
                                        </div>

                                        <div className="pt-4 grid grid-cols-3 gap-2">
                                            <Button variant="outline" onClick={() => handleDownloadQr("png")}>
                                                <Download className="mr-2 h-4 w-4" /> PNG
                                            </Button>
                                            <Button variant="outline" onClick={() => handleDownloadQr("svg")}>
                                                <Download className="mr-2 h-4 w-4" /> SVG
                                            </Button>
                                            <Button variant="outline" onClick={() => handleDownloadQr("pdf")}>
                                                <Download className="mr-2 h-4 w-4" /> PDF
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex flex-col items-center justify-center space-y-6 bg-muted/20 p-8 rounded-xl border border-dashed">
                                    <div ref={qrRef} className="bg-white p-8 rounded-xl shadow-lg border text-center space-y-4" style={{ width: '300px' }}>
                                        <div className="space-y-1">
                                            <p className="font-bold text-lg">Review us on Google</p>
                                            <p className="text-xs text-muted-foreground">{seller.companyName}</p>
                                        </div>

                                        <div className="flex justify-center py-2">
                                            <QRCodeSVG
                                                value={`${window.location.origin}/review/${seller.slug || seller.companyName.toLowerCase().replace(/\s+/g, '-')}`}
                                                size={200}
                                                fgColor={seller.qrColor || "#000000"}
                                                level="H"
                                                imageSettings={seller.qrLogo ? {
                                                    src: seller.qrLogo,
                                                    x: undefined,
                                                    y: undefined,
                                                    height: 48,
                                                    width: 48,
                                                    excavate: true,
                                                } : undefined}
                                            />
                                        </div>
                                        <p className="text-sm text-gray-500">Scan to leave a review</p>
                                    </div>
                                    <div className="text-sm text-muted-foreground text-center max-w-xs">
                                        <p>Preview of your generated QR Code.</p>
                                        <p>Target: <span className="font-mono text-xs">{seller.url || "Not set"}</span></p>
                                    </div>
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
                                                    <div className="flex items-center gap-4 text-sm font-normal text-muted-foreground">
                                                        <span>{new Date(item.date).toLocaleDateString()}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteFeedback(item.id)}
                                                            className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
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
                                <p className="text-muted-foreground">Manage your account details.</p>
                            </div>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Profile Information</CardTitle>
                                        <CardDescription>{isEditingProfile ? "Edit your details below." : "Your registered company details."}</CardDescription>
                                    </div>
                                    {!isEditingProfile && (
                                        <Button onClick={() => setIsEditingProfile(true)}>Edit Profile</Button>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {isEditingProfile ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Company Name</Label>
                                                    <Input
                                                        value={seller.companyName}
                                                        onChange={(e) => setSeller({ ...seller, companyName: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Seller Name</Label>
                                                    <Input
                                                        value={seller.name}
                                                        onChange={(e) => setSeller({ ...seller, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Email</Label>
                                                    <Input
                                                        value={seller.email}
                                                        onChange={(e) => setSeller({ ...seller, email: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Password</Label>
                                                    <Input
                                                        type="password"
                                                        value={seller.password}
                                                        onChange={(e) => setSeller({ ...seller, password: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Mobile</Label>
                                                    <Input
                                                        value={seller.mobile}
                                                        onChange={(e) => setSeller({ ...seller, mobile: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Address</Label>
                                                    <Input
                                                        value={seller.address}
                                                        onChange={(e) => setSeller({ ...seller, address: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-span-2 space-y-2">
                                                    <Label>Company URL</Label>
                                                    <p className="text-xs text-muted-foreground">This URL is encoded in your Company QR Code.</p>
                                                    <Input
                                                        value={seller.url}
                                                        onChange={(e) => setSeller({ ...seller, url: e.target.value })}
                                                    />
                                                </div>

                                                {/* QR Customization in Edit Mode */}
                                                <div className="col-span-2 border-t pt-4 mt-2">
                                                    <h4 className="font-semibold mb-2">QR Code Settings</h4>
                                                    <div className="flex flex-col md:flex-row gap-4 items-start">
                                                        <div className="space-y-4 flex-1 w-full">
                                                            <div className="space-y-2">
                                                                <Label>QR Color</Label>
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        type="color"
                                                                        value={seller.qrColor || "#000000"}
                                                                        onChange={(e) => setSeller({ ...seller, qrColor: e.target.value })}
                                                                        className="w-12 h-10 p-1"
                                                                    />
                                                                    <span className="text-sm text-muted-foreground">{seller.qrColor || "#000000"}</span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Logo Overlay</Label>
                                                                <Input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            const reader = new FileReader();
                                                                            reader.onload = (ev) => {
                                                                                setSeller({ ...seller, qrLogo: ev.target?.result as string });
                                                                            };
                                                                            reader.readAsDataURL(file);
                                                                        }
                                                                    }}
                                                                />
                                                                {seller.qrLogo && (
                                                                    <Button variant="outline" size="sm" onClick={() => setSeller({ ...seller, qrLogo: null })}>
                                                                        Remove Logo
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="bg-white p-4 rounded border shadow-sm flex items-center justify-center mx-auto md:mx-0">
                                                            <QRCodeSVG
                                                                value={seller.url || "https://example.com"}
                                                                size={120}
                                                                fgColor={seller.qrColor || "#000000"}
                                                                imageSettings={seller.qrLogo ? {
                                                                    src: seller.qrLogo,
                                                                    x: undefined,
                                                                    y: undefined,
                                                                    height: 24,
                                                                    width: 24,
                                                                    excavate: true,
                                                                } : undefined}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 pt-4">
                                                <Button variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                                                <Button onClick={handleUpdateProfile}>Save Changes</Button>
                                            </div>
                                        </div>
                                    ) : (
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
                                                <Label className="text-muted-foreground">Password</Label>
                                                <p className="font-medium text-lg font-mono bg-muted p-1 rounded w-fit">{seller.password}</p>
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

                                            {/* QR Preview in View Mode */}
                                            <div className="col-span-2 border-t pt-4 mt-2">
                                                <div className="flex items-center justify-between mb-4">
                                                    <Label className="text-muted-foreground block">Company QR Code</Label>
                                                    <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                                                        Customize QR
                                                    </Button>
                                                </div>
                                                <div
                                                    className="flex items-center gap-6 bg-muted/20 p-6 rounded-lg w-fit cursor-pointer hover:bg-muted/30 transition-colors border border-transparent hover:border-border"
                                                    onClick={() => setIsEditingProfile(true)}
                                                    title="Click to edit QR details"
                                                >
                                                    <div className="bg-white p-2 rounded border">
                                                        <QRCodeSVG
                                                            value={seller.url || "https://example.com"}
                                                            size={100}
                                                            fgColor={seller.qrColor || "#000000"}
                                                            imageSettings={seller.qrLogo ? {
                                                                src: seller.qrLogo,
                                                                x: undefined,
                                                                y: undefined,
                                                                height: 24,
                                                                width: 24,
                                                                excavate: true,
                                                            } : undefined}
                                                        />
                                                    </div>
                                                    <div className="text-sm text-muted-foreground space-y-1">
                                                        <p><span className="font-medium">Target:</span> {seller.url}</p>
                                                        <p><span className="font-medium">Color:</span> {seller.qrColor || "Default (Black)"}</p>
                                                        <p><span className="font-medium">Logo:</span> {seller.qrLogo ? "Uploaded" : "None"}</p>
                                                        <p className="text-xs text-primary pt-1">Click to edit</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
