import React from 'react';
import { HouseRoofStyle } from '../types';

interface HouseSvgProps {
  styleType: HouseRoofStyle;
  isNight?: boolean;
  hasPiles?: boolean;
  hasVeranda?: boolean;
  scale?: number;
  viewMode?: 'facade' | 'plan';
  className?: string;
}

export const HouseSvg: React.FC<HouseSvgProps> = ({
  styleType,
  isNight = false,
  hasPiles = true,
  hasVeranda = false,
  scale = 1,
  viewMode = 'facade',
  className = 'w-full h-auto',
}) => {
  // Theme palette tokens for the house elements
  const wallFill = isNight ? '#C9AD7C' : '#F6E3C0';
  const wallStroke = isNight ? '#987544' : '#E0C59A';
  const roofFill = isNight ? '#1E4034' : '#2F5A4B';
  const roofRidge = isNight ? '#143026' : '#214237';
  const glassFill = isNight ? '#FFD37A' : '#A9CFD8';
  const glassGlow = isNight ? 'drop-shadow(0 0 10px rgba(255, 211, 122, 0.85))' : 'none';
  const doorFill = isNight ? '#17362C' : '#234438';
  const groundFill = isNight ? '#1E3B30' : '#88B294';
  const pileFill = isNight ? '#475569' : '#64748B';

  const renderScrewPiles = () => {
    if (!hasPiles) return null;
    return (
      <g opacity={isNight ? 0.8 : 0.95}>
        {[28, 64, 100, 136, 172].map((x, i) => (
          <g key={i}>
            <rect x={x - 2} y={100} width={4} height={18} rx={1} fill={pileFill} />
            <rect x={x - 6} y={100} width={12} height={3} rx={1} fill="#334155" />
            <line x1={x - 5} y1={110} x2={x + 5} y2={113} stroke="#475569" strokeWidth={1.5} />
            <line x1={x - 5} y1={114} x2={x + 5} y2={117} stroke="#475569" strokeWidth={1.5} />
          </g>
        ))}
      </g>
    );
  };

  // 2D Architectural Floor Plan Layout View
  if (viewMode === 'plan') {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 200 126"
          className="w-full h-full transition-all duration-500 ease-out font-sans"
          style={{ transform: `scale(${scale})` }}
          role="img"
          aria-label="Архитектурный план этажа"
        >
          {/* Blueprint background grid */}
          <rect x="10" y="8" width="180" height="110" rx="6" fill={isNight ? '#0E221B' : '#E8F1EC'} stroke="#2F5A4B" strokeWidth="1.5" />
          
          {/* Outer load-bearing perimeter walls */}
          <rect x="22" y="18" width="156" height="90" rx="2" fill="none" stroke="#2F5A4B" strokeWidth="5" />
          
          {/* Internal partition walls */}
          <line x1="104" y1="18" x2="104" y2="108" stroke="#2F5A4B" strokeWidth="3" />
          <line x1="22" y1="68" x2="104" y2="68" stroke="#2F5A4B" strokeWidth="3" />
          <line x1="68" y1="68" x2="68" y2="108" stroke="#2F5A4B" strokeWidth="2.5" />
          
          {/* Windows (blue slots in wall) */}
          <rect x="44" y="16" width="24" height="4" fill="#A9CFD8" stroke="#2F5A4B" strokeWidth="1" />
          <rect x="126" y="16" width="30" height="4" fill="#A9CFD8" stroke="#2F5A4B" strokeWidth="1" />
          <rect x="176" y="44" width="4" height="24" fill="#A9CFD8" stroke="#2F5A4B" strokeWidth="1" />
          
          {/* Entrance Door with swing radius arc */}
          <rect x="36" y="106" width="18" height="4" fill="#E6B860" />
          <path d="M 36 106 A 18 18 0 0 1 54 88" fill="none" stroke="#E6B860" strokeWidth="1.2" strokeDasharray="2,2" />

          {/* Room Labels & Dimensions */}
          <text x="140" y="58" fill={isNight ? '#E6B860' : '#142E25'} fontSize="7.5" fontWeight="bold" textAnchor="middle">
            Гостиная-кухня
          </text>
          <text x="140" y="68" fill={isNight ? '#A5D6C1' : '#476356'} fontSize="6" textAnchor="middle">
            18.4 м²
          </text>

          <text x="63" y="44" fill={isNight ? '#E6B860' : '#142E25'} fontSize="7" fontWeight="bold" textAnchor="middle">
            Спальня
          </text>
          <text x="63" y="53" fill={isNight ? '#A5D6C1' : '#476356'} fontSize="6" textAnchor="middle">
            10.2 м²
          </text>

          <text x="45" y="86" fill={isNight ? '#E6B860' : '#142E25'} fontSize="6.5" fontWeight="bold" textAnchor="middle">
            Холл
          </text>
          <text x="45" y="94" fill={isNight ? '#A5D6C1' : '#476356'} fontSize="5.5" textAnchor="middle">
            4.1 м²
          </text>

          <text x="86" y="86" fill={isNight ? '#E6B860' : '#142E25'} fontSize="6.5" fontWeight="bold" textAnchor="middle">
            Санузел
          </text>
          <text x="86" y="94" fill={isNight ? '#A5D6C1' : '#476356'} fontSize="5.5" textAnchor="middle">
            3.3 м²
          </text>

          {/* Dimension tick marks */}
          <g stroke="#2F5A4B" strokeWidth="0.8" opacity="0.6">
            <line x1="22" y1="12" x2="178" y2="12" />
            <line x1="22" y1="9" x2="22" y2="15" />
            <line x1="178" y1="9" x2="178" y2="15" />
            <text x="100" y="11" fill={isNight ? '#E6B860' : '#2F5A4B'} fontSize="5.5" textAnchor="middle" fontWeight="bold">
              6.00 м
            </text>
          </g>
        </svg>
      </div>
    );
  }

  const renderStyleContent = () => {
    switch (styleType) {
      case 'glassv':
        return (
          <>
            <rect x="30" y="52" width="100" height="48" rx="1" fill={wallFill} stroke={wallStroke} strokeWidth="1" />
            <g stroke={wallStroke} strokeWidth="0.75" opacity="0.6">
              <line x1="30" y1="62" x2="130" y2="62" />
              <line x1="30" y1="72" x2="130" y2="72" />
              <line x1="30" y1="82" x2="130" y2="82" />
              <line x1="30" y1="92" x2="130" y2="92" />
            </g>
            <path d="M22 54 L80 18 L138 54 Z" fill={roofFill} />
            <path d="M22 54 L80 18 L84 21 L30 56 Z" fill={roofRidge} opacity="0.4" />
            <rect x="46" y="64" width="22" height="20" rx="2" fill={glassFill} style={{ filter: glassGlow }} stroke={roofFill} strokeWidth="2" />
            <line x1="57" y1="64" x2="57" y2="84" stroke={roofFill} strokeWidth="1.5" />
            <line x1="46" y1="74" x2="68" y2="74" stroke={roofFill} strokeWidth="1.5" />
            <rect x="92" y="66" width="18" height="34" rx="2" fill={doorFill} />
            <circle cx="106" cy="83" r="1.5" fill="#F0B44C" />
            <g transform="translate(130, 48)">
              <path d="M0 8 L44 14 L44 20 L0 16 Z" fill={roofFill} />
              <rect x="2" y="16" width="40" height="36" rx="2" fill={glassFill} opacity={isNight ? 0.9 : 0.75} style={{ filter: glassGlow }} stroke={roofFill} strokeWidth="1.5" />
              <line x1="16" y1="16" x2="16" y2="52" stroke={roofFill} strokeWidth="1.5" />
              <line x1="28" y1="16" x2="28" y2="52" stroke={roofFill} strokeWidth="1.5" />
              <line x1="2" y1="34" x2="42" y2="34" stroke={roofFill} strokeWidth="1.5" />
              <rect x="0" y="50" width="44" height="2" fill={wallFill} />
            </g>
          </>
        );

      case 'aframe':
        return (
          <>
            <path d="M38 100 L100 12 L162 100 Z" fill={roofFill} />
            <path d="M34 100 L100 8 L166 100 L160 100 L100 14 L40 100 Z" fill={roofRidge} />
            <path d="M50 98 L100 24 L150 98 Z" fill={wallFill} />
            <path d="M72 98 L100 50 L128 98 Z" fill={glassFill} style={{ filter: glassGlow }} stroke={roofFill} strokeWidth="2" />
            <line x1="100" y1="50" x2="100" y2="98" stroke={roofFill} strokeWidth="2" />
            <line x1="84" y1="78" x2="116" y2="78" stroke={roofFill} strokeWidth="1.5" />
            <rect x="91" y="74" width="18" height="24" rx="1" fill={doorFill} opacity="0.9" />
            <circle cx="105" cy="86" r="1.5" fill="#F0B44C" />
          </>
        );

      case 'barn':
        return (
          <>
            <rect x="42" y="56" width="116" height="44" fill={wallFill} stroke={wallStroke} strokeWidth="1" />
            <g stroke={wallStroke} strokeWidth="0.8" opacity="0.6">
              {[50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150].map((x) => (
                <line key={x} x1={x} y1="56" x2={x} y2="100" />
              ))}
            </g>
            <path d="M38 58 L58 24 L142 24 L162 58 Z" fill={roofFill} />
            <path d="M34 58 L56 22 L144 22 L166 58" fill="none" stroke={roofRidge} strokeWidth="4" strokeLinejoin="round" />
            <rect x="58" y="44" width="28" height="56" rx="2" fill={glassFill} style={{ filter: glassGlow }} stroke={roofFill} strokeWidth="2" />
            <line x1="72" y1="44" x2="72" y2="100" stroke={roofFill} strokeWidth="1.5" />
            <line x1="58" y1="72" x2="86" y2="72" stroke={roofFill} strokeWidth="1.5" />
            <rect x="110" y="66" width="20" height="34" rx="2" fill={doorFill} />
            <circle cx="125" cy="83" r="1.5" fill="#F0B44C" />
            <circle cx="100" cy="38" r="7" fill={glassFill} style={{ filter: glassGlow }} stroke={roofFill} strokeWidth="1.5" />
          </>
        );

      case 'hip':
        return (
          <>
            <rect x="36" y="56" width="128" height="44" rx="1" fill={wallFill} stroke={wallStroke} strokeWidth="1" />
            <path d="M26 58 L58 24 L142 24 L174 58 Z" fill={roofFill} />
            <path d="M58 24 L100 58 L142 24" fill="none" stroke={roofRidge} strokeWidth="2" opacity="0.6" />
            <rect x="52" y="66" width="22" height="20" rx="2" fill={glassFill} style={{ filter: glassGlow }} stroke={roofFill} strokeWidth="2" />
            <line x1="63" y1="66" x2="63" y2="86" stroke={roofFill} strokeWidth="1.5" />
            <rect x="126" y="66" width="22" height="20" rx="2" fill={glassFill} style={{ filter: glassGlow }} stroke={roofFill} strokeWidth="2" />
            <line x1="137" y1="66" x2="137" y2="86" stroke={roofFill} strokeWidth="1.5" />
            <rect x="90" y="64" width="20" height="36" rx="2" fill={doorFill} />
            <circle cx="105" cy="82" r="1.5" fill="#F0B44C" />
          </>
        );

      case 'chalet':
        return (
          <>
            <rect x="38" y="56" width="124" height="44" fill={wallFill} stroke={wallStroke} strokeWidth="1" />
            <path d="M20 58 L100 18 L180 58 Z" fill={roofFill} />
            <rect x="18" y="86" width="46" height="5" rx="1" fill={roofRidge} />
            <path d="M24 91 L24 100 M56 91 L56 100" stroke={roofFill} strokeWidth="3" />
            <line x1="24" y1="87" x2="56" y2="99" stroke={roofFill} strokeWidth="1.2" opacity="0.7" />
            <line x1="56" y1="87" x2="24" y2="99" stroke={roofFill} strokeWidth="1.2" opacity="0.7" />
            <rect x="76" y="66" width="24" height="22" rx="2" fill={glassFill} style={{ filter: glassGlow }} stroke={roofFill} strokeWidth="2" />
            <line x1="88" y1="66" x2="88" y2="88" stroke={roofFill} strokeWidth="1.5" />
            <rect x="124" y="64" width="20" height="36" rx="2" fill={doorFill} />
            <circle cx="139" cy="82" r="1.5" fill="#F0B44C" />
          </>
        );

      case 'two':
        return (
          <>
            <rect x="48" y="36" width="104" height="64" fill={wallFill} stroke={wallStroke} strokeWidth="1" />
            <rect x="48" y="66" width="104" height="4" fill={roofFill} opacity="0.35" />
            <path d="M38 38 L100 8 L162 38 Z" fill={roofFill} />
            <rect x="60" y="44" width="18" height="16" rx="2" fill={glassFill} style={{ filter: glassGlow }} stroke={roofFill} strokeWidth="1.5" />
            <rect x="122" y="44" width="18" height="16" rx="2" fill={glassFill} style={{ filter: glassGlow }} stroke={roofFill} strokeWidth="1.5" />
            <rect x="60" y="74" width="18" height="18" rx="2" fill={glassFill} style={{ filter: glassGlow }} stroke={roofFill} strokeWidth="1.5" />
            <rect x="114" y="70" width="18" height="30" rx="2" fill={doorFill} />
            <circle cx="127" cy="85" r="1.5" fill="#F0B44C" />
          </>
        );

      case 'mans':
        return (
          <>
            <rect x="42" y="58" width="116" height="42" fill={wallFill} stroke={wallStroke} strokeWidth="1" />
            <path d="M34 58 L54 26 L146 26 L166 58 Z" fill={roofFill} />
            <rect x="88" y="32" width="24" height="18" rx="2" fill={glassFill} style={{ filter: glassGlow }} stroke={roofFill} strokeWidth="2" />
            <line x1="100" y1="32" x2="100" y2="50" stroke={roofFill} strokeWidth="1.5" />
            <rect x="56" y="68" width="22" height="20" rx="2" fill={glassFill} style={{ filter: glassGlow }} stroke={roofFill} strokeWidth="2" />
            <line x1="67" y1="68" x2="67" y2="88" stroke={roofFill} strokeWidth="1.5" />
            <rect x="114" y="66" width="18" height="34" rx="2" fill={doorFill} />
            <circle cx="127" cy="83" r="1.5" fill="#F0B44C" />
            <rect x="108" y="63" width="30" height="3" rx="1" fill={roofFill} />
          </>
        );

      case 'gable':
      default:
        return (
          <>
            <rect x="44" y="54" width="112" height="46" rx="1" fill={wallFill} stroke={wallStroke} strokeWidth="1" />
            <g stroke={wallStroke} strokeWidth="0.75" opacity="0.6">
              <line x1="44" y1="65" x2="156" y2="65" />
              <line x1="44" y1="76" x2="156" y2="76" />
              <line x1="44" y1="87" x2="156" y2="87" />
            </g>
            <path d="M34 56 L100 18 L166 56 Z" fill={roofFill} />
            <path d="M34 56 L100 18 L104 20 L40 58 Z" fill={roofRidge} opacity="0.4" />
            <rect x="62" y="66" width="22" height="20" rx="2" fill={glassFill} style={{ filter: glassGlow }} stroke={roofFill} strokeWidth="2" />
            <line x1="73" y1="66" x2="73" y2="86" stroke={roofFill} strokeWidth="1.5" />
            <line x1="62" y1="76" x2="84" y2="76" stroke={roofFill} strokeWidth="1.5" />
            <rect x="112" y="66" width="18" height="34" rx="2" fill={doorFill} />
            <circle cx="125" cy="83" r="1.5" fill="#F0B44C" />
          </>
        );
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 200 126"
        className="w-full h-full transition-transform duration-500 ease-out"
        style={{ transform: `scale(${scale})` }}
        role="img"
        aria-label="Изометрический проект загородного дома"
      >
        <defs>
          <linearGradient id="groundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={groundFill} stopOpacity={0.8} />
            <stop offset="100%" stopColor={groundFill} stopOpacity={0.2} />
          </linearGradient>
        </defs>

        <rect x="8" y="99" width="184" height="4" rx="2" fill={roofFill} opacity="0.25" />
        <ellipse cx="100" cy="101" rx="88" ry="4" fill="url(#groundGrad)" />

        {renderScrewPiles()}

        <rect x="24" y="98" width="152" height="4" rx="1" fill={roofFill} opacity="0.9" />

        {renderStyleContent()}

        {hasVeranda && styleType !== 'glassv' && (
          <g transform="translate(148, 56)">
            <path d="M0 6 L32 12 L32 15 L0 11 Z" fill={roofFill} />
            <rect x="28" y="14" width="3" height="28" fill={wallFill} stroke={roofFill} strokeWidth="0.8" />
            <rect x="0" y="28" width="30" height="2" fill={roofFill} />
            <line x1="8" y1="29" x2="8" y2="42" stroke={roofFill} strokeWidth="1" />
            <line x1="18" y1="29" x2="18" y2="42" stroke={roofFill} strokeWidth="1" />
            <rect x="0" y="42" width="32" height="2" fill={roofRidge} />
          </g>
        )}
      </svg>
    </div>
  );
};
