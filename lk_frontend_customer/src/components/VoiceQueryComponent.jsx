import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaSpinner, FaComment, FaLightbulb, FaPlus, FaUsers } from 'react-icons/fa';
import api from '../api';
import './VoiceQueryComponent.css';

const VoiceQueryComponent = ({ onJobDataGenerated, services = [] }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  const [serviceSuggestions, setServiceSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [listeningTimeout, setListeningTimeout] = useState(null);
  const [browserSupport, setBrowserSupport] = useState({
    speechRecognition: false,
    speechSynthesis: false,
    browser: 'unknown'
  });

  // Sample queries for demo/testing
  const sampleQueries = [
    "AC repair urgently needed",
    "Need plumber for water leakage",
    "Ghar ki safai karvani hai",
    "Electrician chahiye light ka kaam",
    "Painting work urgent me",
    "AC theek karne wala chahiye turant"
  ];

  useEffect(() => {
    // Check browser support and initialize speech recognition
    const checkBrowserSupport = () => {
      const userAgent = navigator.userAgent;
      let browser = 'unknown';
      
      if (userAgent.includes('Chrome')) browser = 'chrome';
      else if (userAgent.includes('Firefox')) browser = 'firefox';
      else if (userAgent.includes('Safari')) browser = 'safari';
      else if (userAgent.includes('Edge')) browser = 'edge';
      
      const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      const speechSynthesisSupported = 'speechSynthesis' in window;
      
      setBrowserSupport({
        speechRecognition: speechRecognitionSupported,
        speechSynthesis: speechSynthesisSupported,
        browser
      });
      
      return speechRecognitionSupported;
    };
    
    if (checkBrowserSupport()) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          setError('Speech recognition is not available in this browser.');
          return;
        }

        const recognitionInstance = new SpeechRecognition();
        
        // Configure recognition with safer defaults
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'hi-IN,en-IN'; // Hindi and English for India
        recognitionInstance.maxAlternatives = 1;
        
        recognitionInstance.onresult = (event) => {
          try {
            if (event.results && event.results.length > 0) {
              const speechResult = event.results[0][0].transcript;
              if (speechResult && speechResult.trim().length > 0) {
                setTranscript(speechResult);
                handleVoiceQuery(speechResult);
              } else {
                setError('No speech detected. Please try speaking more clearly.');
                setIsListening(false);
              }
            }
          } catch (error) {
            console.error('Error processing speech result:', error);
            setError('Failed to process speech. Please try again.');
            setIsListening(false);
          }
        };
        
        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event);
          let errorMessage = `Speech recognition error: ${event.error}`;
          
          try {
            switch (event.error) {
              case 'no-speech':
                errorMessage = 'No speech detected. Please try speaking clearly.';
                break;
              case 'audio-capture':
                errorMessage = 'Microphone not accessible. Please check permissions.';
                break;
              case 'not-allowed':
                errorMessage = 'Microphone permission denied. Please allow microphone access and try again.';
                break;
              case 'network':
                errorMessage = 'Network error. Please check your internet connection.';
                break;
              case 'service-not-allowed':
                errorMessage = 'Speech service not allowed. Try using HTTPS or Chrome/Edge browser.';
                break;
              case 'aborted':
                errorMessage = 'Speech recognition was stopped.';
                break;
              case 'language-not-supported':
                errorMessage = 'Language not supported. Please try switching to English or Hindi.';
                break;
              default:
                errorMessage = `Speech recognition failed: ${event.error}. Please try again or use text input.`;
            }
          } catch (err) {
            errorMessage = 'Speech recognition encountered an error. Please try again.';
          }
          
          setError(errorMessage);
          setIsListening(false);
          
          // Clear timeout on error
          if (listeningTimeout) {
            clearTimeout(listeningTimeout);
            setListeningTimeout(null);
          }
        };
        
        recognitionInstance.onend = () => {
          setIsListening(false);
          
          // Clear timeout when recognition ends
          if (listeningTimeout) {
            clearTimeout(listeningTimeout);
            setListeningTimeout(null);
          }
        };

        recognitionInstance.onstart = () => {
          setError(''); // Clear any previous errors when starting
        };
        
        setRecognition(recognitionInstance);
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        setError('Failed to initialize speech recognition. Please try refreshing the page or use text input.');
      }
    } else {
      setError('Voice recognition not supported in this browser. Please use Chrome, Edge, or try typing your request.');
    }

    // Cleanup function
    return () => {
      try {
        if (listeningTimeout) {
          clearTimeout(listeningTimeout);
        }
        if (recognition && isListening) {
          recognition.stop();
        }
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    };
  }, []); // Remove listeningTimeout dependency to prevent infinite re-renders

  const startListening = () => {
    if (!recognition) {
      setError(`Voice recognition not supported in ${browserSupport.browser === 'firefox' ? 'Firefox' : 'this browser'}. Please use Chrome or Edge, or try typing your request below.`);
      return;
    }

    // Check if already listening
    if (isListening) {
      stopListening();
      return;
    }

    setError('');
    setTranscript('');
    setParsedResult(null);
    setIsListening(true);
    
    // Set timeout for maximum listening duration (30 seconds)
    const timeout = setTimeout(() => {
      try {
        stopListening();
        setError('Listening timeout. Please try again and speak clearly within 30 seconds.');
      } catch (error) {
        console.error('Error in listening timeout:', error);
      }
    }, 30000);
    setListeningTimeout(timeout);
    
    // Request microphone permission explicitly with better error handling
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          try {
            if (recognition && !isProcessing) {
              recognition.start();
            } else {
              throw new Error('Recognition not available or processing');
            }
          } catch (err) {
            console.error('Speech recognition start error:', err);
            let errorMsg = 'Voice recognition failed to start.';
            
            if (err.name === 'InvalidStateError') {
              errorMsg = 'Voice recognition is already running. Please wait a moment and try again.';
            } else if (err.name === 'NotAllowedError') {
              errorMsg = 'Microphone permission denied. Please allow microphone access.';
            } else if (err.message.includes('already started')) {
              errorMsg = 'Voice recognition is already active. Please wait and try again.';
            }
            
            setError(errorMsg);
            setIsListening(false);
            clearTimeout(timeout);
            setListeningTimeout(null);
          }
        })
        .catch((err) => {
          console.error('Microphone access error:', err);
          let errorMsg = 'Microphone permission required.';
          
          if (err.name === 'NotAllowedError') {
            errorMsg = 'Microphone access denied. Please allow microphone access in your browser settings and try again.';
          } else if (err.name === 'NotFoundError') {
            errorMsg = 'No microphone found. Please connect a microphone and try again.';
          } else if (err.name === 'NotReadableError') {
            errorMsg = 'Microphone is already in use by another application. Please close other apps and try again.';
          } else if (err.name === 'OverconstrainedError') {
            errorMsg = 'Microphone constraints not satisfied. Please try again.';
          }
          
          setError(errorMsg);
          setIsListening(false);
          clearTimeout(timeout);
          setListeningTimeout(null);
        });
    } else {
      setError('Microphone access not supported in this browser. Please use a modern browser like Chrome or Edge.');
      setIsListening(false);
      clearTimeout(timeout);
      setListeningTimeout(null);
    }
  };

  const stopListening = () => {
    try {
      if (recognition && isListening) {
        recognition.stop();
      }
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
    
    setIsListening(false);
    
    // Clear listening timeout
    if (listeningTimeout) {
      clearTimeout(listeningTimeout);
      setListeningTimeout(null);
    }
  };

  const handleVoiceQuery = async (query) => {
    if (!query || query.trim().length === 0) {
      setError('No speech detected. Please speak clearly and try again.');
      setIsProcessing(false);
      return;
    }

    // Basic input validation
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setError('Please provide a longer description of the service you need.');
      setIsProcessing(false);
      return;
    }

    if (trimmedQuery.length > 1000) {
      setError('Description is too long. Please keep it under 1000 characters.');
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    setError('');
    
    try {
      // Parse the voice query using Gemini with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await api.post('/api/trust-network/parse-voice-query/', {
        query: trimmedQuery
      }, {
        signal: controller.signal,
        timeout: 15000
      });
      
      clearTimeout(timeoutId);
      
      if (!response || !response.data) {
        throw new Error('No response received from server');
      }
      
      if (response.data.error) {
        setError(response.data.error);
        return;
      }
      
      setParsedResult(response.data);
      
      // Get service suggestions with validation
      if (response.data.service_suggestions && Array.isArray(response.data.service_suggestions)) {
        setServiceSuggestions(response.data.service_suggestions);
      }
      
      // Validate the generated job data more thoroughly
      const suggestedJob = response.data.suggested_quick_job;
      if (!suggestedJob) {
        setError('Unable to understand your request. Please try rephrasing or be more specific about the service you need.');
        return;
      }
      
      if (!suggestedJob.title || suggestedJob.title.trim().length === 0) {
        setError('Could not generate a proper job title. Please provide more details about the service you need.');
        return;
      }
      
      if (!suggestedJob.description || suggestedJob.description.trim().length === 0) {
        setError('Could not generate a proper job description. Please provide more details about what you need done.');
        return;
      }
      
      // Check if service is available with better validation
      if (services.length > 0 && !suggestedJob.service_id && !suggestedJob.service_name) {
        setError('Service not recognized. Please try again with a specific service like "plumber", "electrician", "cleaner", etc.');
        return;
      }
      
      // Pass the generated job data to parent component
      if (onJobDataGenerated && typeof onJobDataGenerated === 'function') {
        try {
          onJobDataGenerated(suggestedJob);
        } catch (error) {
          console.error('Error calling onJobDataGenerated:', error);
          setError('Generated job data successfully but failed to process. Please try creating the job manually.');
        }
      }
      
    } catch (error) {
      console.error('Error processing voice query:', error);
      
      let errorMessage = 'Failed to process your request. ';
      
      if (error.name === 'AbortError') {
        errorMessage += 'Request timed out. Please try again with a shorter request.';
      } else if (error.response?.status === 400) {
        errorMessage += error.response.data?.error || 'Please check your input and try again.';
      } else if (error.response?.status === 429) {
        errorMessage += 'Too many requests. Please wait a moment and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage += 'Server error. Please try again later.';
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network')) {
        errorMessage += 'Network error. Please check your connection and try again.';
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage += 'Connection timeout. Please check your internet and try again.';
      } else {
        errorMessage += 'Please try again or use the text input below.';
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSampleQuery = (query) => {
    if (query && query.trim().length > 0) {
      setTranscript(query);
      handleVoiceQuery(query);
    }
  };

  const handleTextSubmit = () => {
    const trimmedText = transcript.trim();
    
    if (!trimmedText) {
      setError('Please enter your service request in the text field.');
      return;
    }
    
    if (trimmedText.length < 3) {
      setError('Please provide a more detailed description of the service you need.');
      return;
    }
    
    if (trimmedText.length > 500) {
      setError('Description is too long. Please keep it under 500 characters.');
      return;
    }
    
    handleVoiceQuery(trimmedText);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmedText = transcript.trim();
      if (trimmedText && trimmedText.length >= 3) {
        handleVoiceQuery(trimmedText);
      }
    }
  };

  const playText = (text) => {
    if (!text || text.trim().length === 0) {
      return;
    }
    
    try {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
        };
        
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error playing text:', error);
    }
  };

  const getConfidenceClass = (confidence) => {
    if (confidence >= 0.8) return 'confidence-high';
    if (confidence >= 0.6) return 'confidence-medium';
    return 'confidence-low';
  };

  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case 'URGENT': return 'urgency-urgent';
      case 'HIGH': return 'urgency-high';
      case 'MEDIUM': return 'urgency-medium';
      case 'LOW': return 'urgency-low';
      default: return 'urgency-default';
    }
  };

  return (
    <div className="voice-query-container">
      <div className="voice-header">
        <h2 className="voice-title">
          <FaComment />
          AI Voice Assistant
        </h2>
        <p className="voice-subtitle">
          Speak or type your service needs in Hindi, English, or Hinglish. 
          Our AI will understand and create a job posting for you.
        </p>
        
        {/* Browser Compatibility Notice */}
        {!browserSupport.speechRecognition && (
          <div className="browser-notice">
            <div className="notice-icon">⚠️</div>
            <div className="notice-content">
              <h4>Voice Input Not Available</h4>
              <p>
                Voice recognition is not supported in {browserSupport.browser === 'firefox' ? 'Firefox' : 'this browser'}. 
                For voice input, please use <strong>Chrome</strong> or <strong>Edge</strong>. 
                You can still type your request below!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Voice Input Section */}
      <div className="voice-input-section">
        <div className="voice-button-container">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`voice-button ${isListening ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
          >
            {isProcessing ? (
              <FaSpinner />
            ) : isListening ? (
              <FaMicrophoneSlash />
            ) : (
              <FaMicrophone />
            )}
          </button>
          
          {isListening && (
            <div className="recording-waves">
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
            </div>
          )}
          
          <div className="voice-status">
            {isProcessing ? (
              <span className="processing-status">
                <FaSpinner className="loading-spinner" />
                Processing with AI...
              </span>
            ) : isListening ? (
              <span className="recording-status">
                🔴 Listening... Speak your service request
              </span>
            ) : (
              <span className="ready-status">
                {recognition ? 'Click to start voice input' : 'Voice input not available'}
              </span>
            )}
          </div>
        </div>

        <div className="text-input-section">
          <label className="input-label">Or type your request:</label>
          <div className="text-input-container">
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your request... (e.g., 'AC theek karne wala chahiye')"
              className="text-input"
            />
            <button
              onClick={handleTextSubmit}
              disabled={isProcessing || !transcript.trim()}
              className="submit-text-button"
            >
              {isProcessing ? <FaSpinner className="loading-spinner" /> : <FaComment />}
              Process
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
      </div>

      {/* Language Support */}
      <div className="language-support">
        <span className="language-tag active">English</span>
        <span className="language-tag active">हिंदी</span>
        <span className="language-tag active">Hinglish</span>
      </div>

      {/* Sample Queries */}
      <div className="sample-queries">
        <h3 className="sample-title">
          <FaLightbulb />
          Try these examples:
        </h3>
        <div className="sample-grid">
          {sampleQueries.map((query, index) => (
            <div key={index} className="sample-query-item">
              <button
                onClick={() => handleSampleQuery(query)}
                className="sample-query-button"
              >
                <span className="sample-text">"{query}"</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playText(query);
                }}
                className="play-button"
              >
                <FaVolumeUp />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Parsed Results */}
      {parsedResult && (
        <div className="query-results">
          <div className="results-header">
            <h3 className="results-title">AI Understanding Results</h3>
            <span className={`results-count ${getConfidenceClass(parsedResult.parsed_intent.confidence)}`}>
              {(parsedResult.parsed_intent.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>
          
          <div className="recognized-query">
            <div className="recognized-label">Recognized Query</div>
            <div className="recognized-text">{transcript}</div>
            <div className="query-analysis">
              <div className="analysis-item">
                <div className="analysis-label">Service</div>
                <div className="analysis-value">{parsedResult.parsed_intent.service_category}</div>
              </div>
              <div className="analysis-item">
                <div className="analysis-label">Language</div>
                <div className="analysis-value">{parsedResult.parsed_intent.language_detected || 'Auto'}</div>
              </div>
              <div className="analysis-item">
                <div className="analysis-label">Urgency</div>
                <div className="analysis-value">{parsedResult.suggested_quick_job.urgency}</div>
              </div>
              <div className="analysis-item">
                <div className="analysis-label">Method</div>
                <div className="analysis-value">{parsedResult.parsing_method}</div>
              </div>
            </div>
          </div>

          <div className="generated-job">
            <h4 className="job-title">Generated Job Posting:</h4>
            <div className="job-preview">
              <h5>{parsedResult.suggested_quick_job.title}</h5>
              <p>{parsedResult.suggested_quick_job.description}</p>
              <div className="job-tags">
                <span className={`urgency-tag ${getUrgencyClass(parsedResult.suggested_quick_job.urgency)}`}>
                  {parsedResult.suggested_quick_job.urgency}
                </span>
                {parsedResult.parsed_intent.keywords && (
                  <span className="keywords-tag">
                    Keywords: {parsedResult.parsed_intent.keywords.join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Service Suggestions */}
          {serviceSuggestions.length > 0 && (
            <div className="services-grid">
              <h4 className="services-title">Suggested Services:</h4>
              {serviceSuggestions.map((service, index) => (
                <div key={index} className="service-card">
                  <div className="service-header">
                    <h5 className="service-name">{service.name}</h5>
                    <div className="service-icon">🔧</div>
                  </div>
                  <p className="service-description">{service.description}</p>
                  <div className="service-stats">
                    <div className="stat-group">
                      <FaUsers />
                      <span>Available</span>
                    </div>
                    <button className="create-job-button">
                      <FaPlus />
                      Create Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State when no results */}
      {!parsedResult && !isProcessing && !isListening && (
        <div className="empty-results">
          <div className="empty-icon">🎤</div>
          <h3 className="empty-title">Ready to help you find services</h3>
          <p className="empty-subtitle">
            Use voice input or type your service needs. Our AI supports Hindi, English, and Hinglish to make it easy for you.
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceQueryComponent;
