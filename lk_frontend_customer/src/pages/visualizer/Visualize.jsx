import React, { useState, useEffect } from 'react';
import ModelViewer from '../../components/3d/ModelViewer';
import { modelsAPI } from '../../services/modelsApi';
import Loading from '../../components/common/Loading';
import './Visualize.css';

function Visualize() {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Load models from backend
    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        try {
            setLoading(true);
            const response = await modelsAPI.getModels();

            // Process models to ensure proper file URLs
            const processedModels = response.data.map(model => ({
                ...model,
                file_url: model.file_url.startsWith('http')
                    ? model.file_url
                    : `http://localhost:8000${model.file_url}`
            }));

            setModels(processedModels);
            if (processedModels.length > 0) {
                setSelectedModel(processedModels[0]);
            }
        } catch (err) {
            console.error('Error loading models:', err);
            setError('Failed to load models');
            // For development, use local model
            setSelectedModel({
                id: 1,
                name: 'Space Ship',
                file_url: '/assets/model.glb'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleModelSelect = (model) => {
        setSelectedModel(model);
    };

    const refreshModels = async () => {
        await loadModels();
    };

    const handleDeleteModel = async (modelId, event) => {
        event.stopPropagation(); // Prevent model selection when clicking delete

        if (!confirm('Are you sure you want to delete this model?')) {
            return;
        }

        try {
            await modelsAPI.deleteModel(modelId);
            const updatedModels = models.filter(model => model.id !== modelId);
            setModels(updatedModels);

            // If the deleted model was selected, select another one
            if (selectedModel?.id === modelId) {
                setSelectedModel(updatedModels.length > 0 ? updatedModels[0] : null);
            }
        } catch (err) {
            console.error('Error deleting model:', err);
            setError('Failed to delete model');
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validExtensions = ['.glb', '.gltf'];
        const hasValidExtension = validExtensions.some(ext =>
            file.name.toLowerCase().endsWith(ext)
        );

        if (!hasValidExtension) {
            setError('Please upload a GLB or GLTF file');
            return;
        }

        // Validate file size (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            setError('File size must be less than 50MB');
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name.split('.')[0]); // Remove extension from name
        formData.append('description', `Uploaded GLB/GLTF model: ${file.name}`);

        try {
            console.log('Uploading file:', file.name, 'Size:', file.size);
            const response = await modelsAPI.uploadModel(formData);
            console.log('Upload successful:', response.data);

            // Process the uploaded model to ensure proper file URL
            const uploadedModel = {
                ...response.data,
                file_url: response.data.file_url.startsWith('http')
                    ? response.data.file_url
                    : `http://localhost:8000${response.data.file_url}`
            };

            setModels([...models, uploadedModel]);
            setSelectedModel(uploadedModel);

            // Clear the file input
            event.target.value = '';

        } catch (err) {
            console.error('Error uploading model:', err);
            if (err.response) {
                console.error('Response data:', err.response.data);
                console.error('Response status:', err.response.status);
                setError(`Upload failed: ${err.response.data?.detail || err.response.data?.error || 'Server error'}`);
            } else if (err.request) {
                setError('Upload failed: No response from server. Check if backend is running.');
            } else {
                setError(`Upload failed: ${err.message}`);
            }
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <Loading message="Loading 3D models..." size="large" fullPage />;
    }

    return (
        <div className="visualizer-page">
            <div className="app">
                <header className="app-header">
                    <h1>🎨 Visualizer</h1>
                    <p>Interactive GLB/GLTF Model Viewer</p>
                </header>

                <div className="app-content">
                    <aside className="sidebar">
                        <div className="upload-section">
                            <h3>Upload Model</h3>
                            <div className="file-input-wrapper">
                                <input
                                    type="file"
                                    accept=".glb,.gltf"
                                    onChange={handleFileUpload}
                                    className="file-input"
                                    disabled={uploading}
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="file-input-button">
                                    <span>📁</span>
                                    Choose GLB/GLTF File
                                </label>
                            </div>
                            {uploading && (
                                <div className="upload-progress">
                                    <Loading message="Uploading model..." size="small" />
                                </div>
                            )}
                            <div className="upload-info">
                                <small>Supports GLB and GLTF files (max 50MB)</small>
                            </div>
                        </div>

                        <div className="models-list">
                            <div className="models-header">
                                <h3>Models</h3>
                                <button
                                    onClick={refreshModels}
                                    className="refresh-button"
                                    disabled={loading}
                                >
                                    🔄
                                </button>
                            </div>
                            {models.length === 0 && !selectedModel ? (
                                <p>No models available</p>
                            ) : (
                                <>
                                    {selectedModel && models.length === 0 && (
                                        <div
                                            className={`model-item active`}
                                            onClick={() => handleModelSelect(selectedModel)}
                                        >
                                            <span className="model-name">{selectedModel.name}</span>
                                        </div>
                                    )}
                                    {models.map((model) => (
                                        <div
                                            key={model.id}
                                            className={`model-item ${selectedModel?.id === model.id ? 'active' : ''}`}
                                            onClick={() => handleModelSelect(model)}
                                        >
                                            <span className="model-name">{model.name}</span>
                                            <button
                                                className="delete-button"
                                                onClick={(e) => handleDeleteModel(model.id, e)}
                                                title="Delete model"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}
                    </aside>

                    <main className="main-content">
                        {selectedModel ? (
                            <div className="viewer-container">
                                <div className="viewer-header">
                                    <h2>{selectedModel.name}</h2>
                                    <div className="viewer-info">
                                        <span>Use mouse to interact with the 3D model</span>
                                    </div>
                                </div>
                                <ModelViewer
                                    modelUrl={selectedModel.file_url}
                                    width="100%"
                                    height="85vh"
                                />
                            </div>
                        ) : (
                            <div className="no-model">
                                <h2>No Model Selected</h2>
                                <p>Please select a model from the sidebar or upload a new one.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default Visualize;
