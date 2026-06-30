import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, KeyRound, Loader2, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types";

type LoginPageProps = {
  mode?: "login" | "register";
};

const LoginPage = ({ mode = "login" }: LoginPageProps) => {
  const isRegister = mode === "register";
  const { login } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState("tenant");
  const [devCode, setDevCode] = useState("");
  const [loading, setLoading] = useState(false);

  const requestOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.requestOtp(phone);
      setDevCode(String((data as { devCode?: string }).devCode || ""));
      setStep("code");
      toast({ title: "OTP sent", description: "Check your SMS messages." });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      toast({ title: "Could not send OTP", description: err.response?.data?.error?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.verifyOtp({
        phone,
        code,
        fullName,
        city,
        role,
        preferredLang: "fr",
      });
      const payload = data as { token?: string; accessToken?: string; user: User };
      login(payload.token || payload.accessToken || "", payload.user);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      toast({ title: "OTP verification failed", description: err.response?.data?.error?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold">RentCam</span>
        </Link>
        <div>
          <h1 className="font-display text-4xl font-bold">Phone-first rental access for Cameroon.</h1>
          <p className="mt-4 max-w-md text-white/70">
            Use one Cameroon number to search, inquire, list property, and manage verification workflows.
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold">RentCam</span>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl">{isRegister ? "Create RentCam account" : "Sign in with phone"}</CardTitle>
              <CardDescription>{step === "phone" ? "Enter your Cameroon number to receive a 6-digit code." : "Enter the OTP code to continue."}</CardDescription>
            </CardHeader>
            <CardContent>
              {step === "phone" ? (
                <form onSubmit={requestOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+237671234567" className="pl-9" required />
                    </div>
                  </div>
                  {isRegister && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full name</Label>
                        <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Douala" />
                      </div>
                      <div className="space-y-2">
                        <Label>Profile type</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {["tenant", "landlord", "agent"].map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setRole(item)}
                              className={`rounded-md border px-3 py-2 text-sm capitalize ${role === item ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                    Send OTP
                  </Button>
                </form>
              ) : (
                <form onSubmit={verifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">OTP code</Label>
                    <Input id="code" value={code} onChange={(event) => setCode(event.target.value)} inputMode="numeric" maxLength={6} placeholder="123456" required />
                    {devCode && <p className="text-xs text-muted-foreground">Development code: {devCode}</p>}
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Verify and continue
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("phone")}>
                    Change phone number
                  </Button>
                </form>
              )}

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {isRegister ? "Already have an account?" : "New to RentCam?"}{" "}
                <Link to={isRegister ? "/auth/login" : "/auth/register"} className="font-medium text-primary hover:underline">
                  {isRegister ? "Sign in" : "Create account"}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
