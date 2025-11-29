import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, MessagesSquare, MapPin } from 'lucide-react';
import { ROUTES } from '@/config/routes';

const Footer = () => {
  const handleNewsletterSubmit = (e) => e.preventDefault();

  return (
    <footer className="relative overflow-hidden text-slate-100 mt-12 border-t border-white/5">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-indigo-900/90 to-slate-900" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(210, 210, 255, 1),transparent_45%),radial-gradient(circle_at_78%_14%,rgba(173, 229, 255, 0.86),transparent_44%),radial-gradient(circle_at_48%_82%,rgba(255, 109, 238, 0.89),transparent_45%)]" />

      <div className="max-w-7xl mx-auto px-4 pt-12 lg:pt-14 space-y-10 lg:space-y-12">
        {/* Top footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 xl:gap-12 items-start">
          {/* Brand */}
          <div className="space-y-4">
            <Link to={ROUTES.HOME} className="brand-logo text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
              MilkyBloom
            </Link>
            <ul className="space-y-2 text-sm md:text-base text-white/80">
              <li><Link to={ROUTES.ABOUT} className="hover:text-cyan-200">About MilkyBloom</Link></li>
              <li><Link to={ROUTES.ABOUT} className="hover:text-cyan-200">Our story</Link></li>
              <li><Link to={ROUTES.ABOUT} className="hover:text-cyan-200">Studio</Link></li>
              <li><Link to={ROUTES.ABOUT} className="hover:text-cyan-200">Sustainability</Link></li>
            </ul>
          </div>

          {/* Shop */}
          <div className="space-y-4">
          <p className="text-xl font-semibold text-white/95 uppercase tracking-wide">Shop</p>
            <ul className="space-y-2 text-sm md:text-base text-white/80">
              <li><Link to={`${ROUTES.PRODUCTS}?sort=newest`} className="hover:text-cyan-200">New arrivals</Link></li>
              <li><Link to={`${ROUTES.PRODUCTS}?category=plushies`} className="hover:text-cyan-200">Plushies</Link></li>
              <li><Link to={`${ROUTES.PRODUCTS}?category=figures`} className="hover:text-cyan-200">Figures</Link></li>
              <li><Link to={`${ROUTES.PRODUCTS}?category=blind-box`} className="hover:text-cyan-200">Blind boxes</Link></li>
              <li><Link to={`${ROUTES.PRODUCTS}?tag=sale`} className="hover:text-cyan-200">Sale</Link></li>
              <li><Link to={ROUTES.PRODUCTS} className="hover:text-cyan-200">Gift cards</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
          <p className="text-xl font-semibold text-white/95 uppercase tracking-wide">Support</p>
            <ul className="space-y-2 text-sm md:text-base text-white/80">
              <li><Link to={ROUTES.ORDER_HISTORY} className="hover:text-cyan-200">Order tracking</Link></li>
              <li><Link to={ROUTES.CONTACT} className="hover:text-cyan-200">Shipping</Link></li>
              <li><Link to={ROUTES.CONTACT} className="hover:text-cyan-200">Returns &amp; refunds</Link></li>
              <li><Link to={ROUTES.CONTACT} className="hover:text-cyan-200">FAQs</Link></li>
              <li><Link to={ROUTES.CONTACT} className="hover:text-cyan-200">Size guide</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-5">
            <p className="text-xl font-semibold text-white/95 uppercase tracking-wide">Connect</p>
            <div className="flex flex-wrap items-center gap-3 text-white/85">
              <a className="hover:text-cyan-200 flex items-center gap-2" href="https://discord.gg" target="_blank" rel="noreferrer">
                <MessagesSquare size={16} /> Discord
              </a>
              <a className="hover:text-cyan-200 flex items-center gap-2" href="https://www.instagram.com" target="_blank" rel="noreferrer">
                <Instagram size={16} /> Instagram
              </a>
              <a className="hover:text-cyan-200 flex items-center gap-2" href="https://www.facebook.com" target="_blank" rel="noreferrer">
                <Facebook size={16} /> Facebook
              </a>
              <a className="hover:text-cyan-200 flex items-center gap-2" href="https://www.youtube.com" target="_blank" rel="noreferrer">
                <Youtube size={16} /> YouTube
              </a>
            </div>
            <div className="space-y-1.5 text-white/80 text-sm leading-relaxed">
              <p>19 Nguyễn Hữu Thọ, Phường Tân Phong<br />Quận 7, TP.HCM</p>
              <p>Email: <a className="hover:text-cyan-200" href="mailto:hello@milkybloom.com">hello@milkybloom.com</a></p>
              <p>Phone: <a className="hover:text-cyan-200" href="tel:+84987654321">(+84) 987-654-321</a></p>
              <p>Hours: Mon – Sat, 9:00 – 18:00</p>
            </div>
          </div>
        </div>

        {/* Map full width */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-4">
          <div className="flex items-center gap-2 text-white/85 font-semibold mb-3">
            <MapPin size={18} /> MilkyBloom Headquarters
          </div>
          <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-white/10">
            <iframe
              title="MilkyBloom Map"
              className="absolute inset-0 w-full h-full"
              src="https://www.google.com/maps?q=19%20Nguyen%20Huu%20Tho,%20Tan%20Phong,%20District%207,%20Ho%20Chi%20Minh&output=embed"
              loading="lazy"
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="px-4 py-5 text-center text-sm text-white/80">
            © 2025 MilkyBloom — Crafted for collectors and dreamers.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
