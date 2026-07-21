import { useNavigate } from 'react-router-dom';

export default function AccountCreatedModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-xl flex flex-col items-center text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Confetti & Checkmark Graphic */}
        <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
          {/* Decorative Confetti Shapes */}
          {/* Top */}
          <div className="absolute top-2 right-1/2 translate-x-4 w-2.5 h-2.5 rounded-full bg-[#FFD166]" />
          <div className="absolute top-4 left-1/3 w-1.5 h-6 rounded-full bg-[#118AB2] rotate-45" />
          <div className="absolute top-8 right-4 w-3 h-3 border-2 border-[#EF476F] rounded-full border-t-transparent rotate-45" />
          
          {/* Left */}
          <div className="absolute left-2 top-1/3 w-3 h-3 rotate-12">
            <svg viewBox="0 0 10 10" className="fill-[#06D6A0] w-full h-full"><polygon points="5,0 6.5,3.5 10,3.5 7,5.5 8.5,9 5,7 1.5,9 3,5.5 0,3.5 3.5,3.5" /></svg>
          </div>
          <div className="absolute left-4 bottom-1/3 w-2.5 h-1.5 rounded-sm bg-[#FFD166] -rotate-12" />
          
          {/* Right */}
          <div className="absolute right-2 top-1/2 w-4 h-4">
            <svg viewBox="0 0 10 10" className="fill-[#FFD166] w-full h-full"><polygon points="5,0 6.5,3.5 10,3.5 7,5.5 8.5,9 5,7 1.5,9 3,5.5 0,3.5 3.5,3.5" /></svg>
          </div>
          <div className="absolute right-4 bottom-1/4 w-3 h-3 border-2 border-[#8338EC] rounded-full border-l-transparent -rotate-45" />

          {/* Bottom */}
          <div className="absolute bottom-6 left-1/4 w-3.5 h-3.5">
            <svg viewBox="0 0 10 10" className="fill-[#EF476F] w-full h-full"><polygon points="5,0 6.5,3.5 10,3.5 7,5.5 8.5,9 5,7 1.5,9 3,5.5 0,3.5 3.5,3.5" /></svg>
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-6 w-3 h-3 border-2 border-[#06D6A0] rounded-full border-b-transparent rotate-180" />
          <div className="absolute bottom-4 right-1/3 w-3 h-3 rotate-45">
            <svg viewBox="0 0 10 10" className="fill-[#118AB2] w-full h-full"><polygon points="5,0 6.5,3.5 10,3.5 7,5.5 8.5,9 5,7 1.5,9 3,5.5 0,3.5 3.5,3.5" /></svg>
          </div>
          <div className="absolute bottom-6 right-8 w-1.5 h-4 rounded-full bg-[#EF476F] -rotate-45" />
          <div className="absolute bottom-12 right-0 w-1.5 h-1.5 rounded-full bg-[#118AB2]" />

          {/* Main Green Circle */}
          <div className="w-28 h-28 bg-[#1B833A] rounded-full flex items-center justify-center relative z-10 shadow-lg">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <h2 className="font-heading font-bold text-3xl text-black mb-3">
          Account Created
        </h2>
        <p className="text-paragraph text-[15px] leading-relaxed mb-8">
          Your CleanReporta Account has been created. Login to start requesting a clean up in your community
        </p>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => {
              onClose();
              navigate('/');
            }}
            className="w-full py-3.5 bg-[#1B833A] text-white font-semibold rounded-xl hover:bg-[#156e30] transition-colors shadow-sm"
          >
            Go to Dashboard
          </button>
          
          <button
            onClick={() => {
              onClose();
              navigate('/report');
            }}
            className="w-full py-3.5 bg-white border border-white-stroke text-black font-semibold rounded-xl hover:bg-white-bg transition-colors shadow-sm"
          >
            Make a CleanReport
          </button>
        </div>
      </div>
    </div>
  );
}
