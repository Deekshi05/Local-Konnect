import React from 'react';

import '../../../styles/page_styles/home_styles/choose.css';
import contract from '../../../assets/contract.jpeg';
function Choose(){
  return (
    <div className="choose-us-section">
      <div className="image-section">
        <img src={contract} alt="Person holding spray bottle" />
      </div>
      <div className="content-section">
        <h2>Why Choose Us</h2>
        <div className="points-container">
          <div className="point">
            <span className="icon">✦</span>
            <div>
              <h3>Qualified Supervisors</h3>
              <p>Help you to make better decisions for your work.</p>
            </div>
          </div>
          <div className="point">
            <span className="icon">✦</span>
            <div>
              <h3>Same Day Availability</h3>
              <p>I'm a paragraph. Click here to add your own text and edit me. It's easy.</p>
            </div>
          </div>
          <div className="point">
            <span className="icon">✦</span>
            <div>
              <h3>Outstanding Support</h3>
              <p>You can call us at any time for your work-related issues.</p>
            </div>
          </div>
          <div className="point">
            <span className="icon">✦</span>
            <div>
              <h3>Materials at Best Price</h3>
              <p>We directly partner with companies that provide you standard materials at their best price.</p>
            </div>
          </div>
        </div>
        <button className="cta-button">Get to Know Us</button>
      </div>
    </div>
  );
};

export default Choose;
