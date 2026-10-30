/**
 * Custom Vector Lottie JSON Animations (Bodymovin v5.7.4 specification)
 * Engineered specifically for the "Three Reasons Why Our Houses Cost Less" Bento cards:
 * 1. blueprintHouseLottie: Blueprint grid & wireframe drawing (Trim Paths) morphing into a solid house.
 * 2. seasonalHouseLottie: Seasonal cycle (Snowflake -> Radiant Sun) orbiting a warm insulated house.
 * 3. pileShieldLottie: Screw pile driving into soil followed by a golden protection shield reveal.
 */

// Helper to convert hex [r, g, b] to normalized Lottie 0..1 color array
const rgb = (r: number, g: number, b: number) => [
  +(r / 255).toFixed(3),
  +(g / 255).toFixed(3),
  +(b / 255).toFixed(3),
  1,
];

const GOLD = rgb(230, 184, 96); // #E6B860
const AMBER_DARK = rgb(178, 125, 24); // #B27D18
const FOREST = rgb(24, 59, 48); // #183B30
const EMERALD_LIGHT = rgb(137, 212, 180);
const ICE_BLUE = rgb(125, 211, 252);

/**
 * 1. Готовые проекты: Чертеж превращается в дом (Blueprint -> House Morph)
 */
export const blueprintHouseLottie = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 180,
  w: 120,
  h: 120,
  nm: 'BlueprintToHouse',
  ddd: 0,
  assets: [],
  layers: [
    // Layer 1: Solid House Fill + Warm Window (fades & scales in after blueprint draws)
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'SolidHouseMorph',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [0], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
            { t: 65, s: [0], e: [100], i: { x: [0.2], y: [1] }, o: { x: [0.4], y: [0] } },
            { t: 115, s: [100], e: [100], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
            { t: 155, s: [100], e: [0], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
            { t: 180, s: [0] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [60, 62, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 60, s: [82, 82, 100], e: [102, 102, 100], i: { x: [0.2, 0.2, 0.2], y: [1, 1, 1] }, o: { x: [0.4, 0.4, 0.4], y: [0, 0, 0] } },
            { t: 105, s: [102, 102, 100], e: [100, 100, 100], i: { x: [0.4, 0.4, 0.4], y: [1, 1, 1] }, o: { x: [0.6, 0.6, 0.6], y: [0, 0, 0] } },
            { t: 180, s: [100, 100, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          nm: 'WindowGlow',
          it: [
            {
              ty: 'rc',
              d: 1,
              s: { a: 0, k: [18, 18] },
              p: { a: 0, k: [0, 6] },
              r: { a: 0, k: 3 },
            },
            {
              ty: 'fl',
              c: { a: 0, k: GOLD },
              o: { a: 0, k: 95 },
              r: 1,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
        {
          ty: 'gr',
          nm: 'HouseBodyFill',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                  v: [[-30, -4], [0, -32], [30, -4], [24, 26], [-24, 26]],
                  c: true,
                },
              },
            },
            {
              ty: 'fl',
              c: { a: 0, k: FOREST },
              o: { a: 0, k: 22 },
              r: 1,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
      ],
      ip: 0,
      op: 180,
      st: 0,
    },

    // Layer 2: Self-Drawing Architectural House Wireframe (Trim Paths)
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'BlueprintWireframe',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [60, 62, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          nm: 'RoofAndWalls',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                  v: [[-34, -2], [0, -34], [34, -2], [25, -2], [25, 26], [-25, 26], [-25, -2]],
                  c: true,
                },
              },
            },
            {
              ty: 'tm',
              s: { a: 0, k: 0 },
              e: {
                a: 1,
                k: [
                  { t: 0, s: [12], e: [100], i: { x: [0.25], y: [1] }, o: { x: [0.4], y: [0] } },
                  { t: 75, s: [100], e: [100], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
                  { t: 150, s: [100], e: [12], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
                  { t: 180, s: [12] },
                ],
              },
              o: { a: 0, k: 0 },
              m: 1,
            },
            {
              ty: 'st',
              c: { a: 0, k: AMBER_DARK },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 4.5 },
              lc: 2,
              lj: 2,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
      ],
      ip: 0,
      op: 180,
      st: 0,
    },

    // Layer 3: Blueprint Grid Lines (Dimension Ticks)
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'BlueprintAxes',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [75], e: [25], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
            { t: 90, s: [25], e: [75], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
            { t: 180, s: [75] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [60, 60, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          nm: 'GridFrame',
          it: [
            {
              ty: 'rc',
              d: 1,
              s: { a: 0, k: [86, 86] },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 14 },
            },
            {
              ty: 'st',
              c: { a: 0, k: GOLD },
              o: { a: 0, k: 60 },
              w: { a: 0, k: 2 },
              lc: 2,
              lj: 2,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
      ],
      ip: 0,
      op: 180,
      st: 0,
    },
  ],
};

/**
 * 2. Теплый круглый год: Переключение сезонов (Снежинка -> Солнышко вокруг дома)
 */
export const seasonalHouseLottie = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 240,
  w: 120,
  h: 120,
  nm: 'SeasonalWarmHouse',
  ddd: 0,
  assets: [],
  layers: [
    // Layer 1: Golden Sun with Rotating Rays (fades in during second half, cross-fading with Snowflake)
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'GoldenSun',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [100], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
            { t: 55, s: [100], e: [100], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
            { t: 120, s: [100], e: [0], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
            { t: 175, s: [0], e: [0], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
            { t: 225, s: [0], e: [100], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
            { t: 240, s: [100] },
          ],
        },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [180], i: { x: [0.5], y: [0.5] }, o: { x: [0.5], y: [0.5] } },
            { t: 240, s: [180] },
          ],
        },
        p: { a: 0, k: [88, 30, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [75, 75, 100], e: [110, 110, 100], i: { x: [0.3, 0.3, 0.3], y: [1, 1, 1] }, o: { x: [0.6, 0.6, 0.6], y: [0, 0, 0] } },
            { t: 90, s: [110, 110, 100], e: [75, 75, 100], i: { x: [0.3, 0.3, 0.3], y: [1, 1, 1] }, o: { x: [0.6, 0.6, 0.6], y: [0, 0, 0] } },
            { t: 240, s: [75, 75, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          nm: 'SunCore',
          it: [
            {
              ty: 'el',
              d: 1,
              s: { a: 0, k: [20, 20] },
              p: { a: 0, k: [0, 0] },
            },
            {
              ty: 'fl',
              c: { a: 0, k: GOLD },
              o: { a: 0, k: 100 },
              r: 1,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
        {
          ty: 'gr',
          nm: 'SunRays',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0]],
                  o: [[0, 0], [0, 0]],
                  v: [[0, -16], [0, 16]],
                  c: false,
                },
              },
            },
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0]],
                  o: [[0, 0], [0, 0]],
                  v: [[-16, 0], [16, 0]],
                  c: false,
                },
              },
            },
            {
              ty: 'st',
              c: { a: 0, k: GOLD },
              o: { a: 0, k: 90 },
              w: { a: 0, k: 3 },
              lc: 2,
              lj: 2,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 45 },
              o: { a: 0, k: 100 },
            },
          ],
        },
      ],
      ip: 0,
      op: 240,
      st: 0,
    },

    // Layer 2: Winter Snowflake Crystal (cross-fades opposite to GoldenSun)
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'WinterSnowflake',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [0], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
            { t: 105, s: [0], e: [100], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
            { t: 185, s: [100], e: [0], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
            { t: 240, s: [0] },
          ],
        },
        r: {
          a: 1,
          k: [
            { t: 90, s: [-60], e: [120], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
            { t: 240, s: [120] },
          ],
        },
        p: { a: 0, k: [88, 30, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          nm: 'SnowCrystal',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0]],
                  o: [[0, 0], [0, 0]],
                  v: [[0, -14], [0, 14]],
                  c: false,
                },
              },
            },
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0]],
                  o: [[0, 0], [0, 0]],
                  v: [[-12, -7], [12, 7]],
                  c: false,
                },
              },
            },
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0]],
                  o: [[0, 0], [0, 0]],
                  v: [[-12, 7], [12, -7]],
                  c: false,
                },
              },
            },
            {
              ty: 'st',
              c: { a: 0, k: ICE_BLUE },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 3 },
              lc: 2,
              lj: 2,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
      ],
      ip: 0,
      op: 240,
      st: 0,
    },

    // Layer 3: Central Insulated House with Warm Heart Glow
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'WarmHouseCore',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [54, 68, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [96, 96, 100], e: [103, 103, 100], i: { x: [0.4, 0.4, 0.4], y: [1, 1, 1] }, o: { x: [0.6, 0.6, 0.6], y: [0, 0, 0] } },
            { t: 120, s: [103, 103, 100], e: [96, 96, 100], i: { x: [0.4, 0.4, 0.4], y: [1, 1, 1] }, o: { x: [0.6, 0.6, 0.6], y: [0, 0, 0] } },
            { t: 240, s: [96, 96, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          nm: 'HouseOutline',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                  v: [[-30, -4], [0, -32], [30, -4], [22, -4], [22, 22], [-22, 22], [-22, -4]],
                  c: true,
                },
              },
            },
            {
              ty: 'st',
              c: { a: 0, k: GOLD },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 4.5 },
              lc: 2,
              lj: 2,
            },
            {
              ty: 'fl',
              c: { a: 0, k: GOLD },
              o: { a: 0, k: 18 },
              r: 1,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
        {
          ty: 'gr',
          nm: 'WarmWindow',
          it: [
            {
              ty: 'rc',
              d: 1,
              s: { a: 0, k: [14, 14] },
              p: { a: 0, k: [0, 5] },
              r: { a: 0, k: 3 },
            },
            {
              ty: 'fl',
              c: { a: 0, k: GOLD },
              o: { a: 0, k: 95 },
              r: 1,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
      ],
      ip: 0,
      op: 240,
      st: 0,
    },
  ],
};

/**
 * 3. Свайный фундамент: Забивание сваи в землю + появление щита защиты
 */
export const pileShieldLottie = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 180,
  w: 120,
  h: 120,
  nm: 'PileFoundationShield',
  ddd: 0,
  assets: [],
  layers: [
    // Layer 1: Protective Shield Outline (draws & glows around the driven pile)
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'ProtectionShield',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [25], e: [100], i: { x: [0.3], y: [1] }, o: { x: [0.5], y: [0] } },
            { t: 55, s: [100], e: [100], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
            { t: 180, s: [100] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [60, 58, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 30, s: [88, 88, 100], e: [104, 104, 100], i: { x: [0.2, 0.2, 0.2], y: [1, 1, 1] }, o: { x: [0.4, 0.4, 0.4], y: [0, 0, 0] } },
            { t: 75, s: [104, 104, 100], e: [100, 100, 100], i: { x: [0.4, 0.4, 0.4], y: [1, 1, 1] }, o: { x: [0.6, 0.6, 0.6], y: [0, 0, 0] } },
            { t: 180, s: [100, 100, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          nm: 'ShieldShape',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0], [0, 0], [-14, -10], [0, 0], [14, -10]],
                  o: [[0, 0], [0, 0], [0, 16], [0, 0], [0, 16], [0, 0]],
                  v: [[0, -38], [32, -24], [32, 4], [0, 38], [-32, 4], [-32, -24]],
                  c: true,
                },
              },
            },
            {
              ty: 'tm',
              s: { a: 0, k: 0 },
              e: {
                a: 1,
                k: [
                  { t: 15, s: [0], e: [100], i: { x: [0.25], y: [1] }, o: { x: [0.4], y: [0] } },
                  { t: 85, s: [100], e: [100], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
                  { t: 180, s: [100] },
                ],
              },
              o: { a: 0, k: 0 },
              m: 1,
            },
            {
              ty: 'st',
              c: { a: 0, k: AMBER_DARK },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 4.5 },
              lc: 2,
              lj: 2,
            },
            {
              ty: 'fl',
              c: { a: 0, k: GOLD },
              o: { a: 0, k: 15 },
              r: 1,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
      ],
      ip: 0,
      op: 180,
      st: 0,
    },

    // Layer 2: Steel Screw Pile Driving Downward into Ground
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'ScrewPileShaft',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { t: 0, s: [60, 42, 0], e: [60, 60, 0], i: { x: 0.2, y: 1 }, o: { x: 0.5, y: 0 } },
            { t: 55, s: [60, 60, 0], e: [60, 60, 0], i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 } },
            { t: 145, s: [60, 60, 0], e: [60, 42, 0], i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 } },
            { t: 180, s: [60, 42, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          nm: 'PileVector',
          it: [
            // Top cap plate
            {
              ty: 'rc',
              d: 1,
              s: { a: 0, k: [24, 6] },
              p: { a: 0, k: [0, -18] },
              r: { a: 0, k: 2 },
            },
            // Vertical shaft + pointed tip
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                  v: [[-5, -15], [5, -15], [5, 12], [0, 22], [-5, 12]],
                  c: true,
                },
              },
            },
            // Helical screw blades
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0]],
                  o: [[0, 0], [0, 0]],
                  v: [[-13, 6], [13, 11]],
                  c: false,
                },
              },
            },
            {
              ty: 'st',
              c: { a: 0, k: FOREST },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 3.5 },
              lc: 2,
              lj: 2,
            },
            {
              ty: 'fl',
              c: { a: 0, k: EMERALD_LIGHT },
              o: { a: 0, k: 85 },
              r: 1,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
      ],
      ip: 0,
      op: 180,
      st: 0,
    },
  ],
};
