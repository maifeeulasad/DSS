// Static services page route
// Route: /login (handled in src/index.tsx)

import './login.css';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { DSSApiClient } from '../services/dssApi';

enum LoginMode {
  SIGN_IN = 'sign-in',
  SIGN_UP = 'sign-up',
}

export default function Login() {
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="login-page" style={{ flex: 1 }}>
        <div className={`container ${mode === LoginMode.SIGN_UP ? 'right-panel-active' : ''}`} id="container">
          <div className="form-container sign-up-container">
            <form onSubmit={handleSignUp}>
              <h1>Create Account</h1>
              {signUpError && <span style={{ color: '#e74c3c', fontSize: '13px' }}>{signUpError}</span>}
              <input type="text" placeholder="Name" value={signUpName} onChange={(e) => setSignUpName(e.target.value)} required />
              <input type="email" placeholder="Email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required />
              <input type="text" placeholder="Institute / Organisation" value={signUpInstitute} onChange={(e) => setSignUpInstitute(e.target.value)} required />
              <input type="password" placeholder="Password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required />
              <button type="submit" disabled={signUpLoading}>{signUpLoading ? 'Signing up…' : 'Sign Up'}</button>
            </form>
          </div>
          <div className="form-container sign-in-container">
            <form onSubmit={handleSignIn}>
              <h1>Sign in</h1>
              {signUpSuccess && <span style={{ color: '#27ae60', fontSize: '13px' }}>{signUpSuccess}</span>}
              {signInError && <span style={{ color: '#e74c3c', fontSize: '13px' }}>{signInError}</span>}
              <input type="email" placeholder="Email" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} required />
              <input type="password" placeholder="Password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} required />
              <button type="submit" disabled={signInLoading}>{signInLoading ? 'Signing in…' : 'Sign In'}</button>
            </form>
          </div>
          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h1>Welcome Back!</h1>
                <p>To keep connected with us please login with your personal info</p>
                <button className="ghost" type="button" onClick={() => setMode(LoginMode.SIGN_IN)}>Sign In</button>
              </div>
              <div className="overlay-panel overlay-right">
                <h1>Hello, Friend!</h1>
                <p>Enter your personal details and start journey with us</p>
                <button className="ghost" type="button" onClick={() => setMode(LoginMode.SIGN_UP)}>Sign Up</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

