import React, { Suspense, useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

// Lazy-loaded so it only renders on the client (Canvas uses window/navigator APIs)
const Canvas = React.lazy(() => import('react-webgl-fluid-play'));

const FEATURES = [
  { icon: '🧬', label: 'CGR', desc: 'Chaos Game Representation' },
  { icon: '📊', label: 'PTM', desc: 'Position-Transition Matrix' },
  { icon: '🔗', label: 'DPTM', desc: 'Double PTM Analysis' },
  { icon: '📐', label: 'TM', desc: 'Transition Matrix' },
  { icon: '🌳', label: 'Phylogenetics', desc: 'Evolutionary Tree Visualization' },
  { icon: '⚡', label: 'REST API', desc: 'Headless HTTP Analysis' },
];

const badge: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: '40px',
  padding: '5px 14px',
  color: 'rgba(255,255,255,0.88)',
  fontSize: '0.8rem',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

const btnPrimary: React.CSSProperties = {
  padding: '13px 36px',
  background: 'linear-gradient(135deg, #4fc3f7 0%, #7c4dff 100%)',
  color: '#fff',
  borderRadius: '50px',
  fontWeight: 700,
  fontSize: '1rem',
  textDecoration: 'none',
  boxShadow: '0 4px 24px rgba(79,195,247,0.35)',
  display: 'inline-block',
};

const btnSecondary: React.CSSProperties = {
  padding: '13px 36px',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  borderRadius: '50px',
  fontWeight: 600,
  fontSize: '1rem',
  textDecoration: 'none',
  border: '1px solid rgba(255,255,255,0.22)',
  display: 'inline-block',
};

export const Home = () => {
  // Canvas uses window/navigator APIs - only render after client-side mount
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  return (
    <>
      {isClient && (
        <Suspense fallback={<div style={{ position: 'fixed', inset: 0, background: '#000' }} />}>
          <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
            <Canvas initialAnimation={{ path: 'oval', options: { maxLoops: 5 } }} loadingFallback={null} />
          </div>
        </Suspense>
      )}

    {/* DSS overlay - rendered above the fluid canvas */}
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',          // let mouse events reach the fluid bg
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Glassmorphism card */}
      <div
        style={{
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: '24px',
          padding: '48px 52px',
          maxWidth: '680px',
          width: '90vw',
          textAlign: 'center',
          pointerEvents: 'auto',
          boxShadow: '0 12px 64px rgba(0,0,0,0.55)',
        }}
      >
        {/* Title */}
        <h1 style={{ color: '#fff', fontSize: '4rem', fontWeight: 900, margin: '0 0 4px', letterSpacing: '-3px', lineHeight: 1 }}>
          DSS
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: '0 0 20px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}>
          DNA Sequence Similarities
        </p>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.65, margin: '0 0 32px' }}>
          Analyze and compare DNA sequences using multiple algorithms - from Chaos Game Representation to
          Transition Matrices - with built-in phylogenetic tree visualization and a plugin-based REST API.
        </p>

        {/* Feature badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '36px' }}>
          {FEATURES.map(f => (
            <span key={f.label} style={badge}>{f.icon} {f.label} - {f.desc}</span>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/analysis" style={btnPrimary}>Start Analysis</a>
          <a href="/login" style={btnSecondary}>Login</a>
        </div>
      </div>

      {/* Subtle hint */}
      {/* <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.72rem', marginTop: '20px', pointerEvents: 'none', letterSpacing: '0.05em' }}>
        Move your mouse to interact with the fluid simulation
      </p> */}
    </div>
  </>
  );
};

export const Route = createFileRoute('/')({ component: Home });
