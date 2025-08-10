import { useState } from 'react';
import axios from 'axios';
import '../styles/Forgot.css';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: verification code, 3: new password
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:8000/api/password-reset/send-code/', { email });
      setMessage(response.data.message);
      setStep(2);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:8000/api/password-reset/verify-code/', {
        email,
        code: verificationCode
      });
      setResetToken(response.data.reset_token);
      setMessage(response.data.message);
      setStep(3);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/password-reset/reset/', {
        email,
        reset_token: resetToken,
        new_password: newPassword
      });
      setMessage(response.data.message);
      // Reset form and go back to step 1
      setTimeout(() => {
        setStep(1);
        setEmail('');
        setVerificationCode('');
        setNewPassword('');
        setConfirmPassword('');
        setResetToken('');
        setMessage('');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep(1);
    setVerificationCode('');
    setError('');
    setMessage('');
  };

  const handleBackToCode = () => {
    setStep(2);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setMessage('');
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        
        {step === 1 && (
          <form onSubmit={handleSendCode} className="forgot-form">
            <p className="form-description">
              Enter your email address and we'll send you a verification code to reset your password.
            </p>
            <div className="form-group">
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="form-input"
              />
            </div>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="forgot-form">
            <p className="form-description">
              We've sent a 6-digit verification code to your email. Please enter it below.
            </p>
            <div className="form-group">
              <input 
                type="text" 
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength="6"
                required
                className="form-input verification-code-input"
              />
            </div>
            <div className="button-group">
              <button type="button" onClick={handleBackToEmail} className="back-btn">
                Back
              </button>
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="forgot-form">
            <p className="form-description">
              Enter your new password below.
            </p>
            <div className="form-group">
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="form-input"
              />
            </div>
            <div className="button-group">
              <button type="button" onClick={handleBackToCode} className="back-btn">
                Back
              </button>
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        {message && (
          <div className="message success">
            {message}
          </div>
        )}

        {error && (
          <div className="message error">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
