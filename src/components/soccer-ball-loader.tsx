'use client'

interface SoccerBallLoaderProps {
  size?: number
  showText?: boolean
}

export function SoccerBallLoader({ size = 96, showText = false }: SoccerBallLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Ball + Shadow container */}
      <div className="relative" style={{ width: size, height: size + 12 }}>
        {/* Ball */}
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className="soccer-ball-spin"
          aria-hidden="true"
        >
          {/* Outer circle */}
          <circle cx="50" cy="50" r="48" fill="#1a1a1a" stroke="#C9A94E" strokeWidth="2" />

          {/* Center pentagon */}
          <polygon
            points="50,30 61,38 58,51 42,51 39,38"
            fill="#C9A94E"
            stroke="#C9A94E"
            strokeWidth="0.5"
          />

          {/* Top pentagon */}
          <polygon
            points="50,5 58,18 50,22 42,18"
            fill="none"
            stroke="#C9A94E"
            strokeWidth="1.5"
          />

          {/* Top-right pentagon */}
          <polygon
            points="75,18 82,35 72,38 61,30 65,20"
            fill="none"
            stroke="#C9A94E"
            strokeWidth="1.5"
          />

          {/* Top-left pentagon */}
          <polygon
            points="25,18 35,20 39,30 28,38 18,35"
            fill="none"
            stroke="#C9A94E"
            strokeWidth="1.5"
          />

          {/* Bottom-right pentagon */}
          <polygon
            points="88,55 82,72 70,70 65,55 75,48"
            fill="none"
            stroke="#C9A94E"
            strokeWidth="1.5"
          />

          {/* Bottom-left pentagon */}
          <polygon
            points="12,55 25,48 35,55 30,70 18,72"
            fill="none"
            stroke="#C9A94E"
            strokeWidth="1.5"
          />

          {/* Bottom pentagon */}
          <polygon
            points="38,70 42,60 58,60 62,70 55,82 45,82"
            fill="none"
            stroke="#C9A94E"
            strokeWidth="1.5"
          />

          {/* Connecting lines */}
          <line x1="50" y1="22" x2="50" y2="30" stroke="#C9A94E" strokeWidth="1" opacity="0.6" />
          <line x1="61" y1="30" x2="65" y2="20" stroke="#C9A94E" strokeWidth="1" opacity="0.6" />
          <line x1="39" y1="30" x2="35" y2="20" stroke="#C9A94E" strokeWidth="1" opacity="0.6" />
          <line x1="61" y1="38" x2="75" y2="48" stroke="#C9A94E" strokeWidth="1" opacity="0.6" />
          <line x1="39" y1="38" x2="25" y2="48" stroke="#C9A94E" strokeWidth="1" opacity="0.6" />
          <line x1="58" y1="51" x2="65" y2="55" stroke="#C9A94E" strokeWidth="1" opacity="0.6" />
          <line x1="42" y1="51" x2="35" y2="55" stroke="#C9A94E" strokeWidth="1" opacity="0.6" />
          <line x1="58" y1="60" x2="62" y2="70" stroke="#C9A94E" strokeWidth="1" opacity="0.6" />
          <line x1="42" y1="60" x2="38" y2="70" stroke="#C9A94E" strokeWidth="1" opacity="0.6" />
        </svg>

        {/* Shadow */}
        <div
          className="soccer-ball-shadow absolute rounded-full bg-gold/30"
          style={{
            width: size * 0.5,
            height: size * 0.1,
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            filter: 'blur(4px)',
          }}
        />
      </div>

      {/* Loading text */}
      {showText && (
        <p className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-white/40">
          Loading
        </p>
      )}

      {/* Animations via style tag (pure CSS, no JS runtime) */}
      <style jsx>{`
        .soccer-ball-spin {
          animation: ball-spin 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .soccer-ball-shadow {
          animation: ball-shadow 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes ball-spin {
          0% {
            transform: perspective(400px) rotateY(0deg) translateY(0px);
          }
          50% {
            transform: perspective(400px) rotateY(180deg) translateY(-8px);
          }
          100% {
            transform: perspective(400px) rotateY(360deg) translateY(0px);
          }
        }

        @keyframes ball-shadow {
          0%,
          100% {
            transform: translateX(-50%) scaleX(1);
            opacity: 0.3;
          }
          50% {
            transform: translateX(-50%) scaleX(0.7);
            opacity: 0.15;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .soccer-ball-spin {
            animation: ball-pulse 2s ease-in-out infinite;
          }
          .soccer-ball-shadow {
            animation: none;
            opacity: 0.2;
          }
        }

        @keyframes ball-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}
