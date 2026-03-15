import React, { Suspense, useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from 'antd';

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

export const Home = () => {
  // Canvas uses window/navigator APIs - only render after client-side mount
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  return (
    <>
      {isClient && (
        <Suspense fallback={<div style={{ position: 'fixed', inset: 0, background: '#0f172a' }} />}>
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
          pointerEvents: 'none',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '1rem',
        }}
      >
        {/* Card - mobile responsive */}
        <div
          style={{
            background: '#ffffffc0',
            borderRadius: '0.75rem',
            padding: '2rem 1.5rem',
            maxWidth: '680px',
            width: '100%',
            textAlign: 'center',
            pointerEvents: 'auto',
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: '1rem' }}>
            <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
              <circle cx="24" cy="24" r="22" fill="url(#logo-gradient-home)" />
              <path d="M16 24C16 20 19 16 24 16C29 16 32 20 32 24" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M20 28C20 31 22.5 34 26 34C29.5 34 32 31 32 28" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="24" cy="24" r="3" fill="white" />
              <defs>
                <linearGradient id="logo-gradient-home" x1="2" y1="2" x2="46" y2="46" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Title - responsive font size */}
          <h1 style={{
            color: '#1e293b',
            fontSize: 'clamp(2.5rem, 10vw, 3rem)',
            fontWeight: 900,
            margin: '0 0 4px',
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}>
            DSS
          </h1>

          <p style={{
            color: '#64748b',
            fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)',
            margin: '0 0 1.25rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 500
          }}>
            DNA Sequence Similarities
          </p>

          <p style={{
            color: '#64748b',
            fontSize: 'clamp(0.85rem, 3vw, 0.95rem)',
            lineHeight: 1.65,
            margin: '0 0 1.5rem',
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Analyze and compare DNA sequences using multiple algorithms - from Chaos Game Representation to
            Transition Matrices - with built-in phylogenetic tree visualization and a plugin-based REST API.
          </p>

          {/* Feature badges - responsive flex */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}>
            {FEATURES.map(f => (
              <span
                key={f.label}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '2rem',
                  padding: '0.35rem 0.85rem',
                  color: '#475569',
                  fontSize: 'clamp(0.65rem, 2vw, 0.8rem)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {f.icon} {f.label}
              </span>
            ))}
          </div>

          {/* CTA buttons - responsive flex */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            flexDirection: 'row',
          }}>
            <Button
              type="primary"
              size="large"
              style={{
                height: '2.5rem',
                padding: '0 2rem',
                fontWeight: 600,
                fontSize: 'clamp(0.85rem, 3vw, 1rem)',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '0.375rem',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.35)';
              }}
            >
              Start Analysis
            </Button>
            <Button
              size="large"
              style={{
                height: '2.5rem',
                padding: '0 2rem',
                fontWeight: 600,
                fontSize: 'clamp(0.85rem, 3vw, 1rem)',
                background: '#f8fafc',
                color: '#1e293b',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
              }}
            >
              Login
            </Button>
          </div>
        </div>

        {/* Mobile-friendly bottom hint */}
        <p style={{
          color: '#94a3b8',
          fontSize: '0.7rem',
          marginTop: '1.5rem',
          pointerEvents: 'none',
          letterSpacing: '0.05em',
          display: 'block',
        }}>
          DNA Sequence Similarities v1.0
        </p>
      </div>
    </>
  );
};

export const Route = createFileRoute('/')({ component: Home });
