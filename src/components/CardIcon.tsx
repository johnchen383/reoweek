import type { ReactElement } from "react";

/**
 * Hand-drawn style SVG icons per card label — stick to the red / cream / white
 * palette. Labels come from src/data/questions.json; any label without an
 * entry here falls back to a generic icon, so new pairs can be added to the
 * JSON without touching this file.
 */
const ICONS: Record<string, ReactElement> = {
  "Movie Night": (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M47 33 L36 16 M73 33 L84 16"
        stroke="#2a0a0c"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="35" cy="14" r="3.5" fill="#911223" />
      <circle cx="85" cy="14" r="3.5" fill="#911223" />
      <rect
        x="18"
        y="32"
        width="84"
        height="58"
        rx="12"
        fill="#FEFAF4"
        stroke="#2a0a0c"
        strokeWidth="4"
      />
      <rect
        x="27"
        y="41"
        width="53"
        height="40"
        rx="7"
        fill="#ffffff"
        stroke="#2a0a0c"
        strokeWidth="3"
      />
      <path
        d="M47 52 L63 61 L47 70 Z"
        fill="#E22A30"
        stroke="#2a0a0c"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle
        cx="91"
        cy="51"
        r="4"
        fill="#E22A30"
        stroke="#2a0a0c"
        strokeWidth="2.5"
      />
      <circle
        cx="91"
        cy="65"
        r="4"
        fill="#ffffff"
        stroke="#2a0a0c"
        strokeWidth="2.5"
      />
      <path
        d="M87 76 h8"
        stroke="#911223"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M42 90 L37 103 M78 90 L83 103"
        stroke="#2a0a0c"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  ),

  "Going out": (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 100 H96"
        stroke="#2a0a0c"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M30 100 V26 a8 8 0 0 1 8 -8 h28 a8 8 0 0 1 8 8 v74"
        fill="#f3dcdc"
        stroke="#2a0a0c"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M42 100 V30 L70 24 V100 Z"
        fill="#E22A30"
        stroke="#2a0a0c"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="64" cy="64" r="3.5" fill="#FEFAF4" />
      <path
        d="M80 56 H100"
        stroke="#911223"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M94 46 L104 56 L94 66"
        stroke="#911223"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M88 22 v10 M83 27 h10"
        stroke="#E22A30"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  ),

  Happiness: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="60"
        cy="62"
        r="36"
        fill="#FEFAF4"
        stroke="#2a0a0c"
        strokeWidth="4"
      />
      <path
        d="M40 57 q6 -8 12 0"
        stroke="#2a0a0c"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M68 57 q6 -8 12 0"
        stroke="#2a0a0c"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M42 68 Q60 88 78 68"
        stroke="#E22A30"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <ellipse cx="34" cy="67" rx="5" ry="3.5" fill="#f3dcdc" />
      <ellipse cx="86" cy="67" rx="5" ry="3.5" fill="#f3dcdc" />
      <path
        d="M25 25 l6 6 M95 25 l-6 6 M60 11 v9"
        stroke="#911223"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  ),

  Purpose: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="57"
        cy="63"
        r="36"
        fill="#FEFAF4"
        stroke="#2a0a0c"
        strokeWidth="4"
      />
      <circle
        cx="57"
        cy="63"
        r="23"
        fill="#ffffff"
        stroke="#911223"
        strokeWidth="4"
      />
      <circle
        cx="57"
        cy="63"
        r="10"
        fill="#E22A30"
        stroke="#2a0a0c"
        strokeWidth="3.5"
      />
      <path
        d="M95 17 L63 57"
        stroke="#2a0a0c"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M93 20 l9 -11 M88 26 l9 -11"
        stroke="#E22A30"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M63 57 L75 51 L66 44 Z" fill="#2a0a0c" />
    </svg>
  ),

  Truth: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M60 32 C51 25 32 24 22 29 V88 C32 83 51 84 60 90 Z"
        fill="#ffffff"
        stroke="#2a0a0c"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M60 32 C69 25 88 24 98 29 V88 C88 83 69 84 60 90 Z"
        fill="#ffffff"
        stroke="#2a0a0c"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M60 32 V90" stroke="#2a0a0c" strokeWidth="4" />
      <path
        d="M31 43 h18 M31 52 h15 M31 61 h18 M71 43 h18 M74 52 h15 M71 61 h18"
        stroke="#911223"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M66 30 V46 L72 41 L78 46 V29 Z"
        fill="#E22A30"
        stroke="#2a0a0c"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M60 18 V8 M42 21 l-7 -8 M78 21 l7 -8"
        stroke="#E22A30"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  ),

  Acceptance: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M60 92 C38 76 26 62 26 47 A16 16 0 0 1 54 37 L60 44 L66 37 A16 16 0 0 1 94 47 C94 62 82 76 60 92 Z"
        fill="#E22A30"
        stroke="#2a0a0c"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M45 57 l9 9 l20 -22"
        stroke="#FEFAF4"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M34 45 q2 -8 10 -11"
        stroke="#FEFAF4"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  ),

  "Being enough": (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M60 14 L73 41 L102 45 L81 65 L86 94 L60 80 L34 94 L39 65 L18 45 L47 41 Z"
        fill="#FEFAF4"
        stroke="#2a0a0c"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M49 59 l8 8 l17 -19"
        stroke="#E22A30"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="20" r="3" fill="#E22A30" />
      <circle cx="102" cy="18" r="2.5" fill="#911223" />
      <circle cx="106" cy="80" r="3" fill="#E22A30" />
      <circle cx="14" cy="78" r="2.5" fill="#911223" />
    </svg>
  ),

  "Being loved": (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M56 96 C36 81 22 66 22 50 A16 16 0 0 1 51 40 L56 46 L61 40 A16 16 0 0 1 90 50 C90 66 76 81 56 96 Z"
        fill="#E22A30"
        stroke="#2a0a0c"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M32 47 q2 -9 11 -12"
        stroke="#FEFAF4"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M97 40 C89 34 84 28 84 22 A6.5 6.5 0 0 1 96 18 L97 20 L98 18 A6.5 6.5 0 0 1 110 22 C110 28 105 34 97 40 Z"
        fill="#ffffff"
        stroke="#2a0a0c"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </svg>
  ),

  "Bubble tea": (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M28 30 H92 L80 96 a10 10 0 0 1 -10 9 H50 a10 10 0 0 1 -10 -9 Z"
        fill="#f3dcdc"
        stroke="#2a0a0c"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M28 30 H92"
        stroke="#2a0a0c"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect
        x="55"
        y="14"
        width="10"
        height="24"
        rx="3"
        fill="#911223"
        stroke="#2a0a0c"
        strokeWidth="3"
      />
      <path
        d="M31 58 H89"
        stroke="#E22A30"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="47" cy="76" r="4.5" fill="#2a0a0c" />
      <circle cx="61" cy="81" r="4.5" fill="#2a0a0c" />
      <circle cx="73" cy="76" r="4.5" fill="#2a0a0c" />
      <circle cx="58" cy="90" r="4.5" fill="#2a0a0c" />
    </svg>
  ),

  Matcha: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* whisk handle */}
      <path
        d="M60 14 V42"
        stroke="#2a0a0c"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* whisk tines */}
      <path
        d="M48 42 L44 58
         M52 42 L50 60
         M56 42 L56 61
         M60 42 L60 62
         M64 42 L64 61
         M68 42 L70 60
         M72 42 L76 58"
        stroke="#911223"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* bowl */}
      <path
        d="M34 68 H86 L79 96
         A8 8 0 0 1 71 102
         H49
         A8 8 0 0 1 41 96 Z"
        fill="#FEFAF4"
        stroke="#2a0a0c"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* matcha */}
      <ellipse
        cx="60"
        cy="68"
        rx="26"
        ry="6"
        fill="#81B55B"
        stroke="#2a0a0c"
        strokeWidth="4"
      />

      {/* foam */}
      <path
        d="M50 70 Q55 67 60 70 T70 70"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  ),

  "Super hot": (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M60 14
         C74 32 55 40 55 56
         C55 66 61 72 66 74
         C68 67 77 62 77 48
         C89 60 94 73 94 86
         C94 102 80 110 60 110
         C40 110 26 100 26 84
         C26 66 38 54 49 44
         C47 54 51 60 58 64
         C55 52 56 34 60 14Z"
        fill="#E22A30"
        stroke="#2a0a0c"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      <path
        d="M60 48
         C66 57 60 64 60 71
         C60 78 65 84 71 84
         C76 84 80 79 80 72
         C80 65 75 58 69 54
         C69 60 65 64 61 65
         C61 59 59 55 60 48Z"
        fill="#FEFAF4"
      />

      <path
        d="M18 46 l7 4 M102 46 l-7 4 M60 101 v9"
        stroke="#911223"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  ),

  "Super kind": (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* heart */}
      <path
        d="M82 30
         C82 22 92 20 96 27
         C100 20 110 22 110 30
         C110 39 102 45 96 50
         C90 45 82 39 82 30Z"
        fill="#E22A30"
        stroke="#2a0a0c"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* hand */}
      <path
        d="M34 77
         C34 68 39 62 45 62
         V46
         C45 41 48 38 52 38
         C56 38 59 41 59 46
         V60
         H63
         V42
         C63 37 66 34 70 34
         C74 34 77 37 77 42
         V66
         C77 84 66 96 51 96
         H44
         C38 96 34 90 34 82Z"
        fill="#FEFAF4"
        stroke="#2a0a0c"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* fingers */}
      <path
        d="M59 46 V64
         M68 42 V64"
        stroke="#2a0a0c"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* sparkle */}
      <path
        d="M22 24 v8 M18 28 h8"
        stroke="#911223"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  ),

  "Jesus's way": (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M52 20 H68 V42 H94 V58 H68 V102 H52 V58 H26 V42 H52 Z"
        fill="#E22A30"
        stroke="#2a0a0c"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M60 6 v8 M32 20 l6 6 M88 20 l-6 6"
        stroke="#911223"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  ),

  "My way": (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 80 V48 L38 62 L60 26 L82 62 L100 48 V80 Z"
        fill="#E22A30"
        stroke="#2a0a0c"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <rect
        x="20"
        y="80"
        width="80"
        height="15"
        rx="5"
        fill="#E22A30"
        stroke="#2a0a0c"
        strokeWidth="4"
      />
      <circle
        cx="20"
        cy="45"
        r="4.5"
        fill="#FEFAF4"
        stroke="#2a0a0c"
        strokeWidth="3"
      />
      <circle
        cx="60"
        cy="22"
        r="4.5"
        fill="#FEFAF4"
        stroke="#2a0a0c"
        strokeWidth="3"
      />
      <circle
        cx="100"
        cy="45"
        r="4.5"
        fill="#FEFAF4"
        stroke="#2a0a0c"
        strokeWidth="3"
      />
      <text
        x="60"
        y="68"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Lora, Georgia, serif"
        fontWeight="800"
        fontSize="21"
        fill="#FEFAF4"
        letterSpacing="1">
        ME
      </text>
      <circle cx="40" cy="87.5" r="3" fill="#FEFAF4" />
      <circle
        cx="60"
        cy="87.5"
        r="4"
        fill="#FEFAF4"
        stroke="#2a0a0c"
        strokeWidth="2.5"
      />
      <circle cx="80" cy="87.5" r="3" fill="#FEFAF4" />
    </svg>
  ),
};

const FALLBACK = (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M60 24 C30 24 24 60 24 60 C24 90 60 96 60 96 C60 96 96 90 96 60 C96 60 90 24 60 24 Z"
      fill="#FEFAF4"
      stroke="#2a0a0c"
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <circle
      cx="60"
      cy="60"
      r="10"
      fill="#E22A30"
      stroke="#2a0a0c"
      strokeWidth="3"
    />
  </svg>
);

export function CardIcon({ label }: { label: string }) {
  return ICONS[label] ?? FALLBACK;
}
