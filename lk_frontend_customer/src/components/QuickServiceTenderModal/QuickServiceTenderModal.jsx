import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaKeyboard, FaGlobe, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import api from '../../api';
import './QuickServiceTenderModal.css';

const QuickServiceTenderModal = ({ isOpen, onClose, onSubmitSuccess }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [inputMethod, setInputMethod] = useState('voice'); // 'voice' or 'text'
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedData, setDetectedData] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [translationNote, setTranslationNote] = useState('');
  const [step, setStep] = useState(1); // 1: Input, 2: Review, 3: Success

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const languages = [
    { code: 'auto', name: 'Auto-detect', flag: '🌐' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇮🇳' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadServices();
      setStep(1);
      setDetectedData(null);
      setTextInput('');
      setAudioBlob(null);
      setTranslationNote('');
    }
  }, [isOpen]);

  const loadServices = async () => {
    try {
      const response = await api.get('/api/services/');
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceInput = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice_query.wav');
      formData.append('language', selectedLanguage);

      const response = await api.post('/api/trust-network/parse-voice-query/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      handleProcessedData(response.data);
    } catch (error) {
      console.error('Error processing voice input:', error);
      alert('Error processing voice input. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processTextInput = async () => {
    if (!textInput.trim()) return;

    setIsProcessing(true);
    try {
      const response = await api.post('/api/trust-network/parse-voice-query/', {
        text_query: textInput,
        language: selectedLanguage
      });

      handleProcessedData(response.data);
    } catch (error) {
      console.error('Error processing text input:', error);
      alert('Error processing input. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessedData = (data) => {
    setDetectedData(data.suggested_quick_job);
    
    // Show translation note if input was not in English
    if (data.detected_language && data.detected_language !== 'en') {
      const langName = languages.find(l => l.code === data.detected_language)?.name || 'your language';
      setTranslationNote(`आपका ${langName} में दिया गया विवरण अंग्रेजी में अनुवादित करके पोस्ट किया जाएगा।`);
    }
    
    setStep(2);
  };

  const submitQuickTender = async () => {
    if (!detectedData) return;

    setIsProcessing(true);
    try {
      const tenderData = {
        title: detectedData.title,
        description: detectedData.description,
        location: detectedData.location,
        urgency: detectedData.urgency || 'MEDIUM',
        budget_suggestion: detectedData.budget_suggestion,
        service: detectedData.service_id,
        raw_query: inputMethod === 'voice' ? 'Voice input' : textInput,
        original_language: detectedData.detected_language
      };

      const response = await api.post('/api/trust-network/quick-jobs/', tenderData);
      
      setStep(3);
      setTimeout(() => {
        onSubmitSuccess && onSubmitSuccess(response.data);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting quick tender:', error);
      alert('Error submitting tender. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setDetectedData(null);
    setTextInput('');
    setAudioBlob(null);
    setTranslationNote('');
    setIsRecording(false);
    setIsProcessing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="quick-tender-modal">
        <div className="modal-header">
          <h2>🚀 Quick Service Tender (Community)</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {step === 1 && (
          <div className="input-step">
            <div className="language-selector">
              <FaGlobe className="globe-icon" />
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="language-dropdown"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-method-tabs">
              <button 
                className={`tab-btn ${inputMethod === 'voice' ? 'active' : ''}`}
                onClick={() => setInputMethod('voice')}
              >
                <FaMicrophone /> Voice
              </button>
              <button 
                className={`tab-btn ${inputMethod === 'text' ? 'active' : ''}`}
                onClick={() => setInputMethod('text')}
              >
                <FaKeyboard /> Text
              </button>
            </div>

            {inputMethod === 'voice' ? (
              <div className="voice-input-section">
                <div className="voice-instructions">
                  <p>🎤 Describe your service need in any language</p>
                  <p className="example">Example: "मुझे प्लंबर चाहिए, नल टूट गया है" or "Need electrician urgently"</p>
                </div>
                
                <div className="voice-controls">
                  {!isRecording ? (
                    <button 
                      className="record-btn"
                      onClick={startRecording}
                      disabled={isProcessing}
                    >
                      <FaMicrophone />
                      Start Recording
                    </button>
                  ) : (
                    <button 
                      className="stop-btn"
                      onClick={stopRecording}
                    >
                      <FaStop />
                      Stop Recording
                    </button>
                  )}
                </div>

                {audioBlob && !isRecording && (
                  <div className="audio-preview">
                    <p>✓ Recording captured</p>
                    <button 
                      className="process-btn"
                      onClick={processVoiceInput}
                      disabled={isProcessing}
                    >
                      {isProcessing ? <FaSpinner className="spinning" /> : <FaCheck />}
                      Process Voice Input
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-input-section">
                <div className="text-instructions">
                  <p>✍️ Type your service need in any language</p>
                  <p className="example">Example: "मुझे प्लंबर चाहिए, नल टूट गया है" or "Need electrician urgently"</p>
                </div>
                
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Describe what service you need..."
                  className="text-input"
                  rows="4"
                />

                <button 
                  className="process-btn"
                  onClick={processTextInput}
                  disabled={isProcessing || !textInput.trim()}
                >
                  {isProcessing ? <FaSpinner className="spinning" /> : <FaCheck />}
                  Process Text Input
                </button>
              </div>
            )}

            {isProcessing && (
              <div className="processing-indicator">
                <FaSpinner className="spinning" />
                <p>Processing and detecting service type...</p>
              </div>
            )}
          </div>
        )}

        {step === 2 && detectedData && (
          <div className="review-step">
            {translationNote && (
              <div className="translation-note">
                <FaGlobe />
                <p>{translationNote}</p>
              </div>
            )}

            <h3>📋 Review Detected Information</h3>
            
            <div className="detected-info">
              <div className="info-card">
                <label>Service Type:</label>
                <p>{detectedData.service_name}</p>
              </div>
              
              <div className="info-card">
                <label>Title:</label>
                <p>{detectedData.title}</p>
              </div>
              
              <div className="info-card">
                <label>Description:</label>
                <p>{detectedData.description}</p>
              </div>
              
              <div className="info-card">
                <label>Location:</label>
                <p>{detectedData.location}</p>
              </div>
              
              <div className="info-card">
                <label>Urgency:</label>
                <span className={`urgency-badge urgency-${detectedData.urgency?.toLowerCase()}`}>
                  {detectedData.urgency}
                </span>
              </div>
              
              {detectedData.budget_suggestion && (
                <div className="info-card">
                  <label>Suggested Budget:</label>
                  <p>₹{detectedData.budget_suggestion}</p>
                </div>
              )}
            </div>

            <div className="review-actions">
              <button className="back-btn" onClick={resetModal}>
                ← Back to Edit
              </button>
              <button 
                className="submit-btn"
                onClick={submitQuickTender}
                disabled={isProcessing}
              >
                {isProcessing ? <FaSpinner className="spinning" /> : <FaCheck />}
                Post Quick Tender
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="success-step">
            <div className="success-animation">
              <FaCheck className="success-icon" />
              <h3>✅ Quick Tender Posted Successfully!</h3>
              <p>Your service request has been posted to the community.</p>
              <p>Contractors will see it and can express interest with their pricing.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickServiceTenderModal;
