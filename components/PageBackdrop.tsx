/**
 * Fixed full-viewport backdrop that sits behind everything else. Sunset
 * gradient + subtle SVG palm-frond silhouettes in two corners. Stays under
 * the map and UI (z-index 0) — visible during the map's load state and
 * everywhere on guide pages.
 *
 * Server component — no client work.
 */

function Palm({
  position,
  rotate = 0,
  scale = 1,
}: {
  position: { top?: number | string; left?: number | string; right?: number | string; bottom?: number | string };
  rotate?: number;
  scale?: number;
}) {
  return (
    <svg
      viewBox="0 0 400 400"
      className="absolute pointer-events-none"
      style={{
        ...position,
        width: 360 * scale,
        height: 360 * scale,
        transform: `rotate(${rotate}deg)`,
        opacity: 0.42,
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="palmGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#0a0414" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0a0414" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {/* Trunk */}
      <path
        d="M 200 400 C 195 320 205 240 200 170"
        stroke="url(#palmGrad)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      {/* Fronds — 7 leaves radiating from the top */}
      {[
        { rot: -90, len: 175 },
        { rot: -60, len: 200 },
        { rot: -30, len: 195 },
        { rot: 0, len: 180 },
        { rot: 30, len: 200 },
        { rot: 60, len: 205 },
        { rot: 90, len: 180 },
      ].map((f, i) => (
        <g key={i} transform={`translate(200 170) rotate(${f.rot - 90})`}>
          <path
            d={`M 0 0 Q ${f.len * 0.4} -30 ${f.len} -10 Q ${f.len * 0.5} 8 0 0 Z`}
            fill="url(#palmGrad)"
          />
          {/* leaflets */}
          {[0.3, 0.5, 0.7, 0.85].map((t) => (
            <line
              key={t}
              x1={f.len * t}
              y1={-18 + t * 20}
              x2={f.len * t + 18}
              y2={-44 + t * 20}
              stroke="url(#palmGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

export default function PageBackdrop() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Base sunset gradient — purple at top → magenta middle → warm orange bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #1a0a36 0%, #2a1056 18%, #5a1450 40%, #a01658 65%, #c43e3a 82%, #d96332 100%)",
        }}
      />
      {/* Top haze for that hazy-sunset look */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 90%, rgba(255,210,150,0.35), transparent 70%)",
        }}
      />
      {/* Top atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(40,15,90,0.6), transparent 70%)",
        }}
      />
      {/* Sun glow horizon */}
      <div
        className="absolute left-0 right-0 bottom-0 h-1/3"
        style={{
          background:
            "radial-gradient(ellipse 35% 100% at 50% 100%, rgba(255,180,80,0.45), transparent 60%)",
        }}
      />
      {/* Subtle scan-line / haze pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0 2px, transparent 2px 4px)",
        }}
      />

      <Palm position={{ bottom: -40, left: -30 }} rotate={-15} scale={1.1} />
      <Palm position={{ bottom: -20, right: -60 }} rotate={18} scale={1.3} />
      <Palm position={{ top: -80, right: 80 }} rotate={170} scale={0.7} />
    </div>
  );
}
