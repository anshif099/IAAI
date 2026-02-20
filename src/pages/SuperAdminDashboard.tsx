import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { toPng, toSvg } from "html-to-image";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { Download, Trash2 } from "lucide-react";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";
import { db } from "@/lib/firebase";
import { ref, onValue, remove, push, set } from "firebase/database";
import { useNavigate } from "react-router-dom";

const SuperAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<"qr" | "feedback" | "sellers">("qr");
    const navigate = useNavigate();
    const [url, setUrl] = useState(() => localStorage.getItem("qr_url") || "https://www.google.com");
    const [color, setColor] = useState(() => localStorage.getItem("qr_color") || "#000000");
    const [logo, setLogo] = useState<string | null>(() => localStorage.getItem("qr_logo") || null);
    const qrRef = useRef<HTMLDivElement>(null);

    // Persist QR State
    useEffect(() => {
        localStorage.setItem("qr_url", url);
    }, [url]);

    useEffect(() => {
        localStorage.setItem("qr_color", color);
    }, [color]);

    useEffect(() => {
        if (logo) {
            try {
                localStorage.setItem("qr_logo", logo);
            } catch (e) {
                console.error("Logo too large to save to localStorage");
            }
        } else {
            localStorage.removeItem("qr_logo");
        }
    }, [logo]);

    // Feedback State
    const [feedbackList, setFeedbackList] = useState<any[]>([]);

    // Sellers State
    const [sellers, setSellers] = useState<any[]>([]);
    const [newSeller, setNewSeller] = useState({
        name: "",
        email: "",
        password: "",
        mobile: "",
        companyName: "",
        url: "",
        address: ""
    });

    // View Seller Details State
    const [selectedSeller, setSelectedSeller] = useState<any>(null);
    const [isSellerDialogOpen, setIsSellerDialogOpen] = useState(false);
    const [isEditingSeller, setIsEditingSeller] = useState(false);

    // Reset edit mode when dialog closes
    useEffect(() => {
        if (!isSellerDialogOpen) {
            setIsEditingSeller(false);
        }
    }, [isSellerDialogOpen]);

    useEffect(() => {
        const feedbackRef = ref(db, 'feedback');
        const unsubscribe = onValue(feedbackRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Map entries to include the Firebase key and filter for generic feedback (no clientSlug)
                const feedbackArray = Object.entries(data)
                    .map(([key, value]) => ({
                        ...(value as any),
                        firebaseKey: key
                    }))
                    .filter((item: any) => !item.clientSlug) // Super Admin only sees generic feedback
                    .reverse();
                setFeedbackList(feedbackArray);
            } else {
                setFeedbackList([]);
            }
        });

        const sellersRef = ref(db, 'sellers');
        const unsubscribeSellers = onValue(sellersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const sellersArray = Object.entries(data).map(([key, value]) => ({
                    ...(value as any),
                    id: key
                })).reverse();
                setSellers(sellersArray);
            } else {
                setSellers([]);
            }
        });

        return () => {
            unsubscribe();
            unsubscribeSellers();
        };
    }, [activeTab]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setLogo(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDownload = async (format: "png" | "svg" | "pdf") => {
        if (!qrRef.current) return;

        try {
            const fileName = `google-review-qr.${format}`;

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
            toast.success(`Downloaded as ${format.toUpperCase()}`);
        } catch (err) {
            console.error("Download failed", err);
            toast.error("Failed to download QR code");
        }
    };

    const handleDelete = async (firebaseKey: string) => {
        if (window.confirm("Are you sure you want to delete this feedback? This action cannot be undone.")) {
            try {
                const itemRef = ref(db, `feedback/${firebaseKey}`);
                await remove(itemRef);
                toast.success("Feedback deleted successfully");
            } catch (error) {
                console.error("Error deleting feedback:", error);
                toast.error("Failed to delete feedback");
            }
        }
    };

    const handleCreateSeller = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const sellersRef = ref(db, 'sellers');
            const newSellerRef = push(sellersRef);
            await set(newSellerRef, {
                ...newSeller,
                createdAt: new Date().toISOString()
            });
            toast.success("Seller created successfully");
            setNewSeller({
                name: "",
                email: "",
                password: "",
                mobile: "",
                companyName: "",
                url: "",
                address: ""
            });
        } catch (error) {
            console.error("Error creating seller:", error);
            toast.error("Failed to create seller");
        }
    };

    const handleLoginAsSeller = (seller: any) => {
        localStorage.setItem("current_seller", JSON.stringify(seller));
        toast.success(`Logging in as ${seller.name}...`);
        navigate("/seller-dashboard");
    };

    const handleUpdateSeller = async () => {
        if (!selectedSeller) return;
        try {
            const sellerRef = ref(db, `sellers/${selectedSeller.id}`);
            // Remove the ID from the object before saving
            const { id, ...updateData } = selectedSeller;
            await set(sellerRef, updateData);
            toast.success("Seller updated successfully");
            setIsEditingSeller(false);
        } catch (error) {
            console.error("Error updating seller:", error);
            toast.error("Failed to update seller");
        }
    };

    // Construct the smart URL
    const baseUrl = window.location.origin;
    const smartUrl = `${baseUrl}/feedback?target=${encodeURIComponent(url)}`;

    return (
        <div className="flex min-h-screen bg-background">
            <SuperAdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-1 p-8 overflow-auto">
                {activeTab === "qr" && (
                    <div className="max-w-6xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">QR Generator</h1>
                            <p className="text-muted-foreground">Create smart QR codes for your Google Reviews</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Configuration</CardTitle>
                                    <CardDescription>Setup your target URL and styling</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="url">Google Review URL</Label>
                                        <Input
                                            id="url"
                                            placeholder="Paste your Google Review link here"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            The QR code will point to our smart feedback page, which redirects 4-5 star reviews to this URL.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="color">QR Code Color</Label>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                id="color"
                                                type="color"
                                                value={color}
                                                onChange={(e) => setColor(e.target.value)}
                                                className="w-20 h-10 p-1 cursor-pointer"
                                            />
                                            <span className="text-sm text-muted-foreground font-mono">{color}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="logo">Logo Overlay (Optional)</Label>
                                        <div className="flex items-center gap-4">
                                            <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} />
                                            {logo && (
                                                <Button variant="outline" size="sm" onClick={() => setLogo(null)}>
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <Label>Download Options</Label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <Button variant="outline" onClick={() => handleDownload("png")}>
                                                <Download className="mr-2 h-4 w-4" /> PNG
                                            </Button>
                                            <Button variant="outline" onClick={() => handleDownload("svg")}>
                                                <Download className="mr-2 h-4 w-4" /> SVG
                                            </Button>
                                            <Button variant="outline" onClick={() => handleDownload("pdf")}>
                                                <Download className="mr-2 h-4 w-4" /> PDF
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="flex flex-col justify-center items-center bg-secondary/20 h-fit min-h-[600px]">
                                <CardHeader>
                                    <CardTitle>Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
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
                                                value={smartUrl}
                                                size={200}
                                                fgColor={color}
                                                bgColor="#ffffff"
                                                level="H"
                                                imageSettings={
                                                    logo
                                                        ? {
                                                            src: logo,
                                                            x: undefined,
                                                            y: undefined,
                                                            height: 40,
                                                            width: 40,
                                                            excavate: true,
                                                        }
                                                        : undefined
                                                }
                                            />
                                        </div>

                                        <div className="z-10 text-center mb-6">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-2 overflow-hidden shadow-inner">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5f6368" className="w-10 h-10">
                                                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="flex justify-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <svg key={star} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FBBC05" className="w-4 h-4">
                                                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <div className="h-2 w-24 bg-gray-100 rounded-full mx-auto mt-2"></div>
                                            <div className="h-2 w-16 bg-gray-100 rounded-full mx-auto mt-1"></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === "feedback" && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Internal Feedback</h1>
                            <p className="text-muted-foreground">Review negative feedback captured by the smart system (1-3 stars)</p>
                        </div>

                        {feedbackList.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center text-muted-foreground">
                                    No feedback received yet.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {feedbackList.map((item: any) => (
                                    <Card key={item.id}>
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="flex items-center gap-2">
                                                    Rating: {item.rating} / 5
                                                    <div className="flex">
                                                        {[...Array(item.rating)].map((_, i) => (
                                                            <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FBBC05" className="w-4 h-4">
                                                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                </CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">
                                                        {new Date(item.date).toLocaleDateString()}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDelete(item.firebaseKey)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <CardDescription>
                                                {item.clientSlug && <span className="font-semibold text-primary mr-2">{item.clientSlug}</span>}
                                                <span className="text-xs block sm:inline">Target: {item.targetUrl}</span>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {item.photoURL && (
                                                        <img src={item.photoURL} alt="User" className="w-6 h-6 rounded-full" />
                                                    )}
                                                    <div className="flex flex-col">
                                                        {item.displayName && (
                                                            <span className="text-sm font-medium text-gray-900">{item.displayName}</span>
                                                        )}
                                                        {item.email && (
                                                            <span className="text-xs text-blue-600">{item.email}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="whitespace-pre-wrap">{item.comment}</p>
                                            {item.images && item.images.length > 0 && (
                                                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                                    {item.images.map((img: string, i: number) => (
                                                        <img
                                                            key={i}
                                                            src={img}
                                                            alt={`Attachment ${i + 1}`}
                                                            className="w-24 h-24 object-cover rounded-md border cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => window.open(img, "_blank")}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "sellers" && (
                    <div className="max-w-6xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Seller Management</h1>
                            <p className="text-muted-foreground">Manage sellers and access their dashboards</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Create Seller Form */}
                            <Card className="h-fit">
                                <CardHeader>
                                    <CardTitle>Add New Seller</CardTitle>
                                    <CardDescription>Create a new seller account</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateSeller} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Seller Name</Label>
                                            <Input
                                                id="name"
                                                value={newSeller.name}
                                                onChange={(e) => setNewSeller({ ...newSeller, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={newSeller.email}
                                                onChange={(e) => setNewSeller({ ...newSeller, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password</Label>
                                            <Input
                                                id="password"
                                                type="text"
                                                value={newSeller.password}
                                                onChange={(e) => setNewSeller({ ...newSeller, password: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mobile">Mobile</Label>
                                            <Input
                                                id="mobile"
                                                value={newSeller.mobile}
                                                onChange={(e) => setNewSeller({ ...newSeller, mobile: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="companyName">Company Name</Label>
                                            <Input
                                                id="companyName"
                                                value={newSeller.companyName}
                                                onChange={(e) => setNewSeller({ ...newSeller, companyName: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="companyUrl">Company URL</Label>
                                            <Input
                                                id="companyUrl"
                                                value={newSeller.url}
                                                onChange={(e) => setNewSeller({ ...newSeller, url: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="address">Address</Label>
                                            <Input
                                                id="address"
                                                value={newSeller.address}
                                                onChange={(e) => setNewSeller({ ...newSeller, address: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" className="w-full">Create Seller</Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Sellers List */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Existing Sellers</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {sellers.length === 0 ? (
                                            <p className="text-muted-foreground text-center py-4">No sellers found.</p>
                                        ) : (
                                            sellers.map((seller) => (
                                                <div key={seller.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg gap-4 bg-card hover:bg-accent/5 transition-colors">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{seller.companyName}</h3>
                                                        <div className="text-sm text-muted-foreground space-y-1">
                                                            <p>Name: {seller.name}</p>
                                                            <p>Email: {seller.email}</p>
                                                            <p>Mobile: {seller.mobile}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                                        <Button variant="outline" onClick={() => {
                                                            setSelectedSeller(seller);
                                                            setIsSellerDialogOpen(true);
                                                        }}>
                                                            View Details
                                                        </Button>
                                                        <Button variant="outline" onClick={() => handleLoginAsSeller(seller)}>
                                                            Login as Seller
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Dialog open={isSellerDialogOpen} onOpenChange={setIsSellerDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Seller Details</DialogTitle>
                                    <DialogDescription>
                                        {isEditingSeller ? "Edit seller information and QR settings" : `Full information for ${selectedSeller?.companyName}`}
                                    </DialogDescription>
                                </DialogHeader>
                                {selectedSeller && (
                                    <div className="space-y-4">
                                        {isEditingSeller ? (
                                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Company Name</Label>
                                                        <Input
                                                            value={selectedSeller.companyName}
                                                            onChange={(e) => setSelectedSeller({ ...selectedSeller, companyName: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Seller Name</Label>
                                                        <Input
                                                            value={selectedSeller.name}
                                                            onChange={(e) => setSelectedSeller({ ...selectedSeller, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Email</Label>
                                                        <Input
                                                            value={selectedSeller.email}
                                                            onChange={(e) => setSelectedSeller({ ...selectedSeller, email: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Password</Label>
                                                        <Input
                                                            value={selectedSeller.password}
                                                            onChange={(e) => setSelectedSeller({ ...selectedSeller, password: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Mobile</Label>
                                                        <Input
                                                            value={selectedSeller.mobile}
                                                            onChange={(e) => setSelectedSeller({ ...selectedSeller, mobile: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Address</Label>
                                                        <Input
                                                            value={selectedSeller.address}
                                                            onChange={(e) => setSelectedSeller({ ...selectedSeller, address: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="col-span-2 space-y-2">
                                                        <Label>Company URL</Label>
                                                        <Input
                                                            value={selectedSeller.url}
                                                            onChange={(e) => setSelectedSeller({ ...selectedSeller, url: e.target.value })}
                                                        />
                                                    </div>

                                                    {/* QR Customization */}
                                                    <div className="col-span-2 border-t pt-4 mt-2">
                                                        <h4 className="font-semibold mb-2">QR Code Settings</h4>
                                                        <div className="flex gap-4 items-start">
                                                            <div className="space-y-4 flex-1">
                                                                <div className="space-y-2">
                                                                    <Label>QR Color</Label>
                                                                    <div className="flex items-center gap-2">
                                                                        <Input
                                                                            type="color"
                                                                            value={selectedSeller.qrColor || "#000000"}
                                                                            onChange={(e) => setSelectedSeller({ ...selectedSeller, qrColor: e.target.value })}
                                                                            className="w-12 h-10 p-1"
                                                                        />
                                                                        <span className="text-sm text-muted-foreground">{selectedSeller.qrColor || "#000000"}</span>
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
                                                                                    setSelectedSeller({ ...selectedSeller, qrLogo: ev.target?.result as string });
                                                                                };
                                                                                reader.readAsDataURL(file);
                                                                            }
                                                                        }}
                                                                    />
                                                                    {selectedSeller.qrLogo && (
                                                                        <Button variant="outline" size="sm" onClick={() => setSelectedSeller({ ...selectedSeller, qrLogo: null })}>
                                                                            Remove Logo
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="bg-white p-4 rounded border shadow-sm flex items-center justify-center">
                                                                <QRCodeSVG
                                                                    value={selectedSeller.url || "https://example.com"}
                                                                    size={120}
                                                                    fgColor={selectedSeller.qrColor || "#000000"}
                                                                    imageSettings={selectedSeller.qrLogo ? {
                                                                        src: selectedSeller.qrLogo,
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
                                                    <Button variant="outline" onClick={() => setIsEditingSeller(false)}>Cancel</Button>
                                                    <Button onClick={handleUpdateSeller}>Save Changes</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <Label className="text-muted-foreground">Company Name</Label>
                                                        <p className="font-medium">{selectedSeller.companyName}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-muted-foreground">Seller Name</Label>
                                                        <p className="font-medium">{selectedSeller.name}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-muted-foreground">Email</Label>
                                                        <p className="font-medium">{selectedSeller.email}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-muted-foreground">Password</Label>
                                                        <p className="font-medium font-mono bg-muted p-1 rounded w-fit">{selectedSeller.password}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-muted-foreground">Mobile</Label>
                                                        <p className="font-medium">{selectedSeller.mobile}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-muted-foreground">Address</Label>
                                                        <p className="font-medium">{selectedSeller.address}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-muted-foreground">Created At</Label>
                                                        <p className="font-medium">{new Date(selectedSeller.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label className="text-muted-foreground">Company URL</Label>
                                                        <p className="font-medium break-all">{selectedSeller.url}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label className="text-muted-foreground">Seller ID</Label>
                                                        <p className="font-medium text-xs font-mono bg-muted p-1 rounded">{selectedSeller.id}</p>
                                                    </div>

                                                    {/* QR Preview in View Mode */}
                                                    <div className="col-span-2 border-t pt-4 mt-2">
                                                        <Label className="text-muted-foreground mb-2 block">QR Code Preview</Label>
                                                        <div className="flex items-center gap-4 bg-muted/20 p-4 rounded">
                                                            <QRCodeSVG
                                                                value={selectedSeller.url || "https://example.com"}
                                                                size={80}
                                                                fgColor={selectedSeller.qrColor || "#000000"}
                                                                imageSettings={selectedSeller.qrLogo ? {
                                                                    src: selectedSeller.qrLogo,
                                                                    x: undefined,
                                                                    y: undefined,
                                                                    height: 20,
                                                                    width: 20,
                                                                    excavate: true,
                                                                } : undefined}
                                                            />
                                                            <div className="text-xs text-muted-foreground">
                                                                <p>Color: {selectedSeller.qrColor || "Default (Black)"}</p>
                                                                <p>Logo: {selectedSeller.qrLogo ? "Uploaded" : "None"}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end pt-4">
                                                    <Button onClick={() => setIsEditingSeller(true)}>Edit Details</Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
