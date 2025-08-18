import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaSpinner, FaComment, FaLightbulb } from 'react-icons/fa';
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
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'hi-IN,en-IN'; // Hindi and English for India
      
      recognitionInstance.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
        handleVoiceQuery(speechResult);
      };
      
      recognitionInstance.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      setError('');
      setIsListening(true);
      recognition.start();
    } else {
      setError('Speech recognition not supported in this browser');
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  const handleVoiceQuery = async (query) => {
    setIsProcessing(true);
    setError('');
    
    try {
      // Parse the voice query using Gemini
      const response = await api.post('/api/trust-network/parse-voice-query/', {
        query: query
      });
      
      setParsedResult(response.data);
      
      // Get service suggestions
      if (response.data.service_suggestions) {
        setServiceSuggestions(response.data.service_suggestions);
      }
      
      // Pass the generated job data to parent component
      if (onJobDataGenerated && response.data.suggested_quick_job) {
        onJobDataGenerated(response.data.suggested_quick_job);
      }
      
    } catch (error) {
      console.error('Error parsing voice query:', error);
      setError('Failed to parse voice query. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSampleQuery = (query) => {
    setTranscript(query);
    handleVoiceQuery(query);
  };

  const handleTextInput = (e) => {
    if (e.key === 'Enter' && transcript.trim()) {
      handleVoiceQuery(transcript);
    }
  };

  const playText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      speechSynthesis.speak(utterance);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FaComment className="text-blue-600" />
          AI Voice Assistant
        </h2>
        <p className="text-gray-600">
          Speak or type your service needs in Hindi, English, or Hinglish. 
          Our AI will understand and create a job posting for you.
        </p>
      </div>

      {/* Voice Input Section */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyPress={handleTextInput}
              placeholder="Type your request or use voice input... (e.g., 'AC theek karne wala chahiye')"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            {!isListening ? (
              <button
                onClick={startListening}
                disabled={isProcessing}
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FaMicrophone size={20} />
                {recognition ? 'Listen' : 'No Mic'}
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors animate-pulse flex items-center gap-2"
              >
                <FaMicrophoneSlash size={20} />
                Stop
              </button>
            )}
            
            {transcript && (
              <button
                onClick={() => handleVoiceQuery(transcript)}
                disabled={isProcessing}
                className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? <FaSpinner size={20} className="animate-spin" /> : '🔍'}
              </button>
            )}
          </div>
        </div>

        {isListening && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Listening... Speak your service request</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 mt-2">
            {error}
          </div>
        )}
      </div>

      {/* Sample Queries */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <FaLightbulb size={16} />
          Try these examples:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {sampleQueries.map((query, index) => (
            <button
              key={index}
              onClick={() => handleSampleQuery(query)}
              className="text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 text-sm transition-colors"
            >
              <span className="text-gray-700">"{query}"</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playText(query);
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <FaVolumeUp size={14} />
              </button>
            </button>
          ))}
        </div>
      </div>

      {/* Parsed Results */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <FaSpinner size={24} className="animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-blue-700">Processing with AI...</p>
        </div>
      )}

      {parsedResult && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-3 flex items-center justify-between">
              AI Understanding Results
              <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(parsedResult.parsed_intent.confidence)}`}>
                {(parsedResult.parsed_intent.confidence * 100).toFixed(0)}% confidence
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Generated Job:</h4>
                <div className="bg-white rounded-md p-3 border">
                  <h5 className="font-medium">{parsedResult.suggested_quick_job.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{parsedResult.suggested_quick_job.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(parsedResult.suggested_quick_job.urgency)}`}>
                      {parsedResult.suggested_quick_job.urgency}
                    </span>
                    {parsedResult.parsed_intent.language_detected && (
                      <span className="text-xs text-gray-500">
                        Language: {parsedResult.parsed_intent.language_detected}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Detected Details:</h4>
                <div className="bg-white rounded-md p-3 border text-sm space-y-1">
                  <div><span className="text-gray-600">Service:</span> {parsedResult.parsed_intent.service_category}</div>
                  <div><span className="text-gray-600">Keywords:</span> {parsedResult.parsed_intent.keywords?.join(', ')}</div>
                  {parsedResult.parsed_intent.location_mentioned && (
                    <div><span className="text-gray-600">Location:</span> {parsedResult.parsed_intent.location_mentioned}</div>
                  )}
                  {parsedResult.parsed_intent.time_preference && (
                    <div><span className="text-gray-600">Time:</span> {parsedResult.parsed_intent.time_preference}</div>
                  )}
                  <div><span className="text-gray-600">Method:</span> {parsedResult.parsing_method}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Suggestions */}
          {serviceSuggestions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Suggested Services:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {serviceSuggestions.map((service, index) => (
                  <div key={index} className="bg-white rounded-md p-3 border">
                    <h5 className="font-medium text-sm">{service.name}</h5>
                    <p className="text-xs text-gray-600">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceQueryComponent;
