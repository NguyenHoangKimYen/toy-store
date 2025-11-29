import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, MessagesSquare, MapPin } from 'lucide-react';
import { ROUTES } from '@/config/routes';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden text-slate-100 mt-6 border-t border-white/5">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-indigo-900/90 to-slate-900" />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Top footer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
          {/* Brand */}
          <div className="space-y-2">
            <Link to={ROUTES.HOME} className="brand-logo text-2xl md:text-3xl font-semibold tracking-tight">
              MilkyBloom
            </Link>
            <ul className="space-y-1 text-xs text-white/70">
              <li><Link to={ROUTES.ABOUT} className="hover:text-cyan-200">About</Link></li>
              <li><Link to={ROUTES.ABOUT} className="hover:text-cyan-200">Our story</Link></li>
            </ul>
          </div>

          {/* Shop */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white/90 uppercase tracking-wide">Shop</p>
            <ul className="space-y-1 text-xs text-white/70">
              <li><Link to={`${ROUTES.PRODUCTS}?sort=newest`} className="hover:text-cyan-200">New arrivals</Link></li>
              <li><Link to={`${ROUTES.PRODUCTS}?category=plushies`} className="hover:text-cyan-200">Plushies</Link></li>
              <li><Link to={`${ROUTES.PRODUCTS}?category=figures`} className="hover:text-cyan-200">Figures</Link></li>
              <li><Link to={ROUTES.PRODUCTS} className="hover:text-cyan-200">All products</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white/90 uppercase tracking-wide">Support</p>
            <ul className="space-y-1 text-xs text-white/70">
              <li><Link to={ROUTES.ORDER_HISTORY} className="hover:text-cyan-200">Order tracking</Link></li>
              <li><Link to={ROUTES.CONTACT} className="hover:text-cyan-200">Shipping</Link></li>
              <li><Link to={ROUTES.CONTACT} className="hover:text-cyan-200">Returns</Link></li>
              <li><Link to={ROUTES.CONTACT} className="hover:text-cyan-200">FAQs</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white/90 uppercase tracking-wide">Connect</p>
            <div className="flex flex-wrap items-center gap-2 text-white/70">
              <a className="hover:text-cyan-200" href="https://discord.gg" target="_blank" rel="noreferrer" aria-label="Discord">
                <MessagesSquare size={16} />
              </a>
              <a className="hover:text-cyan-200" href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a className="hover:text-cyan-200" href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook size={16} />
              </a>
              <a className="hover:text-cyan-200" href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                <Youtube size={16} />
              </a>
            </div>
            <div className="space-y-0.5 text-white/70 text-xs">
              <p>19 Nguyễn Hữu Thọ, Q7, HCM</p>
              <p><a className="hover:text-cyan-200" href="mailto:hello@milkybloom.com">hello@milkybloom.com</a></p>
              <p><a className="hover:text-cyan-200" href="tel:+84987654321">(+84) 987-654-321</a></p>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="rounded-xl bg-white/10 border border-white/10 p-3">
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
            <MapPin size={14} /> MilkyBloom Headquarters
          </div>
          <div className="relative w-full h-[180px] rounded-lg overflow-hidden border border-white/10">
            <iframe
              title="MilkyBloom Map"
              className="absolute inset-0 w-full h-full"
              src="https://www.google.com/maps?q=19%20Nguyen%20Huu%20Tho,%20Tan%20Phong,%20District%207,%20Ho%20Chi%20Minh&output=embed"
              loading="lazy"
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-4 text-center text-xs text-white/60">
          © 2025 MilkyBloom — Crafted for collectors and dreamers.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
