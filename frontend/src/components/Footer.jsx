import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white-stroke bg-white py-6 px-4 sm:px-8 mt-auto w-full z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-black-placeholder">
        <div>Copyright © CleanReport</div>
        <div className="flex items-center gap-6">
          <Link to="#" className="hover:text-black transition-colors">
            Privacy
          </Link>
          <Link to="#" className="hover:text-black transition-colors">
            Terms
          </Link>
          <Link to="#" className="hover:text-black transition-colors">
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
