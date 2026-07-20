import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Star, Flag, Trash2, ArrowLeft, Gift, 
  MessageSquare, User, Clock, Check, AlertCircle, Share2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import AppNavbar from '../components/AppNavbar';

const getMarkerIcon = (status) => {
  let color = '#006FED'; // default blue
  const s = (status || '').toLowerCase();
  if (s === 'reported') color = '#FEAA01'; // amber
  else if (s === 'acknowledged') color = '#006FED'; // blue
  else if (s === 'inprogress' || s === 'in progress') color = '#8B5CF6'; // purple
  else if (s === 'resolved') color = '#127C2F'; // green

  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
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
  
  const [report, setReport] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [comments, setComments] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setLoggedInUserId(user.id || user._id);
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

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Check if logged in first before attempting to comment
    if (!localStorage.getItem('access_token')) {
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

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
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

    return {
      name: stageName,
      isCompleted: index < activeStageIndex || (index === activeStageIndex && currentStatusStr === 'resolved'),
      isActive: index === activeStageIndex && currentStatusStr !== 'resolved',
      date: historyRecord?.date || historyRecord?.createdAt || null,
      note: historyRecord?.note || null
    };
  });
  
  // If no history record exists for the 'Reported' stage, use the report creation date
  if (!mappedStages[0].date) {
    mappedStages[0].date = report.createdAt || report.date;
  }

  const isAuthor = loggedInUserId && report.reporter && 
                   (report.reporter.id === loggedInUserId || report.reporter._id === loggedInUserId || report.reporterId === loggedInUserId);

  const displayDate = new Date(report.createdAt || report.date);
  const formattedDateHeader = `${String(displayDate.getMonth() + 1).padStart(2, '0')}/${String(displayDate.getDate()).padStart(2, '0')} - ${String(displayDate.getHours()).padStart(2, '0')}:${String(displayDate.getMinutes()).padStart(2, '0')}`;
  
  const displayId = report.id || report._id || 'UNKNOWN';
  
  const lat = report.latitude ? parseFloat(report.latitude) : 6.5244;
  const lng = report.longitude ? parseFloat(report.longitude) : 3.3792;

  return (
    <div className="min-h-screen bg-white-bg font-body flex flex-col">
      <AppNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-xs font-medium text-black-placeholder mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Dashboard</Link>
          <span className="mx-2">›</span>
          <Link to="/reports" className="hover:text-primary transition-colors">All Reports</Link>
          <span className="mx-2">›</span>
          <span className="text-primary">Report Details</span>
        </div>

        {/* Mobile layout placeholder comment: 
            The layout below stacks on mobile (< md) and shows two columns on desktop (md+). 
            Adjustments may be needed once mobile Figma designs are finalized. */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Main Content Column */}
          <div className="w-full md:w-[65%] lg:w-[70%]">
            
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
              <div>
                <div className="text-sm font-medium text-black-placeholder mb-1">
                  ID: #CR-{displayId.toString().slice(-4).toUpperCase()} / {formattedDateHeader}
                </div>
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-black mt-1">
                  {report.title || (report.category ? report.category.replace(/_/g, ' ') : 'Sanitation Issue')}
                </h1>
              </div>
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                {/* Urgency Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-alert-errorLight rounded-full">
                  <AlertCircle className="w-3.5 h-3.5 text-alert-error" />
                  <span className="text-xs font-bold text-alert-error">
                    {report.urgency || 'Critical Level'}
                  </span>
                </div>
                {/* Rewards Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-xs font-bold text-primary">50 Credits Reward</span>
                </div>
              </div>
            </div>

            {/* Photo & Reporter Section */}
            <div className="mb-10">
              {/* Photo with relative positioning for the avatar */}
              <div className="relative">
                <div className="w-full h-[300px] sm:h-[400px] rounded-2xl overflow-hidden bg-white-stroke shadow-sm">
                  {report.photoUrl ? (
                    <img 
                      src={report.photoUrl} 
                      alt="Report issue" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-black-placeholder bg-white-bg2">
                      No image provided
                    </div>
                  )}
                </div>
                
                {/* Absolute Avatar overlapping bottom edge */}
                <div className="absolute -bottom-10 sm:-bottom-12 left-4 sm:left-8 w-24 h-24 sm:w-[110px] sm:h-[110px] rounded-full bg-white border-4 border-white shadow-sm flex items-center justify-center overflow-hidden z-10">
                  {report.reporter?.avatarUrl ? (
                    <img src={report.reporter.avatarUrl} alt="Reporter" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-primary/50" />
                  )}
                </div>
              </div>

              {/* Reporter Info Row (Flows normally below photo) */}
              <div className="mt-3 sm:mt-4 pl-[120px] sm:pl-[160px] pr-2 sm:pr-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading font-bold text-black text-xl sm:text-2xl">
                    {report.reporter?.displayName || report.reporter?.name || report.reporter?.fullName || report.reporter?.firstName || 'Anonymous'}
                  </h3>
                  <p className="text-sm text-black-placeholder font-medium mt-0.5">
                    {report.reporter?.status || 'Top Contributor'}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2">
                  <button className="p-2 text-black-icon hover:text-primary transition-colors" title="Save Report">
                    <Star className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-black-icon hover:text-alert-error transition-colors" title="Flag Report">
                    <Flag className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => document.getElementById('commentInput')?.focus()}
                    className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm ml-1"
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            {report.description && (
              <div className="mb-8">
                <h2 className="font-heading text-xl font-bold text-black mb-3">Description</h2>
                <p className="text-paragraph text-sm leading-relaxed whitespace-pre-wrap">
                  {report.description}
                </p>
              </div>
            )}

            {/* Category Badge */}
            {report.category && (
              <div className="mb-8">
                <span className="inline-block px-3 py-1 bg-white-bg2 text-paragraph text-xs font-bold uppercase rounded-full border border-white-stroke">
                  {report.category.replace(/_/g, ' ')}
                </span>
              </div>
            )}

            {/* Location */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-black" />
                <h2 className="font-heading text-lg font-bold text-black uppercase">Location</h2>
              </div>
              
              <div className="w-full h-[200px] rounded-xl overflow-hidden border border-white-stroke z-0 relative mb-3">
                <MapContainer
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
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={18}
                  />
                  <Marker position={[lat, lng]} icon={getMarkerIcon(report.status)} />
                </MapContainer>
              </div>
              
              <div>
                <h3 className="font-bold text-black text-sm">{report.areaName || 'Unknown District'}</h3>
                <p className="text-xs text-paragraph mt-0.5">{report.address || 'Location details not provided'}</p>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mb-10">
              <h2 className="font-heading text-xl font-bold text-black mb-6">
                Comments ({comments.length})
              </h2>

              <div className="space-y-6 mb-8">
                {comments.length === 0 ? (
                  <p className="text-sm text-black-placeholder italic">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((comment) => {
                    const cid = comment.id || comment._id;
                    const cAuthorId = comment.user?.id || comment.user?._id || comment.userId;
                    const canDelete = loggedInUserId && cAuthorId === loggedInUserId;

                    return (
                      <div key={cid} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-white-bg2 border border-white-stroke flex items-center justify-center shrink-0 overflow-hidden">
                          {comment.user?.avatarUrl ? (
                            <img src={comment.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-black-placeholder" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline justify-between mb-1">
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-black text-sm">
                                {comment.user?.displayName || comment.user?.name || comment.user?.fullName || comment.user?.firstName || comment.authorName || 'User'}
                              </span>
                              <span className="text-[10px] text-black-placeholder flex items-center gap-1">
                                • {timeAgo(comment.createdAt || comment.date)}
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
                            {comment.content || comment.text}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-3">
                <input
                  id="commentInput"
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2.5 border border-white-stroke rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-white"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {isSubmittingComment ? 'Posting...' : 'Post'}
                </button>
              </form>
            </div>

            {/* Share Button */}
            <div>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-2.5 border border-white-stroke bg-white text-black text-sm font-semibold rounded-lg hover:bg-white-bg transition-colors shadow-sm"
              >
                <Share2 className="w-4 h-4 text-primary" />
                Share on WhatsApp
              </button>
            </div>

          </div>

          {/* Sidebar Column */}
          <div className="w-full md:w-[35%] lg:w-[30%] flex flex-col gap-6">
            
            {/* Status Timeline Card */}
            <div className="bg-white border border-white-stroke rounded-2xl p-6 shadow-sm">
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[11px] top-2 bottom-6 w-0.5 bg-white-stroke z-0"></div>
                
                <div className="space-y-6 relative z-10">
                  {mappedStages.map((stage, idx) => {
                    let circleClasses = "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 bg-white";
                    let textClasses = "font-bold text-sm text-black";
                    let innerIcon = null;

                    if (stage.isCompleted) {
                      circleClasses = "w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 border-2 border-primary";
                      innerIcon = <Check className="w-3.5 h-3.5 text-white" />;
                    } else if (stage.isActive) {
                      circleClasses = "w-6 h-6 rounded-full bg-alert-info flex items-center justify-center shrink-0 border-2 border-alert-info";
                      innerIcon = <div className="w-2 h-2 rounded-full bg-white"></div>;
                    } else {
                      circleClasses = "w-6 h-6 rounded-full border-2 border-white-stroke bg-white flex items-center justify-center shrink-0";
                      textClasses = "font-semibold text-sm text-black-placeholder";
                    }

                    return (
                      <div key={stage.name} className="flex gap-4 items-start">
                        <div className={circleClasses}>
                          {innerIcon}
                        </div>
                        <div className="pt-0.5">
                          <h4 className={textClasses}>{stage.name}</h4>
                          {stage.note && (
                            <p className="text-xs text-paragraph mt-1 leading-relaxed">
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
              </div>
            </div>

            {/* Sent a CleanReport? Rewards Card */}
            {isAuthor && (
              <div className="bg-white border border-white-stroke rounded-2xl p-6 shadow-sm flex flex-col items-center text-center mt-2">
                <div className="text-5xl mb-4">
                  🎁
                </div>
                <h3 className="font-heading text-lg font-bold text-black mb-2">Sent a CleanReport?</h3>
                <p className="text-sm text-paragraph mb-5 leading-relaxed">
                  When you send a report, your reward appears here after the report has been resolved.
                </p>
                <Link
                  to="/rewards"
                  className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                  See Your Rewards
                </Link>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
}
