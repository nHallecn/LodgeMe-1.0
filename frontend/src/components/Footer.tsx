import { Link } from "react-router-dom";
import { Building2, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">RentCam</span>
            </div>
            <p className="text-sm leading-relaxed text-white/65">
              Verified rental discovery for tenants, landlords, and agents in Cameroon.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/50">Explore</h4>
            <div className="flex flex-col gap-2">
              <Link to="/listings" className="text-sm text-white/70 hover:text-white">Listings</Link>
              <Link to="/auth/register" className="text-sm text-white/70 hover:text-white">Create Account</Link>
              <Link to="/auth/login" className="text-sm text-white/70 hover:text-white">Sign In</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/50">Supply</h4>
            <div className="flex flex-col gap-2">
              <Link to="/landlord/listings/new" className="text-sm text-white/70 hover:text-white">Submit Listing</Link>
              <Link to="/landlord/dashboard" className="text-sm text-white/70 hover:text-white">Landlord Dashboard</Link>
              <Link to="/admin/listings/queue" className="text-sm text-white/70 hover:text-white">Verification Queue</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/50">Contact</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <MapPin className="h-4 w-4 shrink-0" /> Yaounde, Cameroon
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Mail className="h-4 w-4 shrink-0" /> hello@rentcam.cm
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Phone className="h-4 w-4 shrink-0" /> +237 672 433 563
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/45">
          {new Date().getFullYear()} RentCam. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
