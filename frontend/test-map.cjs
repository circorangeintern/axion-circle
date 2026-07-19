const axios = require('axios');

const mapBackendReportToFrontend = (report) => {
    const formatEnum = (str) => {
      if (!str) return 'Routine';
      return str.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    };
    
    const categoryLabel = formatEnum(report.category);
    const urgencyLabel = formatEnum(report.urgency);
    const statusLabel = formatEnum(report.status);
    
    let dateStr = 'Unknown Date';
    if (report.createdAt) {
      const d = new Date(report.createdAt);
      dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }) + ' - ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    let indicator = 'sun';
    if (report.urgency === 'CRITICAL' || report.urgency === 'VERY_URGENT') indicator = 'alert';
    else if (report.status === 'IN_PROGRESS') indicator = 'gauge';

    return {
      id: report.id || Math.random().toString(),
      title: categoryLabel || 'Sanitation Issue',
      category: categoryLabel,
      urgency: urgencyLabel,
      status: statusLabel,
      description: report.description || 'Sanitation issue report',
      date: dateStr,
      address: report.areaName || 'Location unavailable — tap Edit Location to set manually',
      indicator: indicator,
      photoUrl: report.photoUrl,
    };
  };

async function testFetch() {
  try {
    const response = await axios.get('https://cleanreport-api.onrender.com/api/v1/reports?size=100');
    const backendReports = response.data?.data?.content || [];
    console.log('Fetched:', backendReports.length);
    const mapped = backendReports.map(mapBackendReportToFrontend);
    console.log('Mapped successfully! First item:', mapped[0]);
  } catch (error) {
    console.error('Error mapping:', error);
  }
}

testFetch();
