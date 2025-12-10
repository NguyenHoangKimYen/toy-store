import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, MessagesSquare, MapPin } from 'lucide-react';
import { ROUTES } from '@/config/routes';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden text-slate-700 mt-6 border-t border-purple-100/20">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#f7edff] via-[#faf5ff] to-white" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_18%,rgba(226,215,255,0.32),transparent_45%),radial-gradient(circle_at_82%_12%,rgba(255,214,240,0.28),transparent_44%),radial-gradient(circle_at_50%_90%,rgba(210,232,255,0.24),transparent_48%)] blur-[72px] opacity-80" />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Top footer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8">
          {/* Brand */}
          <div className="space-y-3 min-w-0">
            <Link to={ROUTES.HOME} className="brand-logo text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight inline-block mb-2 break-words">
              MilkyBloom
            </Link>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li><Link to={ROUTES.ABOUT} className="hover:text-purple-500">About</Link></li>
              <li><Link to={ROUTES.ABOUT} className="hover:text-purple-500">Our story</Link></li>
            </ul>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <p className="text-base font-semibold text-slate-800 uppercase tracking-wide">Shop</p>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li><Link to={`${ROUTES.PRODUCTS}?sortBy=createdAt&sortOrder=desc`} className="hover:text-purple-500">New arrivals</Link></li>
              <li><Link to={ROUTES.PRODUCTS} className="hover:text-purple-500">All products</Link></li>
              <li><Link to={ROUTES.COLLECTION} className="hover:text-purple-500">Collections</Link></li>
              <li><Link to={ROUTES.ABOUT} className="hover:text-purple-500">About us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <p className="text-base font-semibold text-slate-800 uppercase tracking-wide">Support</p>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li><Link to={ROUTES.ORDER_HISTORY} className="hover:text-purple-500">Order tracking</Link></li>
              <li><Link to={ROUTES.CONTACT} className="hover:text-purple-500">Shipping</Link></li>
              <li><Link to={ROUTES.CONTACT} className="hover:text-purple-500">Returns</Link></li>
              <li><Link to={ROUTES.CONTACT} className="hover:text-purple-500">FAQs</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-3">
            <p className="text-base font-semibold text-slate-800 uppercase tracking-wide">Connect</p>
            <div className="flex flex-wrap items-center gap-3 text-slate-600">
              <a className="hover:text-purple-500" href="https://discord.gg" target="_blank" rel="noreferrer" aria-label="Discord">
                <MessagesSquare size={20} />
              </a>
              <a className="hover:text-purple-500" href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a className="hover:text-purple-500" href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a className="hover:text-purple-500" href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                <Youtube size={20} />
              </a>
            </div>
            <div className="space-y-1 text-slate-600 text-sm">
              <p>19 Nguyễn Hữu Thọ, Q7, HCM</p>
              <p><a className="hover:text-purple-500" href="mailto:hello@milkybloom.com">hello@milkybloom.com</a></p>
              <p><a className="hover:text-purple-500" href="tel:+84987654321">(+84) 987-654-321</a></p>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="rounded-xl bg-white/80 border border-purple-100 p-4 shadow-lg shadow-purple-200/30">
          <div className="flex items-center gap-2 text-slate-800 text-base font-medium mb-3">
            <MapPin size={18} /> MilkyBloom Headquarters
          </div>
          <div className="relative w-full h-[240px] rounded-lg overflow-hidden border border-purple-100 shadow-inner shadow-purple-100/60">
            <iframe
              title="MilkyBloom Map"
              className="absolute inset-0 w-full h-full"
              src="https://www.google.com/maps?q=19%20Nguyen%20Huu%20Tho,%20Tan%20Phong,%20District%207,%20Ho%20Chi%20Minh&output=embed"
              loading="lazy"
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-purple-200/60 pt-4 text-center text-sm text-slate-600">
          © 2025 MilkyBloom — Crafted for collectors and dreamers.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
