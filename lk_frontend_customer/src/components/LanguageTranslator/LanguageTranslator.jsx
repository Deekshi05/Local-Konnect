import React, { useState } from 'react';
import { FaGlobe, FaSync } from 'react-icons/fa';
import './LanguageTranslator.css';

const LanguageTranslator = ({ 
  originalText, 
  translatedText, 
  originalLanguage = 'hi', 
  targetLanguage = 'en',
  showToggle = true 
}) => {
  const [showOriginal, setShowOriginal] = useState(false);

  const languages = {
    'en': { name: 'English', flag: '🇺🇸' },
    'hi': { name: 'हिंदी', flag: '🇮🇳' },
    'mr': { name: 'मराठी', flag: '🇮🇳' },
    'gu': { name: 'ગુજરાતી', flag: '🇮🇳' },
    'ta': { name: 'தமிழ்', flag: '🇮🇳' },
    'te': { name: 'తెలుగు', flag: '🇮🇳' },
    'kn': { name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    'bn': { name: 'বাংলা', flag: '🇮🇳' }
  };

  const getLanguageInfo = (code) => languages[code] || { name: code, flag: '🌐' };

  return (
    <div className="language-translator">
      <div className="translator-header">
        <div className="language-indicator">
          <FaGlobe className="globe-icon" />
          <span className="language-info">
            {showOriginal 
              ? `${getLanguageInfo(originalLanguage).flag} ${getLanguageInfo(originalLanguage).name}`
              : `${getLanguageInfo(targetLanguage).flag} ${getLanguageInfo(targetLanguage).name}`
            }
          </span>
        </div>
        
        {showToggle && (
          <button 
            className="language-toggle"
            onClick={() => setShowOriginal(!showOriginal)}
            title={showOriginal ? `Switch to ${getLanguageInfo(targetLanguage).name}` : `View in ${getLanguageInfo(originalLanguage).name}`}
          >
            <FaSync className={`sync-icon ${showOriginal ? 'rotated' : ''}`} />
            {showOriginal ? 'Show English' : 'View Original'}
          </button>
        )}
      </div>
      
      <div className="translator-content">
        <div className={`text-content ${showOriginal ? 'original' : 'translated'}`}>
          {showOriginal ? originalText : translatedText}
        </div>
        
        {!showOriginal && originalText && (
          <div className="translation-note">
            <small>
              {getLanguageInfo(originalLanguage).flag} Translated from {getLanguageInfo(originalLanguage).name}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

// Usage examples:
// <LanguageTranslator 
//   originalText="मुझे प्लंबर चाहिए, नल टूट गया है"
//   translatedText="I need a plumber, the tap is broken"
//   originalLanguage="hi"
//   targetLanguage="en"
// />

export default LanguageTranslator;
