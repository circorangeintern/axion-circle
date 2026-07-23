import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white-bg p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white-stroke mb-4">404</h1>
        <p className="text-paragraph mb-6">Page not found</p>
        <Link to="/" className="text-primary underline">Back to Home</Link>
      </div>
    </div>
  );
}
