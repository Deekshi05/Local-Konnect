import React from 'react';
import './Loading.css';

const Loading = ({ 
    message = "Loading...", 
    size = "medium", 
    overlay = false,
    fullPage = false 
}) => {
    const containerClass = `loading-container ${fullPage ? 'full-page' : ''} ${overlay ? 'overlay' : ''}`;
    const spinnerClass = `loading-spinner ${size}`;

    return (
        <div className={containerClass}>
            <div className="loading-content">
                <div className={spinnerClass}>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                {message && <p className="loading-message">{message}</p>}
            </div>
        </div>
    );
};

export default Loading;
