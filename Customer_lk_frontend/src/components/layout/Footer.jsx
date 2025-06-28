import React from "react";
import "../../styles/layout_styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-section">
        <h3 className="brand">
          <span>✦</span> The cleanic
        </h3>
        <button className="footer-button">Find The Service</button>
      </div>

      <div className="footer-section">
        <h4>Legal</h4>
        <ul>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms & Conditions</a></li>
          <li><a href="#">Refund Policy</a></li>
        </ul>
      </div>

      <div className="footer-section">
        <h4>Operating Hours</h4>
        <p>Mon - Fri: 8am - 8pm</p>
        <p>Saturday: 9am - 7pm</p>
        <p>Sunday: 9am - 8pm</p>
        <h4>Follow us for cleaning tips</h4>
        <div className="social-icons">
          <a href="#">Instagram</a>
          <a href="#">Facebook</a>
          <a href="#">YouTube</a>
          <a href="#">TikTok</a>
        </div>
      </div>

      <div className="footer-section">
        <h4>Contact</h4>
        <address>
          The cleanic<br />
          500 Terry Francine Street<br />
          San Francisco, CA 94158<br />
          123-456-7890<br />
          <a href="mailto:info@mysite.com">info@mysite.com</a>
        </address>
      </div>
    </footer>
  );
};

export default Footer;
