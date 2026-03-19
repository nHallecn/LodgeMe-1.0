/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(email, password);
      login(data.token, data.user);
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.response?.data?.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - decorative */}
      <div className="hidden w-1/2 bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20">
            <Home className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold text-primary-foreground">Welcome Back to LodgeMe</h2>
          <p className="mt-4 text-primary-foreground/70 leading-relaxed">
            Manage your properties, track payments, and connect with tenants — all from one dashboard.
          </p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">LodgeMe</span>
            </Link>
          </div>

          <Card className="border-border shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="font-display text-2xl">Sign In</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  Register here
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
