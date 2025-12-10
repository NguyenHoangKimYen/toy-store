import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import './About.css';

const message = `Dear dreamers,
MilkyBloom is a full-stack e-commerce web application developed as part of our Web Application Development course using Node.js. The platform is designed to provide a seamless online shopping experience for collectible toys, featuring a robust backend built with ExpressJS and MongoDB, secure authentication flows, advanced order and payment processing, and a modern user-friendly interface. This project represents the collective dedication of our team, combining practical engineering skills with real-world system design to deliver a scalable, maintainable, and production-ready application.`;

const heartFlight = [
  { top: '8%', delay: 0, duration: 18, size: 28, arc: 24, sway: 6, seed: 0.1 },
  { top: '14%', delay: 1.4, duration: 21, size: 22, arc: 16, sway: -5, seed: 0.32 },
  { top: '22%', delay: 2.4, duration: 19, size: 24, arc: 14, sway: 4, seed: 0.55 },
  { top: '30%', delay: 3.2, duration: 22, size: 20, arc: 12, sway: -4, seed: 0.73 },
  { top: '38%', delay: 4.1, duration: 20, size: 26, arc: 20, sway: 3, seed: 0.18 },
  { top: '46%', delay: 1.6, duration: 23, size: 23, arc: 18, sway: -6, seed: 0.47 },
  { top: '54%', delay: 2.9, duration: 25, size: 27, arc: 22, sway: 5, seed: 0.66 },
  { top: '62%', delay: 4.8, duration: 24, size: 25, arc: 16, sway: -3, seed: 0.82 },
  { top: '70%', delay: 6.6, duration: 26, size: 21, arc: 15, sway: 4, seed: 0.25 },
  { top: '78%', delay: 7.8, duration: 27, size: 24, arc: 18, sway: -5, seed: 0.58 },
  { top: '86%', delay: 9.5, duration: 28, size: 22, arc: 12, sway: 3, seed: 0.9 },
  { top: '92%', delay: 10.4, duration: 29, size: 20, arc: 10, sway: -2, seed: 0.41 },
];

const About = () => {
  const [typed, setTyped] = useState('');
  const [skip, setSkip] = useState(false);
  const typingDelay = 25;

  useEffect(() => {
    if (skip) {
      setTyped(message);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      setTyped(message.slice(0, i + 1));
      i += 1;
      if (i >= message.length) clearInterval(interval);
    }, typingDelay);
    return () => clearInterval(interval);
  }, [skip]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden text-slate-900 bg-gradient-to-br from-white via-rose-50 to-blue-50">
      {/* subtle overlay for harmony with other pages */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(244,181,217,0.18),transparent_45%),radial-gradient(circle_at_78%_32%,rgba(172,196,255,0.16),transparent_42%)] blur-xl" />
      <div className="flying-hearts" aria-hidden>
        {heartFlight.map((item, idx) => (
          <span
            key={idx}
            className="heart-float"
            style={{
              top: item.top,
              '--delay': `${item.delay}s`,
              '--duration': `${item.duration}s`,
              '--size': `${item.size}px`,
              '--arc': `${item.arc}px`,
              '--sway': `${item.sway || 0}px`,
              '--seed': `${item.seed || 0}`,
            }}
          >
            ❤️
          </span>
        ))}
      </div>

      <div className="w-full max-w-5xl flex items-center justify-center relative z-10">
        <div className="open-letter relative z-10 w-full max-w-4xl rounded-[30px] border border-white/40 bg-white/60 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.12)] p-8 lg:p-10">

          {/* header heart clip */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-lg border border-white/60">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-purple-400 shadow-[0_12px_24px_rgba(255,99,146,0.35)] flex items-center justify-center text-white text-2xl">
              <Heart className="w-10 h-10" />
            </div>
          </div>

          {/* paper */}
          <div className="relative rounded-3xl bg-gradient-to-b from-white/95 via-white/92 to-rose-50/80 border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.10)] px-6 py-8 lg:px-8 lg:py-10 overflow-hidden">
            <div className="absolute top-4 right-4 opacity-60 text-lg"></div>
            {!skip && (
              <button
                onClick={() => {
                  setSkip(true);
                  setTyped(message);
                }}
                className="absolute top-3 right-3 z-10 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white/90 border border-white/70 rounded-full px-3 py-1 shadow-sm transition"
              >
                Skip
              </button>
            )}
            <p className="handwriting whitespace-pre-line text-[1.2rem] leading-9 text-slate-700 min-h-[200px]">
              {typed}
            </p>
          </div>
        </div>
      </div>

      <div className="sparkle-fx" aria-hidden="true">
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
