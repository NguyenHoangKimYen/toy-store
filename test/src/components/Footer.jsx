import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, MessagesSquare } from 'lucide-react';
import { ROUTES } from '@/config/routes';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden text-slate-100 mt-8 border-t border-white/5">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-indigo-900/90 to-slate-900" />

      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10">
        {/* Footer grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1 space-y-3">
            <Link to={ROUTES.HOME} className="brand-logo text-2xl md:text-3xl font-semibold tracking-tight">
              MilkyBloom
            </Link>
            <p className="text-xs text-white/60">Crafted for collectors and dreamers.</p>
            <div className="flex items-center gap-3 text-white/70">
              <a className="hover:text-cyan-200 transition-colors" href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a className="hover:text-cyan-200 transition-colors" href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a className="hover:text-cyan-200 transition-colors" href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                <Youtube size={18} />
              </a>
              <a className="hover:text-cyan-200 transition-colors" href="https://discord.gg" target="_blank" rel="noreferrer" aria-label="Discord">
                <MessagesSquare size={18} />
              </a>
            </div>
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
              <li><Link to={ROUTES.CONTACT} className="hover:text-cyan-200">Shipping & Returns</Link></li>
              <li><Link to={ROUTES.CONTACT} className="hover:text-cyan-200">FAQs</Link></li>
              <li><Link to={ROUTES.CONTACT} className="hover:text-cyan-200">Contact us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white/90 uppercase tracking-wide">Contact</p>
            <div className="space-y-1 text-xs text-white/70">
              <p>19 Nguyễn Hữu Thọ, Q7, HCM</p>
              <p><a className="hover:text-cyan-200" href="mailto:hello@milkybloom.com">hello@milkybloom.com</a></p>
              <p><a className="hover:text-cyan-200" href="tel:+84987654321">(+84) 987-654-321</a></p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-white/50">
          © 2025 MilkyBloom. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
