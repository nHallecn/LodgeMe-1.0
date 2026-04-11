import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, Building2, Users, CreditCard, FileText,
  Wrench, Calendar, LogOut, Home, ChevronRight, ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const DashboardLayout = ({ children, title, subtitle }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const landlordLinks = [
    { to: "/landlord/dashboard",   icon: LayoutDashboard, label: "Dashboard" },
    { to: "/landlord/properties",  icon: Building2,       label: "Properties" },
    { to: "/landlord/bookings",    icon: ClipboardList,   label: "Bookings" },
    { to: "/landlord/payments",    icon: CreditCard,      label: "Payments" },
    { to: "/landlord/invoices",    icon: FileText,        label: "Invoices" },
    { to: "/landlord/maintenance", icon: Wrench,          label: "Maintenance" },
  ];

  const tenantLinks = [
    { to: "/tenant/dashboard",   icon: LayoutDashboard, label: "Dashboard" },
    { to: "/tenant/bookings",    icon: Calendar,        label: "Bookings" },
    { to: "/tenant/payments",    icon: CreditCard,      label: "Payments" },
    { to: "/tenant/maintenance", icon: Wrench,          label: "Maintenance" },
    { to: "/tenant/visits",      icon: Users,           label: "Visit Requests" },
  ];

  const links = user?.role === "landlord" ? landlordLinks : tenantLinks;

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Home className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">LodgeMe</span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-secondary p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={logout}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Home className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">LodgeMe</span>
          </Link>
        </header>
        <div className="flex gap-1 overflow-x-auto border-b border-border bg-card p-2 lg:hidden">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{title}</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
