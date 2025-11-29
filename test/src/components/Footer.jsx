import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, MessagesSquare, MapPin } from 'lucide-react';
import { ROUTES } from '@/config/routes';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden text-slate-100 mt-6 border-t border-white/5">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-indigo-900/90 to-slate-900" />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Links row */}
        <div className="flex flex-wrap justify-between items-start gap-6">
          {/* Brand & Social */}
          <div className="space-y-3">
            <Link to={ROUTES.HOME} className="brand-logo text-3xl font-semibold tracking-tight">
              MilkyBloom
            </Link>
            <div className="flex items-center gap-3 text-white/80">
              <a className="hover:text-cyan-200" href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a className="hover:text-cyan-200" href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a className="hover:text-cyan-200" href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                <Youtube size={20} />
              </a>
              <a className="hover:text-cyan-200" href="https://discord.gg" target="_blank" rel="noreferrer" aria-label="Discord">
                <MessagesSquare size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex gap-8 text-sm text-white/80">
            <Link to={ROUTES.PRODUCTS} className="hover:text-cyan-200">Shop</Link>
            <Link to={ROUTES.ABOUT} className="hover:text-cyan-200">About</Link>
            <Link to={ROUTES.CONTACT} className="hover:text-cyan-200">Contact</Link>
            <Link to={ROUTES.ORDER_HISTORY} className="hover:text-cyan-200">Orders</Link>
          </div>

          {/* Contact Info */}
          <div className="text-sm text-white/80 text-right">
            <p>19 Nguyễn Hữu Thọ, Q7, HCM</p>
            <p><a className="hover:text-cyan-200" href="mailto:hello@milkybloom.com">hello@milkybloom.com</a></p>
          </div>
        </div>

        {/* Map */}
        <div className="rounded-xl overflow-hidden border border-white/10">
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium px-3 py-2 bg-white/5">
            <MapPin size={16} /> Our Location
          </div>
          <div className="relative w-full h-[220px]">
            <iframe
              title="MilkyBloom Map"
              className="absolute inset-0 w-full h-full"
              src="https://www.google.com/maps?q=19%20Nguyen%20Huu%20Tho,%20Tan%20Phong,%20District%207,%20Ho%20Chi%20Minh&output=embed"
              loading="lazy"
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="text-center text-sm text-white/60">
          © 2025 MilkyBloom
        </div>
      </div>
    </footer>
  );
};

export default Footer;
