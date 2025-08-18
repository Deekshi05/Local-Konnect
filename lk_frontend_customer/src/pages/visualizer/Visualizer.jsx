import React from 'react';
import { FaCube, FaPaintBrush, FaArrowRight } from 'react-icons/fa';
import './Visualizer.css';

const Visualizer = () => {
    const handleVisualizerOpen = (type) => {
        if (type === '3d') {
            // Open 3D visualizer (could be internal route or external)
            window.open('/visualize', '_blank');
        } else if (type === 'paint') {
            // Open paint visualizer
            window.open('http://127.0.0.1:8001/', '_blank');
        }
    };

    return (
        <div className="visualizer-page">
            <div className="visualizer-header">
                <h1 className="page-title">Visualizer Tools</h1>
                <p className="page-subtitle">Choose your visualization tool to better plan your projects</p>
            </div>

            <div className="visualizer-options">
                <div className="visualizer-card" onClick={() => handleVisualizerOpen('3d')}>
                    <div className="card-icon">
                        <FaCube />
                    </div>
                    <div className="card-content">
                        <h3 className="card-title">3D Visualizer</h3>
                        <p className="card-description">
                            Create and visualize 3D models of your construction projects. 
                            Perfect for architectural planning and spatial visualization.
                        </p>
                        <div className="card-features">
                            <span className="feature">• 3D Model Creation</span>
                            <span className="feature">• Architectural Planning</span>
                            <span className="feature">• Spatial Visualization</span>
                        </div>
                    </div>
                    <div className="card-action">
                        <FaArrowRight />
                        <span>Open 3D Visualizer</span>
                    </div>
                </div>

                <div className="visualizer-card" onClick={() => handleVisualizerOpen('paint')}>
                    <div className="card-icon paint-icon">
                        <FaPaintBrush />
                    </div>
                    <div className="card-content">
                        <h3 className="card-title">Paint Visualizer</h3>
                        <p className="card-description">
                            Experiment with different paint colors and combinations for your spaces. 
                            See how different colors look in various lighting conditions.
                        </p>
                        <div className="card-features">
                            <span className="feature">• Color Selection</span>
                            <span className="feature">• Room Visualization</span>
                            <span className="feature">• Lighting Effects</span>
                        </div>
                    </div>
                    <div className="card-action">
                        <FaArrowRight />
                        <span>Open Paint Visualizer</span>
                    </div>
                </div>
            </div>

            <div className="visualizer-tips">
                <h3>Tips for Using Visualizer Tools</h3>
                <div className="tips-grid">
                    <div className="tip-item">
                        <strong>3D Visualizer:</strong> Best for structural planning and understanding spatial relationships
                    </div>
                    <div className="tip-item">
                        <strong>Paint Visualizer:</strong> Ideal for interior design decisions and color coordination
                    </div>
                    <div className="tip-item">
                        <strong>Pro Tip:</strong> Use both tools together for comprehensive project planning
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Visualizer;
