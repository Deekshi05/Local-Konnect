import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3>Local Konnect</h3>
                    <p>Connecting local service providers with customers for better community engagement.</p>
                </div>

                <div className="footer-section">
                    <h3>Quick Links</h3>
                    <div className="footer-links">
                        <Link to="/" className="footer-link">Home</Link>
                        <Link to="/about" className="footer-link">About Us</Link>
                        <Link to="/services" className="footer-link">Services</Link>
                        <Link to="/register" className="footer-link">Join as Provider</Link>
                    </div>
                </div>

                <div className="footer-section">
                    <h3>Contact Us</h3>
                    <div className="footer-links">
                        <a href="mailto:support@localkonnect.com" className="footer-link">support@localkonnect.com</a>
                        <a href="tel:+1234567890" className="footer-link">+1 (234) 567-890</a>
                        <p>123 Business Street<br />City, State 12345</p>
                    </div>
                </div>

                <div className="footer-section">
                    <h3>Follow Us</h3>
                    <div className="social-links">
                        <a href="#" className="social-link" aria-label="Facebook">
                            <i className="fab fa-facebook"></i>
                        </a>
                        <a href="#" className="social-link" aria-label="Twitter">
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a href="#" className="social-link" aria-label="LinkedIn">
                            <i className="fab fa-linkedin"></i>
                        </a>
                        <a href="#" className="social-link" aria-label="Instagram">
                            <i className="fab fa-instagram"></i>
                        </a>
                    </div>
                </div>
            </div>

            {/* <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Local Konnect. All rights reserved.</p>
            </div> */}
        </footer>
    );
};

export default Footer;
