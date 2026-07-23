import { ArrowLeft, ArrowRight } from 'lucide-react';
import loginHero from '../assets/login-hero.webp';

export default function AuthHeroPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-end p-12 text-white relative min-h-screen overflow-hidden">
      {/* Real background image */}
      <img
        src={loginHero}
        alt="Community members cleaning up the environment"
        width="960"
        height="1080"
        className="absolute inset-0 w-full h-full object-cover"
      />


      {/* Bottom Glassmorphic Backdrop with Blur & Smooth Dark Gradient transition (leaves top half crisp/untinted) */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[52%] backdrop-blur-[18px] bg-gradient-to-t from-black/92 via-black/65 to-transparent z-10 pointer-events-none"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 100%)'
        }}
      />

      {/* Content over hero image and bottom blur backdrop */}
      <div className="relative z-20 max-w-lg w-full mt-auto">
        {/* Quote */}
        <blockquote className="text-lg italic font-medium opacity-95 mb-4 leading-relaxed">
          &quot;A cleaner community starts with one simple report, followed by an attentive response&quot;
        </blockquote>

        {/* Tagline with inline right-aligned 5-star rating */}
        <div className="flex items-center justify-between gap-4 mb-3 w-full">
          <h2 className="font-heading font-bold text-2xl lg:text-3xl tracking-tight">
            Spot It. Snap It. Report It.
          </h2>
          <div className="flex items-center gap-1 shrink-0">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-5 h-5 text-accent ${
                  star <= 4
                    ? 'fill-current'
                    : 'fill-none stroke-current stroke-[1.5]'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Small descriptive text + two circular navigation buttons */}
        <div className="flex items-end justify-between gap-6 pt-1">
          <p className="text-sm opacity-85 leading-relaxed max-w-sm">
            Quickly report overflowing bins, illegal dumping, and blocked drains with a photo and your exact location.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-white text-black hover:bg-white/90 active:scale-95 flex items-center justify-center shadow-lg transition-all cursor-pointer"
              aria-label="Previous slide"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-white text-black hover:bg-white/90 active:scale-95 flex items-center justify-center shadow-lg transition-all cursor-pointer"
              aria-label="Next slide"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
