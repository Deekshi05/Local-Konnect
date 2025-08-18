import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import VoiceQueryComponent from '../../components/VoiceQueryComponent';
import './Home.css';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);

    const handleGetStarted = () => {
        if (user) {
            navigate('/customer/services');
        } else {
            navigate('/login');
        }
    };

    const handleVoiceJobGenerated = (jobData) => {
        console.log('Voice generated job:', jobData);
        // Navigate to quick jobs with the generated data
        navigate('/customer/quick-jobs', { state: { generatedJob: jobData } });
    };

    return (
        <div className="home">
            <section className="hero">
                <h1>Welcome to Local Konnect</h1>
                <p>
                    Connecting you with trusted local service providers for all your needs.
                    Find the perfect professional for your project today.
                </p>
                <div className="hero-buttons">
                    <button onClick={handleGetStarted} className="cta-button">
                        {user ? 'Browse Services' : 'Get Started'}
                    </button>
                    {user && (
                        <button 
                            className="voice-assistant-btn-home"
                            onClick={() => setShowVoiceAssistant(!showVoiceAssistant)}
                        >
                            <i className="fas fa-microphone"></i>
                            {showVoiceAssistant ? 'Hide Voice Assistant' : 'Try Voice Assistant'}
                        </button>
                    )}
                </div>
            </section>

            {/* Voice Assistant Section */}
            {user && showVoiceAssistant && (
                <section className="voice-assistant-section">
                    <div className="voice-assistant-container">
                        <div className="voice-assistant-header">
                            <h2>🎤 AI Voice Assistant</h2>
                            <p>Speak your service needs in Hindi, English, or Hinglish</p>
                        </div>
                        <VoiceQueryComponent 
                            onJobDataGenerated={handleVoiceJobGenerated}
                            services={[]}
                        />
                    </div>
                </section>
            )}

            {/* Stats Section */}
            <section className="stats">
                <div className="stats-container">
                    <div className="stat-item">
                        <h3>10,000+</h3>
                        <p>Happy Customers</p>
                    </div>
                    <div className="stat-item">
                        <h3>500+</h3>
                        <p>Verified Contractors</p>
                    </div>
                    <div className="stat-item">
                        <h3>50+</h3>
                        <p>Service Categories</p>
                    </div>
                    <div className="stat-item">
                        <h3>98%</h3>
                        <p>Satisfaction Rate</p>
                    </div>
                </div>
            </section>

            {/* Popular Services Section */}
            <section className="popular-services">
                <div className="popular-services-container">
                    <h2>Popular Services</h2>
                    <div className="services-grid">
                        <div className="service-item">
                            <i className="fas fa-wrench"></i>
                            <span>Plumbing</span>
                        </div>
                        <div className="service-item">
                            <i className="fas fa-bolt"></i>
                            <span>Electrical</span>
                        </div>
                        <div className="service-item">
                            <i className="fas fa-broom"></i>
                            <span>Cleaning</span>
                        </div>
                        <div className="service-item">
                            <i className="fas fa-paint-roller"></i>
                            <span>Painting</span>
                        </div>
                        <div className="service-item">
                            <i className="fas fa-hammer"></i>
                            <span>Carpentry</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works">
                <div className="how-container">
                    <h2>How It Works</h2>
                    <div className="steps-grid">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <h3>Post Your Need</h3>
                            <p>Describe your service requirement using voice or text</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <h3>Get Matched</h3>
                            <p>Receive bids from verified local contractors</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <h3>Get It Done</h3>
                            <p>Choose the best contractor and get your work completed</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="features">
                <div className="features-container">
                    <div className="feature-card">
                        <i className="fas fa-tools"></i>
                        <h3>Expert Services</h3>
                        <p>Connect with verified professionals for quality service delivery.</p>
                    </div>

                    <div className="feature-card">
                        <i className="fas fa-clock"></i>
                        <h3>Quick Booking</h3>
                        <p>Easy appointment scheduling with real-time availability.</p>
                    </div>

                    <div className="feature-card">
                        <i className="fas fa-shield-alt"></i>
                        <h3>Secure Platform</h3>
                        <p>Safe and secure transactions with verified service providers.</p>
                    </div>
                </div>
            </section>

            {/* Trust Network Highlight */}
            <section className="trust-highlight">
                <div className="trust-container">
                    <h2>🤝 Built on Community Trust</h2>
                    <p>Our unique trust network ensures you get recommendations from people who've actually worked with contractors in your area.</p>
                    <button onClick={() => navigate('/customer/trust-network')} className="trust-cta">
                        Learn About Trust Network
                    </button>
                </div>
            </section>

            <section className="testimonials">
                <div className="testimonials-container">
                    <h2>What Our Users Say</h2>
                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <p className="testimonial-text">
                                "Local Konnect made it incredibly easy to find a reliable plumber in my area.
                                The service was quick and professional!"
                            </p>
                            <p className="testimonial-author">- Sarah Johnson</p>
                        </div>

                        <div className="testimonial-card">
                            <p className="testimonial-text">
                                "As a service provider, this platform has helped me connect with new customers
                                and grow my business substantially."
                            </p>
                            <p className="testimonial-author">- Michael Brown</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
