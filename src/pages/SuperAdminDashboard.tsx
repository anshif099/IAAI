import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { toPng, toSvg } from "html-to-image";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { Download } from "lucide-react";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";

const SuperAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<"qr" | "feedback">("qr");
    const [url, setUrl] = useState("https://www.google.com");
    const [color, setColor] = useState("#000000");
    const [logo, setLogo] = useState<string | null>(null);
    const qrRef = useRef<HTMLDivElement>(null);

    // Feedback State
    const [feedbackList, setFeedbackList] = useState<any[]>([]);

    useEffect(() => {
        const storedFeedback = JSON.parse(localStorage.getItem("internal_feedback") || "[]");
        setFeedbackList(storedFeedback);
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
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(item.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <CardDescription>Target: {item.targetUrl}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="whitespace-pre-wrap">{item.comment}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
