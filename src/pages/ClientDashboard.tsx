import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCodeSVG } from "qrcode.react";
import { toPng, toSvg } from "html-to-image";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { Download, LogOut, LayoutDashboard, MessageSquare, Trash2, UserCircle, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { ref, onValue, set, remove } from "firebase/database";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";


const stripSensitiveClientData = (clientData: any) => {
    if (!clientData) return clientData;
    const { password, ...safeData } = clientData;
    return safeData;
};

const ClientDashboard = () => {
    const navigate = useNavigate();
    const [client, setClient] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("feedback");
    const [feedback, setFeedback] = useState<any[]>([]);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const currentClientStr = localStorage.getItem("current_client");
        if (currentClientStr) {
            setClient(JSON.parse(currentClientStr));
        } else {
            navigate("/login");
        }
    }, [navigate]);

    // Fetch Feedback
    useEffect(() => {
        if (!client?.slug) return;

        const feedbackRef = ref(db, 'feedback');
        const unsubscribe = onValue(feedbackRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Filter feedback meant only for this specific client QR
                const feedbackArray = Object.entries(data)
                    .map(([key, value]) => ({
                        ...(value as any),
                        id: key
                    }))
                    .filter((item: any) => item.clientSlug === client.slug)
                    .reverse();
                setFeedback(feedbackArray);
            } else {
                setFeedback([]);
            }
        });
        return () => unsubscribe();
    }, [client]);

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

    const handleLogout = () => {
        localStorage.removeItem("current_client");
        navigate("/login");
    };

    const handleUpdateProfile = async () => {
        if (!client) return;
        try {
            const clientRef = ref(db, `clients/${client.id}`);
            const updateData = {
                ...client,
                qrColor: client.qrColor || "#000000",
                qrLogo: client.qrLogo || null
            };
            const { id, ...dataToSave } = updateData;

            await set(clientRef, dataToSave);

            setClient({ ...updateData, id });
            localStorage.setItem("current_client", JSON.stringify(stripSensitiveClientData({ ...updateData, id })));

            toast.success("Profile updated successfully");
            setIsEditingProfile(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        }
    };

    const downloadQRCode = (format: 'png' | 'svg' | 'pdf') => {
        const qrElement = document.getElementById("qr-code-element");
        if (!qrElement) return;

        const fileName = `${client.name?.replace(/\s+/g, '_')}_QR`;

        if (format === 'png') {
            toPng(qrElement).then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `${fileName}.png`;
                link.href = dataUrl;
                link.click();
            });
        } else if (format === 'svg') {
            toSvg(qrElement).then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `${fileName}.svg`;
                link.href = dataUrl;
                link.click();
            });
        } else if (format === 'pdf') {
            toPng(qrElement).then((dataUrl) => {
                const pdf = new jsPDF();
                pdf.addImage(dataUrl, 'PNG', 15, 40, 180, 180);
                pdf.save(`${fileName}.pdf`);
            });
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setClient({ ...client, qrLogo: event.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    if (!client) return null;

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
    };

    const SidebarContent = () => (
        <div className="w-64 bg-white h-full flex flex-col">
            <div className="h-16 flex items-center px-6 border-b shrink-0">
                <LayoutDashboard className="h-6 w-6 text-primary mr-2" />
                <span className="font-bold text-lg">Client Dashboard</span>
            </div>

            <div className="p-4 flex-1 space-y-2 overflow-y-auto">
                <Button
                    variant={activeTab === "feedback" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleTabChange("feedback")}
                >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Feedback
                </Button>
                <Button
                    variant={activeTab === "qr" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleTabChange("qr")}
                >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    QR Generator
                </Button>
                <Button
                    variant={activeTab === "profile" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleTabChange("profile")}
                >
                    <UserCircle className="h-4 w-4 mr-2" />
                    Profile
                </Button>
            </div>

            <div className="p-4 border-t shrink-0">
                <div className="mb-4 px-2">
                    <p className="text-sm font-medium">{client.name}</p>
                    <p className="text-xs text-muted-foreground break-all">{client.email}</p>
                </div>
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 w-full overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-64 bg-white border-r flex-col shrink-0">
                <SidebarContent />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 bg-white border-b h-16 shrink-0">
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
                    {activeTab === "feedback" && (
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div>
                                <h1 className="text-3xl font-bold">Client Feedback</h1>
                                <p className="text-muted-foreground">Negative feedback (1-3 stars) from your QR code</p>
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
                                                <CardDescription>Target: {item.targetUrl}</CardDescription>
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
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "qr" && (
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div>
                                <h1 className="text-3xl font-bold">QR Generator</h1>
                                <p className="text-muted-foreground">Generate and customize your review QR code.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>QR Code Settings</CardTitle>
                                        <CardDescription>Customize the appearance of your QR code.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>QR Code Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="color"
                                                    value={client.qrColor || "#000000"}
                                                    onChange={(e) => setClient({ ...client, qrColor: e.target.value })}
                                                    className="w-12 h-12 p-1 cursor-pointer"
                                                />
                                                <Input
                                                    type="text"
                                                    value={client.qrColor || "#000000"}
                                                    onChange={(e) => setClient({ ...client, qrColor: e.target.value })}
                                                    className="flex-1 font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Center Logo</Label>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                            />
                                            {client.qrLogo && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-2 text-destructive"
                                                    onClick={() => setClient({ ...client, qrLogo: null })}
                                                >
                                                    Remove Logo
                                                </Button>
                                            )}
                                        </div>
                                        <Button onClick={handleUpdateProfile} className="w-full">
                                            Save QR Settings
                                        </Button>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4 flex flex-col items-center justify-start">
                                    <div className="bg-white p-8 rounded-xl shadow-sm border" id="qr-code-element">
                                        <div className="flex justify-center py-2">
                                            <QRCodeSVG
                                                value={`${window.location.origin}/review/${client.slug}`}
                                                size={200}
                                                fgColor={client.qrColor || "#000000"}
                                                level="H"
                                                imageSettings={client.qrLogo ? {
                                                    src: client.qrLogo,
                                                    x: undefined,
                                                    y: undefined,
                                                    height: 48,
                                                    width: 48,
                                                    excavate: true,
                                                } : undefined}
                                            />
                                        </div>
                                        <p className="text-sm text-gray-500 text-center mt-2">Scan to leave a review</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 w-full max-w-xs pt-4">
                                        <Button variant="outline" className="w-full" onClick={() => downloadQRCode('png')}>
                                            <Download className="mr-2 h-4 w-4" /> PNG
                                        </Button>
                                        <Button variant="outline" className="w-full" onClick={() => downloadQRCode('svg')}>
                                            <Download className="mr-2 h-4 w-4" /> SVG
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "profile" && (
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div>
                                <h1 className="text-3xl font-bold">Client Profile</h1>
                                <p className="text-muted-foreground">Manage your account details and review URL.</p>
                            </div>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Profile Information</CardTitle>
                                        <CardDescription>{isEditingProfile ? "Edit your details below." : "Your registered details."}</CardDescription>
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
                                                    <Label>Client Name</Label>
                                                    <Input
                                                        value={client.name}
                                                        onChange={(e) => setClient({ ...client, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Company Name</Label>
                                                    <Input
                                                        value={client.companyName || ""}
                                                        onChange={(e) => setClient({ ...client, companyName: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Review URL</Label>
                                                    <Input
                                                        value={client.reviewUrl}
                                                        onChange={(e) => setClient({ ...client, reviewUrl: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Password</Label>
                                                    <Input
                                                        type="password"
                                                        value={client.password}
                                                        onChange={(e) => setClient({ ...client, password: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label>Address</Label>
                                                    <Input
                                                        value={client.address || ""}
                                                        onChange={(e) => setClient({ ...client, address: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label>Suggested Positive Reviews (One per line)</Label>
                                                    <textarea
                                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        value={client.suggestedReviews || ""}
                                                        onChange={(e) => setClient({ ...client, suggestedReviews: e.target.value })}
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 pt-4">
                                                <Button variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                                                <Button onClick={handleUpdateProfile}>Save Changes</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                                            <div>
                                                <Label className="text-muted-foreground">Client Name</Label>
                                                <p className="font-medium text-lg">{client.name}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">Company Name</Label>
                                                <p className="font-medium text-lg">{client.companyName || "N/A"}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">URL Slug</Label>
                                                <p className="font-medium font-mono p-1 bg-muted rounded w-fit">{client.slug}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">Email</Label>
                                                <p className="font-medium">{client.email}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">Mobile</Label>
                                                <p className="font-medium">{client.mobile || "N/A"}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">Review URL</Label>
                                                <a href={client.reviewUrl} target="_blank" rel="noreferrer" className="block font-medium text-blue-600 hover:underline break-all">
                                                    {client.reviewUrl}
                                                </a>
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label className="text-muted-foreground">Address</Label>
                                                <p className="font-medium">{client.address || "N/A"}</p>
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

export default ClientDashboard;
