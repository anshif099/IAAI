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
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // Clients State
    const [clients, setClients] = useState<any[]>([]);
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

    const handleUpdateProfile = async () => {
        if (!seller) return;
        try {
            const sellerRef = ref(db, `sellers/${seller.id}`);
            const { id, ...updateData } = seller;
            await set(sellerRef, updateData);

            // Update local storage
            localStorage.setItem("current_seller", JSON.stringify(seller));

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
                                            <a href={client.reviewUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all">{client.reviewUrl}</a>
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
    );
};

export default SellerDashboard;
