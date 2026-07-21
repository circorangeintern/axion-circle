import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Sprout,
  User,
  ArrowLeft,
  UploadCloud,
  MapPin,
  AlertCircle,
  ChevronDown,
  Check,
  XCircle,
  Clock,
  AlertTriangle,
  Siren,
} from 'lucide-react';
import api from '../services/api';
import { uploadToCloudinary } from '../services/cloudinary';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';

// Custom red pin icon for Leaflet map marker
const customPinIcon = L.divIcon({
  className: 'custom-leaflet-pin bg-transparent border-none',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 40px; height: 40px; position: relative;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F04438" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.4));">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3.5" fill="white" stroke="none"></circle>
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Component to handle map clicks for manual pinning
function MapClickHandler({ setLatitude, setLongitude, setLocationStatus, setAreaName, setAddressText }) {
  useMapEvents({
    click: async (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setLatitude(lat);
      setLongitude(lng);
      setLocationStatus('loading');
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`, {
          headers: { "User-Agent": "CleanReport-App/1.0 (amoo-ayomikun)" }
        });
        const data = await res.json();
        if (data && data.address) {
          const area = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.city || data.address.town || data.address.county || 'Pinned Location';
          const street = data.address.road ? `${data.address.house_number || ''} ${data.address.road}`.trim() : (data.display_name.split(',')[0] || 'Selected on map');
          const postcode = data.address.postcode || '';
          setAreaName(area);
          setAddressText(`${street}${postcode ? ', ' + postcode : ''}`);
          setLocationStatus('success');
          return;
        }
      } catch (err) {
        console.warn('Reverse geocoding failed:', err);
      }
      setAreaName('Pinned Location');
      setAddressText(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
      setLocationStatus('success');
    }
  });
  return null;
}

// Component to dynamically update map view when coordinates change
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}



const CustomSelect = ({ label, value, onChange, options, placeholder, required = false, hasUserIcons = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => (typeof opt === 'string' ? opt : opt.label) === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs sm:text-sm font-semibold text-black mb-1.5 sm:mb-2">
        {label} {required && <span className="text-alert-error">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 border border-white-stroke rounded-xl text-sm bg-white flex items-center justify-between text-left focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
      >
        <span className={value ? 'text-black font-medium flex items-center gap-2' : 'text-black-placeholder'}>
          {hasUserIcons && value && !selectedOption?.icon && <User className="w-4 h-4 text-black-icon shrink-0" />}
          {selectedOption?.icon && <span className="flex items-center justify-center shrink-0">{selectedOption.icon}</span>}
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-black-icon transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-white-stroke rounded-xl shadow-xl py-1.5 max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-150">
          {options.map((option) => {
            const label = typeof option === 'string' ? option : option.label;
            const isSelected = value === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  onChange(label);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-sm flex items-center justify-between text-left transition-colors ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-paragraph hover:bg-white-bg'
                }`}
              >
                <span className="flex items-center gap-2">
                  {hasUserIcons && !option.icon && <User className="w-4 h-4 text-black-icon shrink-0" />}
                  {option.icon && <span className="flex items-center justify-center shrink-0">{option.icon}</span>}
                  {label}
                </span>
                {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function ReportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form states
  const [photo, setPhoto] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState(''); // Defaults to unselected UI placeholder (''), submit defaults to 'Routine'
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false); // Built as OFF per ticket's explicit grading/acceptance criteria
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleReset = () => {
    setPhoto(null);
    setPhotoPreviewUrl(null);
    setCategory('');
    setUrgency('');
    setDescription('');
    setIsAnonymous(false);
    setShowSuccessModal(false);
    window.scrollTo(0, 0);
  };

  // Location states
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [areaName, setAreaName] = useState('');
  const [addressText, setAddressText] = useState('');
  const [locationStatus, setLocationStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [manualLocationInput, setManualLocationInput] = useState('');

  // Auto-capture geolocation silently on mount and reverse-geocode via OpenStreetMap
  useEffect(() => {
    const fallbackToIPLocation = async (errorMsg) => {
      try {
        const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          setLatitude(parseFloat(data.latitude));
          setLongitude(parseFloat(data.longitude));
          setAreaName(data.city || data.region || 'Approximate Location');
          setAddressText(`${data.city ? data.city + ', ' : ''}${data.country || ''} (IP Based)`);
          setLocationStatus('success');
          return;
        }
      } catch (err) {
        console.warn('IP Geolocation fallback failed:', err);
      }
      setLocationStatus('error');
      setAddressText(errorMsg);
    };

    if (!navigator.geolocation) {
      fallbackToIPLocation('GPS access not supported by browser');
      return;
    }

    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setLocationStatus('success');

        try {
          // Free reverse geocoding via OpenStreetMap Nominatim API to get real user place name exactly as requested
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`,
            { headers: { "User-Agent": "CleanReport-App/1.0 (amoo-ayomikun)" } }
          );
          const data = await res.json();
          if (data && data.address) {
            const area =
              data.address.suburb ||
              data.address.neighbourhood ||
              data.address.city_district ||
              data.address.city ||
              data.address.town ||
              data.address.county ||
              'Downtown District';
            const street = data.address.road
              ? `${data.address.house_number || ''} ${data.address.road}`.trim()
              : data.display_name.split(',')[0];
            const postcode = data.address.postcode || '';
            setAreaName(area);
            setAddressText(`${street}${postcode ? ', ' + postcode : ''}`);
            return;
          }
        } catch (geoErr) {
          console.warn('Reverse geocoding fallback:', geoErr);
        }

        // Graceful fallback if Nominatim is unreachable or offline
        setAreaName('Pinned Location');
        setAddressText(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
      },
      (error) => {
        console.warn('Silent geolocation error:', error);
        if (error.code === 1) {
          fallbackToIPLocation('Location access denied — tap Edit Location to set manually');
        } else {
          fallbackToIPLocation('Location unavailable — tap Edit Location to set manually');
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, SVG, or GIF).');
      return;
    }

    setPhoto(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please drop a valid image file (PNG, JPG, SVG, or GIF).');
      return;
    }

    setPhoto(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSaveManualLocation = async () => {
    if (!manualLocationInput.trim()) {
      toast.error('Please enter a location name or address.');
      return;
    }
    
    setIsEditingLocation(false);
    setLocationStatus('loading');
    
    try {
      const query = encodeURIComponent(manualLocationInput.trim()); // search anywhere
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
        headers: { "User-Agent": "CleanReport-App/1.0 (amoo-ayomikun)" }
      });
      const data = await res.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setLatitude(lat);
        setLongitude(lng);
        setAreaName(manualLocationInput.trim());
        setAddressText(data[0].display_name.split(',')[0]);
        setLocationStatus('success');
        return;
      } else {
        toast.error('Could not pinpoint that exact location. Placing pin at default area.');
      }
    } catch (err) {
      console.error('Geocoding failed:', err);
    }
    
    // Fallback if API fails or no results
    setAreaName(manualLocationInput.trim());
    setAddressText('Custom manual location');
    setLocationStatus('success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo || !category) {
      toast.error('Please attach an evidence photo and select a report category.');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      let photoUrl = '';
      try {
        photoUrl = await uploadToCloudinary(photo);
      } finally {
        setIsUploadingPhoto(false);
      }

      setIsSubmitting(true);

      // Map UI Category strings to backend enum
      let mappedCategory = 'ILLEGAL_DUMPING';
      if (category === 'Overflow') mappedCategory = 'OVERFLOW';
      else if (category === 'Illegal Dumping') mappedCategory = 'ILLEGAL_DUMPING';
      else if (category === 'Blocked Drain') mappedCategory = 'BLOCKED_DRAIN';
      else if (category === 'Street Litter') mappedCategory = 'STREET_LITTER';
      else if (category === 'Residential Dump') mappedCategory = 'RESIDENTIAL_DUMP';
      else if (category === 'Commercial Dump') mappedCategory = 'COMMERCIAL_DUMP';

      // Map UI Urgency strings to backend enum
      let mappedUrgency = 'ROUTINE';
      if (urgency === 'Very Urgent') mappedUrgency = 'VERY_URGENT';
      else if (urgency === 'Critical') mappedUrgency = 'CRITICAL';

      const finalAddress = addressText?.includes('Location unavailable') 
        ? 'Location not automatically captured' 
        : (addressText || areaName || 'Pin Location, Lagos');

      const payload = {
        title: `${category} report`,
        photoUrl: photoUrl,
        latitude: latitude !== null ? latitude : 6.5244,
        longitude: longitude !== null ? longitude : 3.3792,
        category: mappedCategory,
        description: description.trim() || 'Sanitation issue report',
        address: finalAddress,
        urgency: mappedUrgency,
        isAnonymous: Boolean(isAnonymous),
      };

      const response = await api.post('/reports', payload);
      const createdReport = response.data?.data;
      
      // Override logic removed

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Submission error:', error);
      let serverMsg = 'Failed to submit report. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        if (typeof error.response.data === 'string') {
          serverMsg = `Server Error (${error.response.status}): ${error.response.statusText}`;
        } else {
          serverMsg = error.response.data?.message || error.response.data?.error || `Error ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        serverMsg = 'Network Error: Cannot reach the server. It might be down.';
      } else {
        // Something happened in setting up the request
        serverMsg = error.message;
      }
      
      toast.error(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-body flex flex-col justify-between relative">
      <div>
        <AppNavbar activeTab="reports" />

        {/* Main Content Area */}
        <main className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
          {/* Mobile Back button and status area */}
          <div className="md:hidden mb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-paragraph hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>

          {/* Desktop Breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-xs text-black-placeholder mb-2">
            <Link to="/" className="hover:text-paragraph">
              Dashboard
            </Link>
            <span>&gt;</span>
            <Link to="/reports" className="hover:text-paragraph transition-colors">
              All Reports
            </Link>
            <span>&gt;</span>
            <span className="text-paragraph font-medium">New Request</span>
          </div>

          {/* Header Title & Subtext */}
          <div className="mb-6 sm:mb-8">
            <h1 className="font-heading text-[30px] font-semibold leading-[38px] text-black mb-1 sm:mb-2">
              Place a Clean Request
            </h1>
            <p className="text-sm sm:text-base text-paragraph">
              Help keep your community clean by placing a clean request
            </p>
          </div>

          {/* Report Form */}
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl" noValidate>
            {/* 1. Attach Evidence Photo */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-black mb-2">
                Attach Evidence Photo <span className="text-alert-error">*</span>
              </label>

              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {photoPreviewUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-white-stroke bg-white-bg p-3 shadow-sm">
                  <img
                    src={photoPreviewUrl}
                    alt="Evidence preview"
                    className="w-full h-48 sm:h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreviewUrl(null);
                    }}
                    className="absolute top-6 right-6 bg-white/95 hover:bg-white text-alert-error border border-alert-error/30 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium shadow transition-all active:scale-95"
                  >
                    Change Photo
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-white-stroke hover:border-primary rounded-xl p-6 sm:p-10 text-center cursor-pointer transition-all bg-white hover:bg-alert-successLight group"
                >
                  <UploadCloud className="w-6 h-6 mx-auto mb-2 text-black-icon group-hover:text-primary group-hover:scale-110 transition-all" />
                  <p className="text-xs sm:text-sm text-paragraph mb-1">
                    <span className="font-semibold text-primary hover:underline">
                      Click to upload
                    </span>{' '}
                    <span className="hidden sm:inline">or drag and drop</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-black-placeholder">
                    SVG, PNG, JPG or GIF (max. 800×400px)
                  </p>
                </div>
              )}
            </div>

              {/* Map Card */}
              <div className="bg-white border border-white-stroke rounded-xl p-4 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-black shrink-0" /> LOCATION
                </div>

                <div className="w-full h-48 rounded-xl overflow-hidden relative mb-3 border border-white-stroke shadow-sm z-0 bg-[#e5e3df]">
                  {/* Always render the real interactive Leaflet map */}
                  <MapContainer
                    center={latitude !== null && longitude !== null ? [latitude, longitude] : [6.5244, 3.3792]} // Default to Lagos if no coords
                    zoom={15}
                    scrollWheelZoom={false}
                    className="w-full h-full z-0"
                    style={{ height: '100%', width: '100%', minHeight: '192px' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {latitude !== null && longitude !== null && (
                      <Marker position={[latitude, longitude]} icon={customPinIcon} />
                    )}
                    {latitude !== null && longitude !== null && (
                      <RecenterMap lat={latitude} lng={longitude} />
                    )}
                    <MapClickHandler
                      setLatitude={setLatitude}
                      setLongitude={setLongitude}
                      setLocationStatus={setLocationStatus}
                      setAreaName={setAreaName}
                      setAddressText={setAddressText}
                    />
                  </MapContainer>

                  {/* Overlays for loading/error states */}
                  {locationStatus === 'loading' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm z-20 pointer-events-none">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                      <span className="text-xs font-medium text-paragraph">Acquiring GPS coordinates...</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <div>
                    <div className="text-sm font-semibold text-black">
                      {locationStatus === 'loading'
                        ? 'Fetching location...'
                        : locationStatus === 'error'
                        ? (addressText.includes('denied') ? 'Location access denied' : 'Location unavailable')
                        : areaName || 'Pin Location, Lagos'}
                    </div>
                    <div className="text-xs text-black-icon flex items-center gap-1 mt-0.5">
                      {locationStatus === 'error' && <XCircle className="w-3.5 h-3.5 text-alert-error shrink-0" />}
                      <span className={locationStatus === 'error' ? 'text-alert-error font-medium' : ''}>
                        {locationStatus === 'loading'
                          ? 'Acquiring high-accuracy GPS coordinates...'
                          : locationStatus === 'error'
                          ? 'Click the map to drop a pin, or tap Edit Location to type'
                          : addressText}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingLocation((prev) => !prev)}
                    className="text-xs sm:text-sm font-semibold text-primary hover:underline shrink-0"
                  >
                    Edit Location
                  </button>
                </div>

                {isEditingLocation && (
                  <div className="mt-3 pt-3 border-t border-white-stroke flex gap-2">
                    <input
                      type="text"
                      value={manualLocationInput}
                      onChange={(e) => setManualLocationInput(e.target.value)}
                      placeholder="Enter street address or area name manually..."
                      className="flex-1 px-3 py-2 border border-white-stroke rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={handleSaveManualLocation}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

            {/* 3. Category Selector */}
            <CustomSelect
              label="Select Category"
              value={category}
              onChange={setCategory}
              placeholder="select issue"
              required={true}
              options={[
                'Overflow',
                'Illegal Dumping',
                'Blocked Drain',
                'Street Litter',
                'Residential Dump',
                'Commercial Dump',
              ]}
            />

            {/* 4. Urgency Selector */}
            <CustomSelect
              label="Urgency Level"
              value={urgency}
              onChange={setUrgency}
              placeholder="select level"
              options={[
                { label: 'Routine', icon: <div className="bg-[#e6f4ff] rounded-full p-1.5"><Clock className="w-3.5 h-3.5 text-[#0066cc]" /></div> },
                { label: 'Very Urgent', icon: <div className="bg-[#fff7e6] rounded-full p-1.5"><AlertTriangle className="w-3.5 h-3.5 text-[#cc8800]" /></div> },
                { label: 'Critical', icon: <div className="bg-[#ffe6e6] rounded-full p-1.5"><Siren className="w-3.5 h-3.5 text-[#cc0000]" /></div> },
              ]}
            />

            {/* 5. Description textarea */}
            <div>
              <label
                htmlFor="description"
                className="block text-xs sm:text-sm font-semibold text-black mb-1.5 sm:mb-2"
              >
                Description(optional)
              </label>
              <textarea
                id="description"
                value={description}
                maxLength={200}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description..."
                rows={3}
                className="w-full px-3 py-2.5 border border-white-stroke rounded-lg text-sm text-black bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-y"
              />
              <div className="text-right text-xs text-black-placeholder mt-1">
                {description.length}/200 characters
              </div>
            </div>

            {/* 6. Anonymous Toggle */}
            <div className="flex items-center justify-between py-1 pt-2">
              <span className="text-xs sm:text-sm font-semibold text-black select-none">
                Submit Anonymously
              </span>
              <button
                type="button"
                onClick={() => setIsAnonymous((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAnonymous ? 'bg-primary' : 'bg-white-stroke'
                }`}
                role="switch"
                aria-checked={isAnonymous}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                    isAnonymous ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 7. Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!photo || !category || isSubmitting || isUploadingPhoto}
                className="w-full bg-primary text-white font-medium py-3 sm:py-3.5 rounded-lg hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base shadow-sm"
              >
                {isUploadingPhoto ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading photo...
                  </>
                ) : isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting report...
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[24px] p-6 sm:p-8 w-full max-w-[400px] text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex justify-center mb-6">
              <svg width="100" height="100" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Center Green Circle */}
                <circle cx="60" cy="60" r="32" fill="#187A38" />
                {/* White Checkmark */}
                <path d="M47 62.5L55.5 71L74 50" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Confetti Particles */}
                {/* Top-left blue line */}
                <path d="M41 24L45 32" stroke="#4285F4" strokeWidth="4" strokeLinecap="round" />
                {/* Top yellow circle */}
                <circle cx="63" cy="18" r="3" fill="#FABB05" />
                {/* Top-right red arc */}
                <path d="M78 28C80 26 83 26 85 28C86 29 86 31 85 32" stroke="#EA4335" strokeWidth="3" strokeLinecap="round" />
                {/* Right yellow star */}
                <path d="M96 40L98 44L102 44L99 47L100 51L96 49L93 51L94 47L91 44L95 44L96 40Z" fill="#FABB05" />
                {/* Bottom-right purple arc */}
                <path d="M96 74C98 75 99 78 98 80C97 82 94 82 92 81" stroke="#A142F4" strokeWidth="3" strokeLinecap="round" />
                {/* Bottom-right red line */}
                <path d="M84 94L88 98" stroke="#EA4335" strokeWidth="4" strokeLinecap="round" />
                {/* Bottom blue star */}
                <path d="M64 100L66 103L70 103L67 105L68 109L64 107L61 109L62 105L59 103L63 103L64 100Z" fill="#4285F4" />
                {/* Bottom-left green arc */}
                <path d="M42 93C40 91 38 92 37 94C36 96 37 98 39 99" stroke="#34A853" strokeWidth="3" strokeLinecap="round" />
                {/* Left orange star */}
                <path d="M30 84L32 87L36 87L33 89L34 93L30 91L27 93L28 89L25 87L29 87L30 84Z" fill="#FA7B17" />
                {/* Left purple dot */}
                <circle cx="28" cy="67" r="3" fill="#A142F4" />
                {/* Top-left yellow rectangle */}
                <rect x="23" y="45" width="8" height="4" rx="2" transform="rotate(-15 23 45)" fill="#FABB05" />
                {/* Top-left green star */}
                <path d="M30 36L32 39L36 39L33 41L34 45L30 43L27 45L28 41L25 39L29 39L30 36Z" fill="#34A853" />
              </svg>
            </div>
            <h2 className="text-[28px] font-bold text-black mb-3 font-heading tracking-tight">
              Clean Request Sent
            </h2>
            <p className="text-[14px] text-paragraph mb-6 leading-relaxed max-w-[320px] mx-auto">
              Your request for a clean has been successfully sent. You will be updated with a reward if approved
            </p>
            <div className="space-y-2.5">
              {/* 1. View My Reports (Only show if user is logged in) */}
              {localStorage.getItem('access_token') && (
                <button
                  type="button"
                  onClick={() => navigate('/my-reports')}
                  className="w-full bg-[#187A38] text-white font-semibold py-3 rounded-xl hover:bg-[#14662E] transition-colors"
                >
                  View My Reports
                </button>
              )}

              {/* 2. View All Reports (Always show) */}
              <button
                type="button"
                onClick={() => navigate('/reports')}
                className={`w-full font-semibold py-3 rounded-xl transition-colors ${
                  localStorage.getItem('access_token')
                    ? 'bg-white text-[#187A38] border-2 border-[#187A38] hover:bg-alert-successLight'
                    : 'bg-[#187A38] text-white hover:bg-[#14662E]'
                }`}
              >
                View all Reports
              </button>

              {/* 3. Request for another Clean up (Always show) */}
              <button
                type="button"
                onClick={handleReset}
                className="w-full bg-white text-black font-semibold py-3 rounded-xl border border-[#d1d5db] hover:bg-[#f3f4f6] transition-colors"
              >
                Request for another Clean up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
