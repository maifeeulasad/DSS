// Static services page route
// Route: /login (handled in src/index.tsx)

import './login.css';
import { useState } from 'react';

enum LoginMode {
  SIGN_IN = 'sign-in',
  SIGN_UP = 'sign-up',
}

export default function Login() {
  const [mode, setMode] = useState<LoginMode>(LoginMode.SIGN_IN);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="login-page" style={{ flex: 1 }}>
        <div className={`container ${mode === LoginMode.SIGN_UP ? 'right-panel-active' : ''}`} id="container">
          <div className="form-container sign-up-container">
            <form onSubmit={(e) => e.preventDefault()}>
              <span>or use your email for registration</span>
              <input type="text" placeholder="Name" />
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
              <button type="button">Sign Up</button>
            </form>
          </div>
          <div className="form-container sign-in-container">
            <form onSubmit={(e) => e.preventDefault()}>
              <h1>Sign in</h1>
              <span>or use your account</span>
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
              <a href="#" onClick={(e) => e.preventDefault()}>Forgot your password?</a>
              <button type="button">Sign In</button>
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
