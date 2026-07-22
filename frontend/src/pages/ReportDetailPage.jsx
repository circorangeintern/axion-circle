import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Star, Flag, Trash2, ArrowLeft, Gift, 
  MessageSquare, User, Clock, Check, AlertCircle, Share2, ChevronDown 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import fallbackImage from '../assets/fallback-image.svg';

const getMarkerIcon = (status) => {
  let color = '#006FED'; // default blue
  const s = (status || '').toLowerCase();
  if (s === 'reported') color = '#FEAA01'; // amber
  else if (s === 'acknowledged') color = '#006FED'; // blue
  else if (s === 'inprogress' || s === 'in progress') color = '#8B5CF6'; // purple
  else if (s === 'resolved') color = '#127C2F'; // green

  return L.divIcon({
    className: 'custom-leaflet-pin bg-transparent border-none',
    html: `
      <div style="display: flex; flex-direction: column; items-center; justify-content: center; width: 36px; height: 36px; position: relative;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 36px; height: 36px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.4));">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3" fill="white" stroke="none"></circle>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

const getUrgencyIcon = (urgency) => {
  const u = (urgency || '').toLowerCase();
  if (u.includes('critical') || u.includes('very urgent')) return <AlertCircle className="w-4 h-4 text-alert-error" />;
  if (u.includes('moderate') || u.includes('urgent')) return <AlertCircle className="w-4 h-4 text-alert-warning" />;
  return <AlertCircle className="w-4 h-4 text-alert-info" />;
};

const timeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  });
};

const STAGES = ['Reported', 'Acknowledged', 'In Progress', 'Resolved'];

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [loggedInUserRole, setLoggedInUserRole] = useState(null);
  
  const [report, setReport] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [comments, setComments] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Reverse Geocoded Location
  const [geoAddress, setGeoAddress] = useState(null);
  const [geoDistrict, setGeoDistrict] = useState(null);

  useEffect(() => {
    try {
      const userStr = (localStorage.getItem('user') || sessionStorage.getItem('user'));
      if (userStr) {
        const user = JSON.parse(userStr);
        setLoggedInUserId(user.id || user._id);
        setLoggedInUserRole((user.role || user.accountType || '').toLowerCase());
      }
    } catch (e) {
      console.error('Error parsing user from localStorage', e);
    }
  }, []);

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const [reportRes, statusRes, commentsRes] = await Promise.all([
          api.get(`/reports/${id}`),
          api.get(`/reports/${id}/status`).catch(() => ({ data: { data: [] } })),
          api.get(`/reports/${id}/comments`).catch(() => ({ data: { data: [] } }))
        ]);

        setReport(reportRes.data?.data || reportRes.data);
        setStatusHistory(statusRes.data?.data || statusRes.data || []);
        setComments(commentsRes.data?.data || commentsRes.data || []);
      } catch (error) {
        if (error.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error('Failed to load report details.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchReportData();
    }
  }, [id]);

  useEffect(() => {
    if (report && report.latitude && report.longitude && !geoAddress) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${report.latitude}&lon=${report.longitude}&zoom=16`, {
        headers: { "User-Agent": "CleanReport-App/1.0 (amoo-ayomikun)" }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.address) {
            const district = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.village || data.address.city || data.address.town || data.address.county || 'Downtown District';
            setGeoDistrict(district);
            setGeoAddress(data.display_name || report.address);
          }
        })
        .catch(err => console.warn('Reverse geocoding failed:', err));
    }
  }, [report, geoAddress]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Check if logged in first before attempting to comment
    if (!(localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))) {
      toast.error('Please log in to add a comment.');
      navigate('/login');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const res = await api.post(`/reports/${id}/comments`, { content: newComment.trim() });
      const addedComment = res.data?.data || res.data;
      
      // If the API returns the comment, add it directly. Otherwise just refetch.
      if (addedComment && typeof addedComment === 'object') {
        setComments(prev => [...prev, addedComment]);
      } else {
        const commentsRes = await api.get(`/reports/${id}/comments`);
        setComments(commentsRes.data?.data || commentsRes.data || []);
      }
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const [commentToDelete, setCommentToDelete] = useState(null);

  const handleDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;
    const commentId = commentToDelete;
    setCommentToDelete(null);
    try {
      await api.delete(`/reports/${id}/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId && c._id !== commentId));
      toast.success('Comment deleted.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete comment.');
    }
  };

  const handleShare = () => {
    const text = encodeURIComponent("Check out this sanitation report on CleanReport: " + window.location.href);
    const shareUrl = `https://wa.me/?text=${text}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white-bg font-body flex flex-col">
        <AppNavbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-paragraph font-medium">Loading report details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !report) {
    return (
      <div className="min-h-screen bg-white-bg font-body flex flex-col">
        <AppNavbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-alert-errorLight flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-alert-error" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-black mb-2">Report Not Found</h1>
          <p className="text-paragraph max-w-sm mb-6">
            The report you are looking for does not exist or has been removed.
          </p>
          <Link
            to="/reports"
            className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to All Reports
          </Link>
        </main>
      </div>
    );
  }

  // Determine current active stage index from status history or report status
  const currentStatusStr = (report.status || 'Reported').toLowerCase().replace(' ', '');
  let activeStageIndex = 0;
  if (currentStatusStr === 'acknowledged') activeStageIndex = 1;
  else if (currentStatusStr === 'inprogress') activeStageIndex = 2;
  else if (currentStatusStr === 'resolved') activeStageIndex = 3;

  // Map history to stages
  const mappedStages = STAGES.map((stageName, index) => {
    // Attempt to find a matching history record
    const historyRecord = statusHistory.find(h => {
      const s = (h.status || '').toLowerCase().replace(' ', '');
      const sn = stageName.toLowerCase().replace(' ', '');
      return s === sn;
    });

    let defaultNote = '';
    if (index === 0) defaultNote = 'Report has been delivered to the district';
    else if (index === 1) defaultNote = 'A few details about your company';
    else if (index === 2) defaultNote = 'Team has been dispatched';
    else if (index === 3) defaultNote = 'Issue has been successfully resolved';

    let date = historyRecord?.date || historyRecord?.createdAt || null;
    if (index === 0 && !date) date = report.createdAt || report.date;

    return {
      name: stageName,
      isCompleted: index < activeStageIndex || (index === activeStageIndex && currentStatusStr === 'resolved'),
      isActive: index === activeStageIndex && currentStatusStr !== 'resolved',
      date: date,
      note: historyRecord?.note || defaultNote
    };
  });

  const isAuthor = loggedInUserId && report.reporter && 
                   (report.reporter.id === loggedInUserId || report.reporter._id === loggedInUserId || report.reporterId === loggedInUserId);

  const displayDate = new Date(report.createdAt || report.date);
  const formattedDateHeader = `${String(displayDate.getMonth() + 1).padStart(2, '0')}/${String(displayDate.getDate()).padStart(2, '0')} - ${String(displayDate.getHours()).padStart(2, '0')}:${String(displayDate.getMinutes()).padStart(2, '0')}`;
  
  const displayId = report.id || report._id || 'UNKNOWN';
  
  // Robust extraction of coordinates to ensure the map shows the exact location
  const extractCoord = (val) => val !== undefined && val !== null && val !== '' ? parseFloat(val) : null;
  const dbLat = extractCoord(report.latitude) ?? extractCoord(report.lat) ?? extractCoord(report.location?.latitude) ?? extractCoord(report.location?.coordinates?.[1]);
  const dbLng = extractCoord(report.longitude) ?? extractCoord(report.lng) ?? extractCoord(report.location?.longitude) ?? extractCoord(report.location?.coordinates?.[0]);
  
  const lat = dbLat !== null ? dbLat : 6.5244;
  const lng = dbLng !== null ? dbLng : 3.3792;
  const thePhotoUrl = report.photoUrl || report.imageUrl || (report.images && report.images[0]) || null;

  return (
    <div className="min-h-screen bg-white-bg font-body flex flex-col">
      <AppNavbar />

      <main className="flex-1 w-full pb-8">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
          
          {/* MOBILE ONLY LAYOUT */}
          <div className="sm:hidden flex flex-col pb-6 px-4">
            {/* ID & Title */}
            <div className="mb-4 mt-2">
              <div className="text-[11px] font-medium text-black-placeholder mb-1">
                ID: #CR-{displayId.toString().slice(-4).toUpperCase()} / {formattedDateHeader}
              </div>
              <h1 className="font-heading font-bold text-2xl text-black leading-tight mb-3">
                {report.title || (report.category ? report.category.replace(/_/g, ' ') : 'Sanitation Issue')}
              </h1>
              
              {/* Badges Stack */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-black">
                  <div className="w-5 h-5 rounded-full bg-alert-errorLight flex items-center justify-center shrink-0">
                    <AlertCircle className="w-3 h-3 text-alert-error" />
                  </div>
                  Critical Level
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#118B33]">
                  <div className="w-5 h-5 rounded-full bg-[#FFF9E5] flex items-center justify-center shrink-0">
                    <Star className="w-3 h-3 text-[#FEAA01]" fill="#FEAA01" />
                  </div>
                  50 Credits Reward
                </div>
              </div>
            </div>
            
            {/* Photo */}
            <div className="relative mb-8 mt-2">
              <div className="w-full h-[220px] rounded-2xl overflow-hidden shadow-sm bg-white-bg2 border border-white-stroke">
                <img src={thePhotoUrl || fallbackImage} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }} />
              </div>
              
              {/* Overlapping Reporter Avatar */}
              <div className="absolute -bottom-5 left-3">
                <div className="w-14 h-14 rounded-full bg-white p-1 shadow-sm">
                  <img 
                    src={report.reporterAvatarUrl || report.reporterAvatar || report.reporter?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(report.reporterName || report.reporter?.displayName || report.reporter?.name || report.reporter?.fullName || report.reporter?.firstName || 'U')}&background=random`} 
                    alt="Reporter" 
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(report.reporterName || report.reporter?.displayName || report.reporter?.name || report.reporter?.fullName || report.reporter?.firstName || 'U')}&background=random`;
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Reporter Info & Actions */}
            <div className="flex items-center justify-between mb-6 pl-3">
              <div className="flex flex-col">
                <span className="font-bold text-[15px] text-black leading-none mb-1">
                  {report.reporterName || report.reporter?.displayName || report.reporter?.name || report.reporter?.fullName || report.reporter?.firstName || 'Anonymous'}
                </span>
                <span className="text-[11px] text-paragraph font-medium leading-none">
                  {report.reporter?.status || 'Top Contributor'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-black-icon hover:text-primary transition-colors p-1.5">
                  <Star className="w-4 h-4" />
                </button>
                <button className="text-black-icon hover:text-primary transition-colors p-1.5">
                  <Flag className="w-4 h-4" />
                </button>
                <button onClick={handleShare} className="flex items-center gap-1.5 text-black hover:text-primary transition-colors px-3 py-1.5 border border-white-stroke rounded-lg text-[11px] font-bold bg-white shadow-sm ml-1">
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>
              </div>
            </div>
            
            {/* Description & Map */}
            <div className="mb-6">
              <h3 className="font-heading font-bold text-lg text-black mb-2">Description</h3>
              <p className="text-[13px] text-paragraph leading-relaxed mb-4">
                {report.description || 'The green bin at Riverside East is completely full and littering the sidewalk. Several heavy bags have been left beside the bin, attracting pests and creating a walking hazard for pedestrians.'}
              </p>
              
              <div className="rounded-2xl overflow-hidden shadow-sm border border-white-stroke relative">
                {/* LOCATION label overlay */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm z-[400] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-black" />
                  <span className="text-[9px] font-bold text-black tracking-widest">LOCATION</span>
                </div>
                
                <div className="h-[180px] w-full bg-white-bg z-0 relative">
                  <MapContainer 
                    center={[report.latitude || 40.7128, report.longitude || -74.0060]} 
                    zoom={15} 
                    scrollWheelZoom={false}
                    dragging={true}
                    touchZoom={true}
                    zoomControl={true}
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                  >
                    <TileLayer 
                      attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      maxZoom={18}
                    />
                    <Marker position={[report.latitude || 40.7128, report.longitude || -74.0060]} icon={getMarkerIcon(report.status)}>
                      <Popup>
                        <div className="font-heading font-bold text-sm text-black">
                          {geoDistrict || report.areaName || 'Location'}
                        </div>
                        <div className="text-xs text-paragraph mt-1">
                          {geoAddress || report.address || 'Exact Location'}
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
              <div className="mt-2">
                <div className="font-bold text-[13px] text-black">
                  {geoDistrict || report.areaName || 'Downtown District'}
                </div>
                <div className="text-[11px] text-paragraph">
                  {geoAddress || report.address || '342 Civic Plaza, 10007'}
                </div>
              </div>
            </div>
            
            {/* Comments (Mobile) */}
            <div className="mb-8">
              <h3 className="font-heading font-bold text-lg text-black mb-4">Comments ({comments.length})</h3>
              <div className="space-y-5 mb-5">
                {comments.length === 0 ? (
                  <p className="text-sm text-black-placeholder italic">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className={`w-9 h-9 rounded-full border border-white-stroke flex items-center justify-center shrink-0 overflow-hidden ${comment.isModerator ? 'bg-[#C2F5CB]' : 'bg-white-bg2'}`}>
                        {comment.isModerator ? (
                           <img src="/logo.svg" alt="Mod" className="w-5 h-5 object-contain" />
                        ) : (
                           <img 
                             src={comment.authorAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorName || 'U')}&background=random`} 
                             alt="Avatar" 
                             className="w-full h-full object-cover"
                             onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorName || 'U')}&background=random`; }}
                           />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
                            <span className="font-bold text-black">
                              {comment.authorName || 'Anonymous'}
                              {comment.isModerator && (
                                ' City Dispatch (Moderator)'
                              )}
                            </span>
                            <span className="text-black-placeholder">• {timeAgo(comment.createdAt)}</span>
                          </div>
                          {loggedInUserId && (comment.authorId === loggedInUserId || loggedInUserRole === 'admin') && (
                            <button 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-black-placeholder hover:text-alert-error transition-colors p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-[12px] text-paragraph leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Add Comment Input (Mobile) */}
              {loggedInUserId ? (
                <form onSubmit={handleAddComment} className="flex gap-2 items-start">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      maxLength={1000}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full px-3 py-2.5 pr-14 border border-white-stroke rounded-lg text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-white shadow-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-black-placeholder">
                      {newComment.length}/1000
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="px-4 py-2.5 bg-[#118B33] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#0e742a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {isSubmittingComment ? '...' : 'Post'}
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 border border-white-stroke rounded-lg bg-white-bg2 text-center mt-2">
                  <p className="text-sm text-paragraph mb-3">Log in to join the conversation</p>
                  <Link to="/login" className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-colors">
                    Log in
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile Vertical Timeline */}
            <div className="mb-10 pl-2">
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute top-4 bottom-4 left-[15px] w-0.5 bg-white-stroke z-0"></div>
                
                {mappedStages.map((stage, i) => {
                  const isCompleted = stage.isCompleted;
                  const isActive = stage.isActive;
                  
                  return (
                    <div key={i} className="flex gap-4 relative z-10 mb-6 last:mb-0">
                      {/* Circle Icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-white ${isCompleted ? 'border-[#118B33] bg-[#118B33]' : isActive ? 'border-primary' : 'border-white-stroke'}`}>
                        {isCompleted ? (
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        ) : isActive ? (
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-white-stroke"></div>
                        )}
                      </div>
                      
                      {/* Text */}
                      <div className="flex flex-col pt-1">
                        <span className={`font-bold text-[13px] ${isCompleted ? 'text-[#118B33]' : isActive ? 'text-black' : 'text-paragraph'}`}>
                          {stage.name}
                        </span>
                        {stage.note && (
                          <span className="text-[11px] text-paragraph mt-0.5">{stage.note}</span>
                        )}
                        {stage.date && (
                          <span className="text-[10px] text-black-placeholder mt-0.5">
                            {new Date(stage.date).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Rewards Banner */}
            <div className="bg-[#F8F9FA] border border-white-stroke rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
              <Gift className="w-10 h-10 text-[#FEAA01] mb-3" strokeWidth={1.5} />
              <h3 className="font-heading font-bold text-lg text-black mb-2">Sent a CleanReport?</h3>
              <p className="text-[12px] text-paragraph leading-relaxed mb-5 max-w-[240px]">
                When you send a report, your reward appears here after the report have been resolved.
              </p>
              <button className="bg-[#118B33] text-white text-[12px] font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-[#0e742a] transition-colors w-[200px]">
                See Your Rewards
              </button>
            </div>
          </div>
          
          {/* DESKTOP ONLY LAYOUT */}
          <div className="hidden sm:block">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between min-h-[124px] py-6 w-full mb-6 gap-4">
            <div className="flex flex-col items-start gap-1">
              {/* Breadcrumb inside Header left block */}
              <div className="flex items-center text-[14px] font-medium text-black-placeholder mb-[18px]">
                <Link to="/" className="hover:text-primary transition-colors">Dashboard</Link>
                <span className="mx-2">›</span>
                <Link to="/reports" className="hover:text-primary transition-colors">All Reports</Link>
                <span className="mx-2">›</span>
                <span className="text-primary font-semibold">Report Details</span>
              </div>
              <div className="text-[13px] font-medium text-black-placeholder">
                ID: #CR-{displayId.toString().slice(-4).toUpperCase()} / {formattedDateHeader}
              </div>
              <h1 className="font-heading text-[32px] sm:text-[40px] font-bold text-black leading-tight mt-1">
                {report.title || (report.category ? report.category.replace(/_/g, ' ') : 'Sanitation Issue')}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                {/* Status Badge */}
                <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-sm border ${
                  (report.status || '').toLowerCase().replace(' ', '') === 'resolved' ? 'bg-alert-successLight text-primary border-alert-successStroke' :
                  (report.status || '').toLowerCase().replace(' ', '') === 'inprogress' ? 'bg-alert-inprogressLight text-alert-inprogress border-alert-inprogressStroke' :
                  (report.status || '').toLowerCase().replace(' ', '') === 'acknowledged' ? 'bg-alert-infoLight text-alert-info border-alert-infoStroke' :
                  'bg-alert-warningLight text-accent border-alert-warningStroke'
                }`}>
                  {report.status || 'Reported'}
                </span>
                {/* Category Badge */}
                <span className="text-[11px] font-extrabold uppercase px-3 py-0.5 rounded-sm bg-white text-black border border-black/10 shadow-[0_2px_4px_rgba(0,0,0,0.05)] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/70"></span>
                  {report.category ? report.category.replace(/_/g, ' ') : 'Sanitation'}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-[10px] shrink-0">
              {/* Urgency Badge */}
              <div className="flex items-center gap-[6px]">
                {getUrgencyIcon(report.urgency)}
                <span className="text-[13px] font-bold text-black">
                  {report.urgency || 'Critical Level'}
                </span>
              </div>
              {/* Rewards Badge */}
              <div className="flex items-center gap-[6px]">
                <Star className="w-[14px] h-[14px] text-[#FEAA01] fill-[#FEAA01]" />
                <span className="text-[13px] font-bold text-[#127C2F]">50 Credits Reward</span>
              </div>
            </div>
          </div>

          {/* Photo & Reporter Section */}
          <div className="mb-10 w-full relative">
            {/* Photo Container */}
            <div className="w-full h-[250px] sm:h-[360px] rounded-2xl overflow-hidden bg-white-stroke shadow-sm relative z-0">
              {thePhotoUrl ? (
                <img 
                  src={thePhotoUrl} 
                  alt="Report issue" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-black-placeholder bg-white-bg2">
                  No image provided
                </div>
              )}
            </div>

            {/* Reporter Info Row - Aligned precisely as in Figma */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between relative z-10 w-full px-4 sm:px-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left">
                {/* 80px avatar mobile, 112px desktop, shifted up to overlap photo equally */}
                <div className="w-20 h-20 sm:w-[112px] sm:h-[112px] rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 -mt-10 sm:-mt-[56px] shadow-sm ring-4 ring-white">
                  <div className="w-full h-full rounded-full border border-white-stroke overflow-hidden shrink-0">
                    <img 
                      src={report.reporterAvatarUrl || report.reporterAvatar || report.reporter?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(report.reporterName || report.reporter?.displayName || report.reporter?.name || report.reporter?.fullName || report.reporter?.firstName || 'U')}&background=random`} 
                      alt="Reporter" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(report.reporterName || report.reporter?.displayName || report.reporter?.name || report.reporter?.fullName || report.reporter?.firstName || 'U')}&background=random`;
                      }}
                    />
                  </div>
                </div>
                {/* Text aligned to the middle of the bottom half of the avatar */}
                <div className="mt-3">
                  <h3 className="font-heading font-bold text-black text-xl sm:text-[28px] leading-none mb-1">
                    {report.reporterName || report.reporter?.displayName || report.reporter?.name || report.reporter?.fullName || report.reporter?.firstName || 'Anonymous'}
                  </h3>
                  <p className="text-sm text-paragraph font-medium">
                    {report.reporter?.status || 'Top Contributor'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-4 sm:mt-3">
                <div className="flex items-center gap-2">
                  <button className="text-black-icon hover:text-primary transition-colors p-1" title="Save Report">
                    <Star className="w-[20px] h-[20px]" strokeWidth={1.5} />
                  </button>
                  <button className="text-black-icon hover:text-alert-error transition-colors p-1" title="Flag Report">
                    <Flag className="w-[20px] h-[20px]" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="flex items-center gap-2 ml-auto sm:ml-auto">
                  <button 
                    onClick={handleShare} 
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-primary text-primary text-[13px] font-bold rounded-lg hover:bg-primary/5 transition-colors shadow-sm"
                    title="Share on WhatsApp"
                  >
                    <Share2 className="w-[16px] h-[16px]" strokeWidth={2} />
                    Share
                  </button>
                  <button 
                    onClick={() => document.getElementById('commentInput')?.focus()}
                    className="px-4 py-1.5 bg-[#127C2F] text-white text-[13px] font-bold rounded-lg hover:bg-[#0e6325] transition-colors shadow-sm"
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Container for two-column content */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-[31px] self-stretch w-full">
            {/* Main Content Column */}
            <div className="w-full flex-1 max-w-full lg:max-w-[650px] xl:max-w-[700px]">
              {/* Description */}
              {report.description && (
                <div className="mb-10">
                  <h2 className="font-heading text-2xl font-bold text-black mb-2">Description</h2>
                  <p className="text-paragraph text-[15px] leading-relaxed whitespace-pre-wrap max-w-[600px]">
                    {report.description}
                  </p>
                </div>
              )}

              {/* Location */}
              <div className="mb-10">
                <div className="flex items-center gap-1.5 mb-3">
                  <MapPin className="w-5 h-5 text-black" />
                  <h2 className="font-heading text-sm font-bold text-black uppercase tracking-widest">Location</h2>
                </div>
              
              <div className="w-full h-[180px] rounded-xl overflow-hidden border border-white-stroke z-0 relative mb-3">
                <MapContainer
                  key={`map-${lat}-${lng}`}
                  center={[lat, lng]}
                  zoom={15}
                  zoomControl={true}
                  dragging={true}
                  scrollWheelZoom={true}
                  doubleClickZoom={true}
                  touchZoom={true}
                  className="w-full h-full z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    maxZoom={18}
                  />
                  <Marker position={[lat, lng]} icon={getMarkerIcon(report.status)}>
                    <Popup>
                      <div className="font-heading font-bold text-sm text-black">
                        {geoDistrict || report.areaName || 'Location'}
                      </div>
                      <div className="text-xs text-paragraph mt-1">
                        {geoAddress || report.address || 'Exact Location'}
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
              
              <div>
                <h3 className="font-bold text-black text-sm">{geoDistrict || report.areaName || 'Unknown District'}</h3>
                <p className="text-xs text-paragraph mt-0.5">{geoAddress || report.address || 'Location details not provided'}</p>
              </div>
            </div>

              {/* Comments Section */}
              <div className="mb-10">
                <h2 className="font-heading text-2xl font-bold text-black mb-4">
                  Comments ({comments.length})
                </h2>

              <div className="space-y-6 mb-8">
                {comments.length === 0 ? (
                  <p className="text-sm text-black-placeholder italic">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((comment) => {
                    const cid = comment.id;
                    const cAuthorId = comment.authorId;
                    const canDelete = loggedInUserId && (cAuthorId === loggedInUserId || loggedInUserRole === 'admin');

                    return (
                      <div key={cid} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-white-bg2 border border-white-stroke flex items-center justify-center shrink-0 overflow-hidden">
                          <div className="w-10 h-10 rounded-full border border-white-stroke overflow-hidden shrink-0">
                            <img 
                              src={comment.authorAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorName || 'U')}&background=random`} 
                              alt="Avatar" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorName || 'U')}&background=random`;
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline justify-between mb-1">
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-black text-[13px]">
                                {comment.authorName || 'Anonymous'}
                                {comment.isModerator && (
                                  ' City Dispatch (Moderator)'
                                )}
                              </span>
                              <span className="text-[11px] text-black-placeholder flex items-center gap-1">
                                • {timeAgo(comment.createdAt)}
                              </span>
                            </div>
                            {canDelete && (
                              <button 
                                onClick={() => handleDeleteComment(cid)}
                                className="text-black-placeholder hover:text-alert-error transition-colors p-1"
                                title="Delete comment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-paragraph whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Comment Input */}
              {loggedInUserId ? (
                <form onSubmit={handleAddComment} className="flex gap-3 items-start">
                  <div className="relative flex-1">
                    <input
                      id="commentInput"
                      type="text"
                      maxLength={1000}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full px-4 py-2.5 pr-14 border border-white-stroke rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-white"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-black-placeholder">
                      {newComment.length}/1000
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {isSubmittingComment ? 'Posting...' : 'Post'}
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border border-white-stroke rounded-xl bg-white-bg2 text-center mt-2">
                  <p className="text-[15px] text-black font-medium mb-4">Log in to join the conversation</p>
                  <Link to="/login" className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-colors">
                    Log in
                  </Link>
                </div>
              )}
            </div>

            </div>

            {/* Sidebar Column */}
            <div className="w-full lg:w-[409px] shrink-0 flex flex-col gap-[31px]">
              
              {/* Status Timeline Card */}
              <div className="flex flex-col items-start gap-[12px] p-[36px_24px] rounded-[12px] bg-white backdrop-blur-[32.5px] border border-white-stroke shadow-sm w-full relative">
                {/* Vertical Line connecting the dots */}
                <div className="absolute left-[39px] top-[56px] bottom-[56px] w-[2px] bg-white-stroke z-0">
                  {/* Green line progress fill */}
                <div 
                  className="absolute top-0 left-0 w-full bg-[#127C2F] transition-all duration-500" 
                  style={{ height: activeStageIndex > 0 ? `${(activeStageIndex / 3) * 100}%` : '0%' }}
                ></div>
              </div>
              
              {mappedStages.map((stage, idx) => {
                let circleClasses = "w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 bg-white";
                let textClasses = "font-bold text-[13px] text-black";
                let innerIcon = null;

                if (stage.isCompleted && !stage.isActive) {
                  circleClasses = "w-[32px] h-[32px] rounded-full bg-[#127C2F] flex items-center justify-center shrink-0";
                  innerIcon = <Check className="w-[16px] h-[16px] text-white" strokeWidth={3} />;
                  textClasses = "font-bold text-[14px] text-[#127C2F]";
                } else if (stage.isActive) {
                  circleClasses = "w-[32px] h-[32px] rounded-full bg-[#006FED] flex items-center justify-center shrink-0";
                  innerIcon = <div className="w-[12px] h-[12px] rounded-full bg-white"></div>;
                  textClasses = "font-bold text-[14px] text-[#006FED]";
                } else {
                  circleClasses = "w-[32px] h-[32px] rounded-full border border-white-stroke bg-white flex items-center justify-center shrink-0";
                  innerIcon = <div className="w-[8px] h-[8px] rounded-full bg-white-stroke"></div>;
                  textClasses = "font-semibold text-[14px] text-black-placeholder";
                }

                return (
                  <div key={stage.name} className="flex gap-4 items-start relative z-10 w-full mb-2">
                    <div className="bg-white rounded-full p-1 -ml-1">
                      <div className={circleClasses}>
                        {innerIcon}
                      </div>
                    </div>
                    <div className="pt-1.5">
                      <h4 className={textClasses}>{stage.name}</h4>
                      {stage.note && (
                        <p className="text-[13px] text-paragraph mt-1 leading-relaxed">
                          {stage.note}
                        </p>
                      )}
                      {stage.date && (
                        <p className="text-xs text-black-placeholder mt-1 font-medium">
                          {formatDateTime(stage.date)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sent a CleanReport? Rewards Card */}
            <div className="flex flex-col items-center text-center gap-3 p-[36px_24px] rounded-[12px] bg-white border border-white-stroke w-full">
              <div className="text-[40px] leading-none mb-1">
                🎁
              </div>
              <h3 className="font-heading text-[18px] font-bold text-black">Sent a CleanReport?</h3>
              <p className="text-[13px] text-paragraph leading-relaxed px-4">
                When you send a report, your reward appears here after the report has been resolved.
              </p>
              <Link
                to="/rewards"
                className="mt-3 px-6 py-2.5 bg-[#127C2F] text-white text-[13px] font-bold rounded-lg hover:bg-[#0e6325] transition-colors"
              >
                See Your Rewards
              </Link>
            </div>
          </div>
        </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Delete Confirmation Modal */}
      {commentToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCommentToDelete(null)}></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-alert-errorLight flex items-center justify-center mb-4 mx-auto">
              <AlertCircle className="w-6 h-6 text-alert-error" />
            </div>
            <h3 className="text-lg font-bold text-black text-center mb-2">Delete Comment</h3>
            <p className="text-sm text-paragraph text-center mb-6">Are you sure you want to delete this comment? This action cannot be undone.</p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCommentToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white-stroke text-black font-semibold hover:bg-white-bg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-lg bg-alert-error text-white font-semibold hover:bg-alert-error/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
