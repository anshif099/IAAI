import { LayoutDashboard, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SuperAdminSidebarProps {
    activeTab: "qr" | "feedback";
    setActiveTab: (tab: "qr" | "feedback") => void;
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
