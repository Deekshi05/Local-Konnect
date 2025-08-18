import React from 'react';
import { Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../constants';
import './CustomerLayout.css';

// Customer Pages
import Dashboard from '../../pages/Dashboard/Dashboard';
import Home from '../../pages/Home/Home';
import Services from '../../pages/Services/Services';
import ServiceDetail from '../../pages/Services/ServiceDetail';
import ServiceConsultation from '../../pages/Services/ServiceConsultation';
import Appointments from '../../pages/Appointments/Appointments';
import PhysicalVisitBooking from '../../pages/Appointments/PhysicalVisitBooking';
import Tenders from '../../pages/Tenders/Tenders';
import CreateTender from '../../pages/Tenders/CreateTender';
import TenderDetail from '../../pages/Tenders/TenderDetail';
import TenderAssistance from '../../pages/Tenders/TenderAssistance';
import ContractorSelection from '../../pages/Tenders/ContractorSelection';
import WorkProgress from '../../pages/Tenders/WorkProgress';
import Profile from '../../pages/Profile/Profile';
import Visualizer from '../../pages/Visualizer/Visualizer';

// New Consultation Components
import BookSupervisorAppointment from '../../pages/Consultation/BookSupervisorAppointment';
import SupervisorConsultation from '../../pages/Consultation/SupervisorConsultation';

// Trust Network Components
import QuickJobsPage from '../QuickJobsPage';
import TrustRecommendationPage from '../TrustRecommendationPage';
import MyQuickJobsPage from '../MyQuickJobsPage';

const CustomerLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/customer/home') {
            return location.pathname === '/customer/home' || location.pathname === '/customer' || location.pathname === '/customer/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="customer-layout">
            <header className="main-header">
                <nav className="main-nav">
                    <div className="nav-brand">
                        <Link to="/customer/home">
                            <FaHome />
                            <span>Local Konnect</span>
                        </Link>
                    </div>
                    
                    <div className="nav-center">
                        <div className="nav-links">
                            <Link 
                                to="/customer/services" 
                                className={`nav-link ${isActive('/customer/services') ? 'active' : ''}`}
                            >
                                <i className="fas fa-tools"></i>
                                <span>Services</span>
                            </Link>
                            <Link 
                                to="/customer/tenders" 
                                className={`nav-link ${isActive('/customer/tenders') ? 'active' : ''}`}
                            >
                                <i className="fas fa-file-contract"></i>
                                <span>Tenders</span>
                            </Link>
                            <Link 
                                to="/customer/quick-jobs" 
                                className={`nav-link ${isActive('/customer/quick-jobs') ? 'active' : ''}`}
                            >
                                <i className="fas fa-bolt"></i>
                                <span>Instant Works</span>
                            </Link>
                            <Link 
                                to="/customer/visualizer" 
                                className={`nav-link ${isActive('/customer/visualizer') ? 'active' : ''}`}
                            >
                                <i className="fas fa-cube"></i>
                                <span>Visualizer</span>
                            </Link>
                        </div>
                    </div>

                    <div className="nav-right">
                        <Link 
                            to="/customer/profile" 
                            className={`nav-link profile-link ${isActive('/customer/profile') ? 'active' : ''}`}
                            title="Profile"
                        >
                            <i className="fas fa-user"></i>
                        </Link>
                    </div>
                </nav>
            </header>
            
            <main className="main-content">
                <Routes>
                    <Route path="home" element={<Home />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="services" element={<Services />} />
                    <Route path="services/:serviceId" element={<ServiceDetail />} />
                    <Route path="services/:serviceId/book" element={<ServiceConsultation />} />
                    
                    {/* Consultation Routes */}
                    <Route path="consultations" element={<SupervisorConsultation />} />
                    <Route path="consultations/book" element={<BookSupervisorAppointment />} />
                    
                    {/* Trust Network Routes */}
                    <Route path="quick-jobs" element={<QuickJobsPage />} />
                    <Route path="my-quick-jobs" element={<MyQuickJobsPage />} />
                    <Route path="trust-network" element={<TrustRecommendationPage />} />
                    
                    {/* Visualizer Route */}
                    <Route path="visualizer" element={<Visualizer />} />
                    
                    {/* Appointments Routes */}
                    <Route path="appointments" element={<Appointments />} />
                    <Route path="appointments/:appointmentId/book-visit" element={<PhysicalVisitBooking />} />
                    
                    {/* Tenders Routes */}
                    <Route path="tenders" element={<Tenders />} />
                    <Route path="tenders/create" element={<CreateTender />} />
                    <Route path="tenders/:tenderId" element={<TenderDetail />} />
                    <Route path="tenders/:tenderId/bids" element={<TenderDetail />} />
                    <Route path="tenders/:tenderId/select-contractor" element={<ContractorSelection />} />
                    <Route path="tenders/:tenderId/progress" element={<WorkProgress />} />
                    <Route path="tenders/assistance/:assistanceId" element={<TenderAssistance />} />
                    <Route path="tenders/create/assisted/:assistanceId" element={<CreateTender />} />
                    
                    <Route path="profile" element={<Profile />} />
                    <Route path="" element={<Navigate to="home" replace />} />
                    <Route path="*" element={<Navigate to="/customer/home" replace />} />
                </Routes>
            </main>
            
            {/* <footer className="main-footer">
                <p>&copy; 2025 Local Konnect. All rights reserved.</p>
            </footer> */}
        </div>
    );
};

export default CustomerLayout;
