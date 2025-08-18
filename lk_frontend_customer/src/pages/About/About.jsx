import React from 'react';
import './About.css';

const About = () => {
    return (
        <div className="about">
            <div className="about-header">
                <h1>About Local Konnect</h1>
                <p>
                    Empowering communities by connecting local service providers with customers,
                    creating opportunities and fostering growth.
                </p>
            </div>

            <section className="mission-section">
                <div className="mission-content">
                    <h2>Our Mission</h2>
                    <p>
                        At Local Konnect, we believe in building stronger communities through
                        efficient service connections. Our platform serves as a bridge between
                        skilled professionals and customers, ensuring quality service delivery
                        while promoting local business growth.
                    </p>
                    <p>
                        We strive to create a transparent, reliable, and user-friendly
                        environment where finding the right service provider is just a few
                        clicks away.
                    </p>
                </div>
                <img
                    src="/images/mission.jpg"
                    alt="Local Konnect Mission"
                    className="mission-image"
                />
            </section>

            <section className="values-section">
                <h2>Our Values</h2>
                <div className="values-grid">
                    <div className="value-card">
                        <i className="fas fa-handshake"></i>
                        <h3>Trust</h3>
                        <p>Building reliable connections between providers and customers.</p>
                    </div>
                    <div className="value-card">
                        <i className="fas fa-star"></i>
                        <h3>Quality</h3>
                        <p>Ensuring high standards in service delivery.</p>
                    </div>
                    <div className="value-card">
                        <i className="fas fa-users"></i>
                        <h3>Community</h3>
                        <p>Fostering strong local business relationships.</p>
                    </div>
                </div>
            </section>

            <section className="team-section">
                <h2>Our Team</h2>
                <div className="team-grid">
                    <div className="team-member">
                        <img src="/images/team1.jpg" alt="Team Member 1" />
                        <h3>John Doe</h3>
                        <p>Founder & CEO</p>
                    </div>
                    <div className="team-member">
                        <img src="/images/team2.jpg" alt="Team Member 2" />
                        <h3>Jane Smith</h3>
                        <p>Head of Operations</p>
                    </div>
                    <div className="team-member">
                        <img src="/images/team3.jpg" alt="Team Member 3" />
                        <h3>Mike Johnson</h3>
                        <p>Technical Lead</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
