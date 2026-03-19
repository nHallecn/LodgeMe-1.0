import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const dashboardPath = user?.role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard";

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">LodgeMe</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          <NavItem to="/" label="Home" active={location.pathname === "/"} />
          <NavItem to="/properties" label="Properties" active={location.pathname.startsWith("/properties")} />
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to={dashboardPath} className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-foreground">{user?.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <div className="flex flex-col gap-2">
            <Link to="/" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/properties" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary" onClick={() => setMobileOpen(false)}>Properties</Link>
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Button variant="ghost" className="justify-start" onClick={() => { logout(); setMobileOpen(false); }}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Button size="sm" asChild>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const NavItem = ({ to, label, active }: { to: string; label: string; active: boolean }) => (
  <Link
    to={to}
    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
  >
    {label}
  </Link>
);

export default Navbar;
