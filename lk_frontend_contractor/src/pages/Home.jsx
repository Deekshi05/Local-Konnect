import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import api from "../api";
import "../styles/home.css";

function Home() {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState({
        bidsSubmitted: 0,
        tendersWon: 0,
        ongoingProjects: 0,
        completedTenders: 0,
        bidSuccessRate: 0,
        categoryBids: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Get contractor's assigned tenders with bid status
            const assignedTendersResponse = await api.get('/tenders/contractor/assigned-with-bid-status/');
            const assignedTenders = assignedTendersResponse.data || [];

            // Get contractor's selected/won tenders
            const selectedTendersResponse = await api.get('/tenders/contractor/selected/');
            const selectedTenders = selectedTendersResponse.data || [];

            // Get contractor's services
            const servicesResponse = await api.get('/contractor/services/');
            const services = servicesResponse.data || [];

            // Calculate metrics
            const bidsSubmitted = assignedTenders.filter(tender => tender.bid_status === 'placed').length;
            const tendersWon = selectedTenders.length;
            const ongoingProjects = selectedTenders.filter(tender =>
                tender.payment_status === 'ongoing' || tender.payment_status === 'pending' || tender.payment_status === 'assigned'
            ).length;
            const completedTenders = selectedTenders.filter(tender =>
                tender.payment_status === 'completed' || tender.payment_status === 'paid' || tender.payment_status === 'overdue'
            ).length;
            const bidSuccessRate = bidsSubmitted > 0 ? (tendersWon / bidsSubmitted) * 100 : 0;

            const completedTendersList = selectedTenders.filter(tender =>
                ['completed', 'paid', 'overdue'].includes(tender.payment_status)
            );

            // Map service names to completed count
            const serviceCompletionMap = {};

            completedTendersList.forEach(tender => {
                let serviceName = 'Unknown';
                if (tender.service && typeof tender.service === 'object' && tender.service.name) {
                    serviceName = tender.service.name;
                } else if (typeof tender.service === 'string') {
                    serviceName = tender.service;
                }

                if (!serviceCompletionMap[serviceName]) {
                    serviceCompletionMap[serviceName] = 0;
                }
                serviceCompletionMap[serviceName]++;
            });


            const uniqueColors = [
                '#1e3a8a', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b',
                '#ef4444', '#ec4899', '#a855f7', '#14b8a6', '#22c55e',
                '#eab308', '#f43f5e', '#6366f1', '#16a34a', '#fb923c'
            ];

            let index = 0;
            // Convert the map to categoryBids format
            const categoryBids = Object.entries(serviceCompletionMap).map(([category, count], index) => ({
                category,
                count,
                color: uniqueColors[index % uniqueColors.length],
            }));

            const finalData = {
                bidsSubmitted,
                tendersWon,
                ongoingProjects,
                completedTenders,
                bidSuccessRate,
                categoryBids
            };
            setDashboardData(finalData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            // Set mock data if API fails
            setDashboardData({
                bidsSubmitted: 12,
                tendersWon: 5,
                ongoingProjects: 3,
                completedTenders: 3,
                bidSuccessRate: 41.6,
                categoryBids: [
                    { category: "Plumbing", count: 8, color: "#1e3a8a" },
                    { category: "Electrical", count: 5, color: "#0ea5e9" },
                    { category: "Carpentry", count: 4, color: "#8b5cf6" },
                    { category: "Painting", count: 2, color: "#10b981" },
                    { category: "HVAC", count: 3, color: "#f59e0b" }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const createPieChart = (data) => {
        const total = data.reduce((sum, item) => sum + item.count, 0);

        if (total === 0 || data.length === 0) {
        // No data to show
        return null;
    }

        if (data.length === 1 || data.every(item => item.count === total)) {
            // Single category - full circle
            return (
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill={data[0].color}
                    stroke="#fff"
                    strokeWidth="2"
                />
            );
        }

        let currentAngle = 0;

        return data.map((item, index) => {
            const percentage = (item.count / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;

            const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 50 + 40 * Math.cos((currentAngle - 90) * Math.PI / 180);
            const y2 = 50 + 40 * Math.sin((currentAngle - 90) * Math.PI / 180);

            const largeArcFlag = angle > 180 ? 1 : 0;

            const path = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
            ].join(' ');

            return (
                <path
                    key={index}
                    d={path}
                    fill={item.color}
                    stroke="#fff"
                    strokeWidth="2"
                />
            );
        });
    };


    const handleLogOut = () => {
        localStorage.clear();
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="home-container">
                <Sidebar />
                <div className="main-content">
                    <div className="loading">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="home-container">
                <Sidebar />
                <div className="main-content">
                    <div className="dashboard-header">
                        <h1>Dashboard</h1>
                        <button className="logout-button" onClick={handleLogOut}>
                            Logout
                        </button>
                    </div>

                    {/* KPI Cards Row */}
                    <div className="kpi-cards">
                        <div className="kpi-card">
                            <h3>Bids Submitted</h3>
                            <div className="kpi-value">{dashboardData.bidsSubmitted}</div>
                        </div>
                        <div className="kpi-card">
                            <h3>Tenders Won</h3>
                            <div className="kpi-value">{dashboardData.tendersWon}</div>
                        </div>
                        <div className="kpi-card">
                            <h3>Ongoing Projects</h3>
                            <div className="kpi-value">{dashboardData.ongoingProjects}</div>
                        </div>
                        <div className="kpi-card">
                            <h3>Completed Projects</h3>
                            <div className="kpi-value">{dashboardData.completedTenders}</div>
                        </div>
                    </div>

                    {/* Progress and Chart Row */}
                    <div className="progress-chart-row">
                        <div className="progress-card">
                            <h3>Bid Success Rate</h3>
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${dashboardData.bidSuccessRate}%` }}
                                ></div>
                            </div>
                            <div className="progress-percentage">{dashboardData.bidSuccessRate.toFixed(1)}%</div>
                            <div className="progress-label">Success Rate</div>
                        </div>

                        <div className="chart-card">
                            <h3>Category-wise Completed Tenders</h3>
                            <div className="pie-chart-container">
                                <svg width="200" height="200" viewBox="0 0 100 100">
                                    {createPieChart(dashboardData.categoryBids)}
                                </svg>
                            </div>
                            <div className="chart-legend">
                                {dashboardData.categoryBids.map((category, index) => (
                                    <div key={index} className="legend-item">
                                        <div
                                            className="legend-color"
                                            style={{ backgroundColor: category.color }}
                                        ></div>
                                        <span>{category.category}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;