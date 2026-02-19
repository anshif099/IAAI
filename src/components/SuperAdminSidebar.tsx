import { LayoutDashboard, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SuperAdminSidebarProps {
    activeTab: "qr" | "feedback" | "sellers";
    setActiveTab: (tab: "qr" | "feedback" | "sellers") => void;
}

const SuperAdminSidebar = ({ activeTab, setActiveTab }: SuperAdminSidebarProps) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/login");
        toast.info("Logged out successfully");
    };

    return (
        <div className="w-64 bg-card border-r h-screen p-4 flex flex-col">
            <div className="mb-8 px-4">
                <h1 className="text-xl font-bold">Super Admin</h1>
            </div>

            <div className="flex-1 space-y-2">
                <Button
                    variant={activeTab === "qr" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("qr")}
                >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    QR Generator
                </Button>
                <Button
                    variant={activeTab === "feedback" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("feedback")}
                >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Feedback
                </Button>
                <Button
                    variant={activeTab === "sellers" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("sellers")}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4"
                    >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Sellers
                </Button>
            </div>

            <div className="mt-auto">
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
};

export default SuperAdminSidebar;
