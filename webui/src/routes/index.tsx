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
        pointerEvents: 'none',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '1rem',
      }}
    >
      {/* Glassmorphism card - mobile responsive */}
      <div
        style={{
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '1.5rem',
          padding: '2rem 1.5rem',
          maxWidth: '680px',
          width: '100%',
          textAlign: 'center',
          pointerEvents: 'auto',
          boxShadow: '0 12px 64px rgba(0,0,0,0.55)',
        }}
      >
        {/* Title - responsive font size */}
        <h1 style={{ 
          color: '#fff', 
          fontSize: 'clamp(2.5rem, 10vw, 4rem)', 
          fontWeight: 900, 
          margin: '0 0 4px', 
          letterSpacing: '-0.03em', 
          lineHeight: 1.1 
        }}>
          DSS
        </h1>
        
        <p style={{ 
          color: 'rgba(255,255,255,0.7)', 
          fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)', 
          margin: '0 0 1.25rem', 
          letterSpacing: '0.15em', 
          textTransform: 'uppercase', 
          fontWeight: 500 
        }}>
          DNA Sequence Similarities
        </p>
        
        <p style={{ 
          color: 'rgba(255,255,255,0.6)', 
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
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '2rem',
                padding: '0.35rem 0.85rem',
                color: 'rgba(255,255,255,0.88)',
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
          <a 
            href="/analysis" 
            style={{
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: '#fff',
              borderRadius: '3rem',
              fontWeight: 700,
              fontSize: 'clamp(0.85rem, 3vw, 1rem)',
              textDecoration: 'none',
              boxShadow: '0 4px 24px rgba(79,195,247,0.35)',
              display: 'inline-block',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 28px rgba(79,195,247,0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(79,195,247,0.35)';
            }}
          >
            Start Analysis
          </a>
          <a 
            href="/login" 
            style={{
              padding: '0.75rem 2rem',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              borderRadius: '3rem',
              fontWeight: 600,
              fontSize: 'clamp(0.85rem, 3vw, 1rem)',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'inline-block',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
          >
            Login
          </a>
        </div>
      </div>

      {/* Mobile-friendly bottom hint */}
      <p style={{ 
        color: 'rgba(255,255,255,0.28)', 
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
