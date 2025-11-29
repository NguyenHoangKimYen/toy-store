import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

const message = `Dear dreamers,
MilkyBloom is a full-stack e-commerce web application developed as part of our Web Application Development course using Node.js. The platform is designed to provide a seamless online shopping experience for collectible toys, featuring a robust backend built with ExpressJS and MongoDB, secure authentication flows, advanced order and payment processing, and a modern user-friendly interface. This project represents the collective dedication of our team, combining practical engineering skills with real-world system design to deliver a scalable, maintainable, and production-ready application.`;

const About = () => {
  const [typed, setTyped] = useState('');
  const typingDelay = 25;

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTyped(message.slice(0, i + 1));
      i += 1;
      if (i >= message.length) clearInterval(interval);
    }, typingDelay);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden text-slate-900 bg-gradient-to-br from-white via-rose-50 to-blue-50">
      {/* subtle overlay for harmony with other pages */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(244,181,217,0.18),transparent_45%),radial-gradient(circle_at_78%_32%,rgba(172,196,255,0.16),transparent_42%)] blur-xl" />

      <div className="w-full max-w-5xl flex items-center justify-center">
        <div className="open-letter relative w-full max-w-4xl rounded-[30px] border border-white/40 bg-white/60 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.12)] p-8 lg:p-10">

          {/* header heart clip */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-lg border border-white/60">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-purple-400 shadow-[0_12px_24px_rgba(255,99,146,0.35)] flex items-center justify-center text-white text-2xl">
              <Heart className="w-10 h-10" />
            </div>
          </div>

          {/* paper */}
          <div className="relative rounded-3xl bg-gradient-to-b from-white/95 via-white/92 to-rose-50/80 border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.10)] px-6 py-8 lg:px-8 lg:py-10 overflow-hidden">
            <div className="absolute top-4 right-4 opacity-60 text-lg"></div>
            <p className="handwriting whitespace-pre-line text-[1.2rem] leading-9 text-slate-700 min-h-[200px]">
              {typed}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .handwriting {
          font-family: 'Dancing Script', 'Caveat', 'Pacifico', cursive;
          letter-spacing: 0.6px;
        }
        .sparkle-fx {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }
        .sparkle-fx span {
          position: absolute;
          font-size: 20px;
          opacity: 0.6;
          animation: drift 9s ease-in-out infinite;
          color: #ffffff;
          text-shadow:
            0 0 10px rgba(255, 255, 255, 0.9),
            0 0 18px rgba(255, 182, 193, 0.6),
            0 0 26px rgba(150, 171, 255, 0.45);
        }
        .sparkle-fx span:nth-child(2) { animation-duration: 9.5s; font-size: 22px; opacity: 0.62; }
        .sparkle-fx span:nth-child(3) { animation-duration: 10.2s; font-size: 24px; opacity: 0.66; }
        .sparkle-fx span:nth-child(4) { animation-duration: 11s; font-size: 26px; opacity: 0.64; }
        .sparkle-fx span:nth-child(5) { animation-duration: 12s; font-size: 28px; opacity: 0.68; }
        .sparkle-fx span:nth-child(6) { animation-duration: 10.8s; font-size: 23px; opacity: 0.6; }
        .sparkle-fx span:nth-child(7) { animation-duration: 12.8s; font-size: 25px; opacity: 0.65; }
        .sparkle-fx span:nth-child(8) { animation-duration: 13.5s; font-size: 27px; opacity: 0.7; }
        .sparkle-fx span:nth-child(9) { animation-duration: 11.8s; font-size: 21px; opacity: 0.6; }
        .sparkle-fx span:nth-child(10) { animation-duration: 12.6s; font-size: 29px; opacity: 0.7; }
        @keyframes drift {
          0% { transform: translateY(10px) translateX(-6px) scale(0.9); opacity: 0.1; }
          25% { opacity: 0.35; }
          50% { transform: translateY(-14px) translateX(8px) scale(1.05); opacity: 0.45; }
          75% { opacity: 0.35; }
          100% { transform: translateY(10px) translateX(-6px) scale(0.9); opacity: 0.1; }
        }
      `}</style>
      <div className="sparkle-fx">
        <span style={{ top: '8%', left: '18%' }}>✨</span>
        <span style={{ top: '22%', right: '12%' }}>✨</span>
        <span style={{ bottom: '18%', left: '10%' }}>✨</span>
        <span style={{ top: '50%', right: '8%' }}>✨</span>
        <span style={{ bottom: '10%', right: '18%' }}>✨</span>
        <span style={{ top: '16%', left: '42%' }}>✨</span>
        <span style={{ bottom: '28%', right: '42%' }}>✨</span>
        <span style={{ top: '68%', left: '26%' }}>✨</span>
        <span style={{ top: '36%', left: '58%' }}>✨</span>
        <span style={{ bottom: '4%', left: '52%' }}>✨</span>
        <span style={{ top: '6%', right: '28%' }}>✨</span>
        <span style={{ bottom: '16%', right: '6%' }}>✨</span>
        <span style={{ top: '44%', left: '6%' }}>✨</span>
        <span style={{ bottom: '38%', left: '50%' }}>✨</span>
        <span style={{ top: '60%', right: '30%' }}>✨</span>
      </div>
    </div>
  );
};

export default About;
