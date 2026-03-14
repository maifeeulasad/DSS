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

  return (
    <div className="login-page">
      <div className={`container ${mode === LoginMode.SIGN_UP ? 'right-panel-active' : ''}`} id="container">
        {/* Sign Up Form */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignUp}>
            <h1>Create Account</h1>
            {signUpError && (
              <Alert type="error" message={signUpError} showIcon style={{ marginBottom: 8, fontSize: 13, width: '100%' }} />
            )}
            <Input
              placeholder="Name"
              value={signUpName}
              onChange={(e) => setSignUpName(e.target.value)}
              required
              autoComplete="name"
            />
            <Input
              type="email"
              placeholder="Email"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              placeholder="Institute / Organisation"
              value={signUpInstitute}
              onChange={(e) => setSignUpInstitute(e.target.value)}
              autoComplete="organization"
            />
            <Input.Password
              placeholder="Password"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <Button htmlType="submit" loading={signUpLoading} block>
              Sign Up
            </Button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleSignIn}>
            <h1>Sign in</h1>
            {signUpSuccess && (
              <Alert type="success" message={signUpSuccess} showIcon style={{ marginBottom: 8, fontSize: 13, width: '100%' }} />
            )}
            {signInError && (
              <Alert type="error" message={signInError} showIcon style={{ marginBottom: 8, fontSize: 13, width: '100%' }} />
            )}
            <Input
              type="email"
              placeholder="Email"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input.Password
              placeholder="Password"
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Button htmlType="submit" loading={signInLoading} block>
              Sign In
            </Button>
          </form>
        </div>

        {/* Overlay Panel - Hidden on mobile */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <Button className="ghost" onClick={() => setMode(LoginMode.SIGN_IN)}>Sign In</Button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <Button className="ghost" onClick={() => setMode(LoginMode.SIGN_UP)}>Sign Up</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile toggle buttons - visible only on small screens */}
      <div className="mobile-toggle" style={{ display: 'none', marginTop: '1.5rem', textAlign: 'center' }}>
        {mode === LoginMode.SIGN_IN ? (
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <button 
              onClick={() => setMode(LoginMode.SIGN_UP)} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#60a5fa', 
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Sign Up
            </button>
          </p>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <button 
              onClick={() => setMode(LoginMode.SIGN_IN)} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#60a5fa', 
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute('/login')({ component: Login });
