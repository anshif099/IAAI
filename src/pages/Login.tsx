import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/firebase";
import { ref, query, orderByChild, equalTo, get } from "firebase/database";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // 1. Check Super Admin
        if (email === "iaai@gmail.com" && password === "iaai@123") {
            setTimeout(() => {
                setIsLoading(false);
                toast.success("Logged in successfully as Super Admin!");
                navigate("/super-admin");
            }, 500);
            return;
        }

        // 2. Check Seller Login (Firebase)
        try {
            const sellersRef = ref(db, 'sellers');
            const emailQuery = query(sellersRef, orderByChild('email'), equalTo(email));
            const snapshot = await get(emailQuery);

            if (snapshot.exists()) {
                const sellersData = snapshot.val();
                const sellerKey = Object.keys(sellersData)[0];
                const seller = { ...sellersData[sellerKey], id: sellerKey };

                if (seller.password === password) {
                    localStorage.setItem("current_seller", JSON.stringify(seller));
                    toast.success(`Welcome back, ${seller.name}!`);
                    navigate("/seller-dashboard");
                } else {
                    toast.error("Invalid password");
                }
            } else {
                toast.error("User not found");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Login failed due to a system error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="absolute top-4 left-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link to="/" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </div>

            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password to access your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link to="#" className="text-sm font-medium text-primary hover:underline tabs-trigger">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full gradient-btn border-0" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                        <div className="text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link to="#" className="font-medium text-primary hover:underline">
                                Sign up
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Login;
