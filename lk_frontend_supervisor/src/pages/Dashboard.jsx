import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { API_ENDPOINTS } from '../constants';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTenders: 0,
    activeTenders: 0,
    totalCustomers: 0,
    totalContractors: 0,
    pendingAppointments: 0,
    completedProjects: 0,
    totalConsultations: 0,
    pendingVisits: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentTenders, setRecentTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch supervisor-specific data with individual error handling
      const results = await Promise.allSettled([
        api.get(API_ENDPOINTS.VIRTUAL_APPOINTMENTS_SUPERVISOR).catch(err => {
          console.error('Error fetching virtual appointments:', err);
          return { data: [] };
        }),
        api.get(API_ENDPOINTS.PHYSICAL_VISITS_SUPERVISOR).catch(err => {
          console.error('Error fetching physical visits:', err);
          return { data: [] };
        }),
        api.get(API_ENDPOINTS.TENDERS_SUPERVISOR).catch(err => {
          console.error('Error fetching tenders:', err);
          return { data: [] };
        }),
        api.get(API_ENDPOINTS.SUPERVISOR_SERVICES).catch(err => {
          console.error('Error fetching services:', err);
          return { data: [] };
        }),
        api.get(API_ENDPOINTS.TENDER_ASSISTANCE_SUPERVISOR).catch(err => {
          console.error('Error fetching tender assistance:', err);
          return { data: [] };
        })
      ]);

      const [appointmentsRes, visitsRes, tendersRes, servicesRes, assistanceRes] = results.map(result => 
        result.status === 'fulfilled' ? result.value : { data: [] }
      );

      // Extract data from responses with additional error checking
      const virtualAppointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];
      const physicalVisits = Array.isArray(visitsRes.data) ? visitsRes.data : [];
      const supervisorTenders = Array.isArray(tendersRes.data) ? tendersRes.data : [];
      const supervisorServices = Array.isArray(servicesRes.data) ? servicesRes.data : [];
      const tenderAssistance = Array.isArray(assistanceRes.data) ? assistanceRes.data : [];

      console.log('Dashboard data:', {
        appointments: virtualAppointments,
        visits: physicalVisits,
        tenders: supervisorTenders,
        services: supervisorServices,
        assistance: tenderAssistance
      });

      // Calculate statistics
      const pendingAppointments = virtualAppointments.filter(a => a.status === 'scheduled').length;
      const pendingVisits = physicalVisits.filter(v => v.status === 'scheduled' || v.status === 'payment_pending').length;
      const activeTenders = supervisorTenders.filter(t => t.status === 'Active').length;
      const completedTenders = supervisorTenders.filter(t => t.status === 'Completed').length;

      setStats({
        totalTenders: supervisorTenders.length,
        activeTenders,
        totalCustomers: supervisorServices.length, // Using services count as a proxy for active customers
        totalContractors: 0, // This will be updated when we have the correct endpoint
        pendingAppointments,
        completedProjects: completedTenders,
        totalConsultations: virtualAppointments.length,
        pendingVisits
      });

      // Set recent data
      setRecentAppointments(virtualAppointments.slice(0, 5));
      setRecentTenders(supervisorTenders.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'var(--lk-warning)',
      completed: 'var(--lk-success)',
      cancelled: 'var(--lk-error)',
      no_show: 'var(--lk-error)',
      payment_pending: 'var(--lk-warning)',
      confirmed: 'var(--lk-info)'
    };
    return colors[status] || 'var(--lk-secondary)';
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Supervisor Dashboard</h1>
        <p>Monitor your consultations, appointments, and platform activities</p>
      </div>

      {error && (
        <div className="error-message" style={{ 
          background: 'var(--lk-error-light)', 
          color: 'var(--lk-error)', 
          padding: 'var(--lk-spacing)', 
          borderRadius: 'var(--lk-radius)', 
          marginBottom: 'var(--lk-spacing-md)' 
        }}>
          {error}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.totalTenders}</h3>
            <p>Total Tenders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>{stats.activeTenders}</h3>
            <p>Active Tenders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h3>{stats.pendingAppointments}</h3>
            <p>Pending Consultations</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <h3>{stats.pendingVisits}</h3>
            <p>Pending Visits</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedProjects}</h3>
            <p>Completed Projects</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalCustomers}</h3>
            <p>Total Services</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Consultations</h2>
            <button 
              className="btn btn-outline" 
              onClick={() => navigate('/consultations')}
            >
              View All
            </button>
          </div>
          <div className="appointments-list">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appointment) => (
                <div key={appointment.id} className="appointment-item">
                  <div className="appointment-info">
                    <h4>{appointment.customer_name || 'Customer'}</h4>
                    <p>{appointment.service_name || 'Service'}</p>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(appointment.status) }}
                    >
                      {appointment.status}
                    </span>
                  </div>
                  <div className="appointment-meta">
                    <p>Date: {new Date(appointment.scheduled_time).toLocaleDateString()}</p>
                    <p>Time: {new Date(appointment.scheduled_time).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No recent consultations found</p>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Tenders</h2>
            <button 
              className="btn btn-outline" 
              onClick={() => navigate('/tenders')}
            >
              View All
            </button>
          </div>
          <div className="tenders-list">
            {recentTenders.length > 0 ? (
              recentTenders.map((tender) => (
                <div key={tender.id} className="tender-item">
                  <div className="tender-info">
                    <h4>{tender.title || `Tender #${tender.id}`}</h4>
                    <p>{tender.description || 'No description available'}</p>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(tender.status) }}
                    >
                      {tender.status}
                    </span>
                  </div>
                  <div className="tender-meta">
                    <p>Customer: {tender.customer_name || 'N/A'}</p>
                    <p>Created: {new Date(tender.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No recent tenders found</p>
            )}
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button 
              className="action-btn"
              onClick={() => navigate('/consultations')}
            >
              <span className="action-icon">💬</span>
              <span>Manage Consultations</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/visits')}
            >
              <span className="action-icon">🏠</span>
              <span>Schedule Visits</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/tenders')}
            >
              <span className="action-icon">📋</span>
              <span>View Tenders</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/customers')}
            >
              <span className="action-icon">👥</span>
              <span>Manage Customers</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
