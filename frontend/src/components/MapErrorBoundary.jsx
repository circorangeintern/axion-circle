import React from 'react';
import { Map } from 'lucide-react';

export default class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('MapErrorBoundary caught an error:', error, errorInfo);
    if (this.props.onMapError) {
      // Small timeout to ensure the fallback UI renders briefly before switching modes if needed
      setTimeout(() => {
        this.props.onMapError();
      }, 0);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#f0ede5] p-6 text-center z-10 relative">
          <Map className="w-10 h-10 text-alert-warning mb-3 opacity-80" />
          <p className="text-sm font-bold text-black mb-1">Map couldn't load — showing list view instead</p>
          <p className="text-xs text-paragraph">You can try switching back to the map later.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
