/**
 * Decorative compass rose. SVG, non-interactive. North is always up because the
 * map uses L.CRS.Simple — there's no rotation to track.
 */
export default function CompassRose() {
  return (
    <div
      className="absolute top-3 right-3 z-[700] w-14 h-14 hidden md:block pointer-events-none"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="compassBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a0a36" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0a0414" stopOpacity="0.95" />
          </radialGradient>
          <linearGradient id="needleN" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff45a6" />
            <stop offset="100%" stopColor="#ffe156" />
          </linearGradient>
          <linearGradient id="needleS" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#19f0d0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#19f0d0" stopOpacity="0.55" />
          </linearGradient>
          <filter id="compassGlow">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="50" cy="50" r="46" fill="url(#compassBg)" stroke="rgba(255,43,214,0.4)" strokeWidth="1.5" />

        {/* Cardinal tick marks */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="6"
            x2="50"
            y2={deg % 90 === 0 ? 12 : 9}
            stroke="rgba(122,90,163,0.7)"
            strokeWidth={deg % 90 === 0 ? 1.5 : 1}
            transform={`rotate(${deg} 50 50)`}
          />
        ))}

        {/* Needle */}
        <g filter="url(#compassGlow)">
          <polygon points="50,12 44,50 50,46 56,50" fill="url(#needleN)" />
          <polygon points="50,88 44,50 50,54 56,50" fill="url(#needleS)" />
          <circle cx="50" cy="50" r="3.5" fill="#0a0414" stroke="#ff45a6" strokeWidth="1" />
        </g>

        {/* N marker */}
        <text
          x="50"
          y="32"
          textAnchor="middle"
          fontFamily="Orbitron, Arial, sans-serif"
          fontSize="9"
          fontWeight="700"
          fill="#ffe156"
          letterSpacing="1"
        >
          N
        </text>
      </svg>
    </div>
  );
}
