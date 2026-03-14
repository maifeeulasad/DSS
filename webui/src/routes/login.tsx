// Route: /login
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import './login.css';
import { useState } from 'react';
import { Alert, Button, Input } from 'antd';
import { DSSApiClient } from '../services/dssApi';

enum LoginMode {
  SIGN_IN = 'sign-in',
  SIGN_UP = 'sign-up',
}

export const Login = () => {
  const [mode, setMode] = useState<LoginMode>(LoginMode.SIGN_IN);
  const navigate = useNavigate();

  // Sign-in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);

  // Sign-up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpInstitute, setSignUpInstitute] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    setSignInLoading(true);
    try {
      await DSSApiClient.login(signInEmail, signInPassword);
      navigate({ to: '/analysis' });
    } catch (err) {
      setSignInError((err as Error).message);
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');
    setSignUpSuccess('');
    setSignUpLoading(true);
    try {
      await DSSApiClient.register({
        name: signUpName,
        email: signUpEmail,
        institute: signUpInstitute,
        password: signUpPassword,
      });
      setSignUpSuccess('Account created! You can now sign in.');
      setMode(LoginMode.SIGN_IN);
    } catch (err) {
      setSignUpError((err as Error).message);
    } finally {
      setSignUpLoading(false);
    }
  };

  const switchToSignUp = () => {
    setSignUpError('');
    setSignUpSuccess('');
    setMode(LoginMode.SIGN_UP);
  };

  const switchToSignIn = () => {
    setSignInError('');
    setMode(LoginMode.SIGN_IN);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo/Brand */}
        <div className="login-header">
          <div className="login-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="22" fill="url(#logo-gradient)" />
              <path d="M16 24C16 20 19 16 24 16C29 16 32 20 32 24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M20 28C20 31 22.5 34 26 34C29.5 34 32 31 32 28" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="24" cy="24" r="3" fill="white"/>
              <defs>
                <linearGradient id="logo-gradient" x1="2" y1="2" x2="46" y2="46" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6"/>
                  <stop offset="1" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="login-title">DSS</h1>
          <p className="login-subtitle">DNA Sequence Similarities</p>
        </div>

        {/* Desktop: Toggle tabs */}
        <div className="login-tabs">
          <button 
            className={`login-tab ${mode === LoginMode.SIGN_IN ? 'active' : ''}`}
            onClick={switchToSignIn}
          >
            Sign In
          </button>
          <button 
            className={`login-tab ${mode === LoginMode.SIGN_UP ? 'active' : ''}`}
            onClick={switchToSignUp}
          >
            Sign Up
          </button>
        </div>

        {/* Form Container with slide animation */}
        <div className="login-form-container">
          {/* Sign In Form */}
          <div className={`login-form-wrapper signin-form ${mode === LoginMode.SIGN_UP ? 'hidden' : ''}`}>
            <form onSubmit={handleSignIn} className="login-form">
              <h2>Welcome Back</h2>
              <p className="login-desc">Sign in to access your account</p>
              
              {signUpSuccess && (
                <Alert type="success" message={signUpSuccess} showIcon style={{ marginBottom: 16 }} />
              )}
              {signInError && (
                <Alert type="error" message={signInError} showIcon style={{ marginBottom: 16 }} />
              )}
              
              <div className="login-field">
                <label>Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  autoComplete="email"
                  size="large"
                />
              </div>
              
              <div className="login-field">
                <label>Password</label>
                <Input.Password
                  placeholder="Enter your password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  size="large"
                />
              </div>
              
              <Button 
                htmlType="submit" 
                loading={signInLoading} 
                block 
                className="login-submit"
                size="large"
              >
                Sign In
              </Button>

              <p className="login-switch">
                Don't have an account?{' '}
                <button type="button" onClick={switchToSignUp}>Sign Up</button>
              </p>
            </form>
          </div>

          {/* Sign Up Form */}
          <div className={`login-form-wrapper signup-form ${mode === LoginMode.SIGN_UP ? 'visible' : ''}`}>
            <form onSubmit={handleSignUp} className="login-form">
              <h2>Create Account</h2>
              <p className="login-desc">Join us for DNA sequence analysis</p>
              
              {signUpError && (
                <Alert type="error" message={signUpError} showIcon style={{ marginBottom: 16 }} />
              )}
              
              <div className="login-field">
                <label>Name</label>
                <Input
                  placeholder="Enter your name"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  required
                  autoComplete="name"
                  size="large"
                />
              </div>
              
              <div className="login-field">
                <label>Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                  autoComplete="email"
                  size="large"
                />
              </div>
              
              <div className="login-field">
                <label>Institute / Organisation</label>
                <Input
                  placeholder="Enter your institute"
                  value={signUpInstitute}
                  onChange={(e) => setSignUpInstitute(e.target.value)}
                  autoComplete="organization"
                  size="large"
                />
              </div>
              
              <div className="login-field">
                <label>Password</label>
                <Input.Password
                  placeholder="Create a password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  size="large"
                />
              </div>
              
              <Button 
                htmlType="submit" 
                loading={signUpLoading} 
                block 
                className="login-submit"
                size="large"
              >
                Create Account
              </Button>

              <p className="login-switch">
                Already have an account?{' '}
                <button type="button" onClick={switchToSignIn}>Sign In</button>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="login-footer">
        <p>&copy; {new Date().getFullYear()} DSS - DNA Sequence Similarities</p>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/login')({ component: Login });
