import { Link } from "react-router-dom";
import { Home, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">LodgeMe</span>
            </div>
            <p className="text-sm leading-relaxed opacity-70">
              Cameroon's most trusted rental marketplace. Connecting tenants with verified landlords seamlessly.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider opacity-50">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/properties" className="text-sm opacity-70 transition-opacity hover:opacity-100">Browse Properties</Link>
              <Link to="/register" className="text-sm opacity-70 transition-opacity hover:opacity-100">Create Account</Link>
              <Link to="/login" className="text-sm opacity-70 transition-opacity hover:opacity-100">Sign In</Link>
            </div>
          </div>

          {/* For Landlords */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider opacity-50">For Landlords</h4>
            <div className="flex flex-col gap-2">
              <Link to="/register" className="text-sm opacity-70 transition-opacity hover:opacity-100">List Property</Link>
              <span className="text-sm opacity-70">Manage Tenants</span>
              <span className="text-sm opacity-70">Track Payments</span>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider opacity-50">Contact</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm opacity-70">
                <MapPin className="h-4 w-4 shrink-0" /> Douala, Cameroon
              </div>
              <div className="flex items-center gap-2 text-sm opacity-70">
                <Mail className="h-4 w-4 shrink-0" /> hello@lodgeme.cm
              </div>
              <div className="flex items-center gap-2 text-sm opacity-70">
                <Phone className="h-4 w-4 shrink-0" /> +237 6XX XXX XXX
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-background/10 pt-8 text-center text-sm opacity-50">
          © {new Date().getFullYear()} LodgeMe. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
