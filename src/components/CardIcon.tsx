import type { ReactElement } from 'react'

/**
 * Hand-drawn style SVG icons per card label — stick to the red / cream / white
 * palette. Labels come from src/data/questions.json; any label without an
 * entry here falls back to a generic icon, so new pairs can be added to the
 * JSON without touching this file.
 */
const ICONS: Record<string, ReactElement> = {
  Netflix: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="28" width="84" height="56" rx="8" fill="#FEFAF4" stroke="#2a0a0c" strokeWidth="4" />
      <path d="M50 44 L74 56 L50 68 Z" fill="#E22A30" stroke="#2a0a0c" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M44 92 H76" stroke="#2a0a0c" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 84 V92" stroke="#2a0a0c" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),

  'Going out': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 22 H78 V98 H40 Z" fill="#FEFAF4" stroke="#2a0a0c" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="68" cy="60" r="4" fill="#911223" />
      <path d="M86 50 L102 60 L86 70" fill="none" stroke="#E22A30" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M70 60 H100" stroke="#E22A30" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),

  Happiness: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="38" fill="#FEFAF4" stroke="#2a0a0c" strokeWidth="4" />
      <circle cx="46" cy="52" r="4.5" fill="#2a0a0c" />
      <circle cx="74" cy="52" r="4.5" fill="#2a0a0c" />
      <path d="M42 68 Q60 88 78 68" fill="none" stroke="#E22A30" strokeWidth="5" strokeLinecap="round" />
      <path d="M30 28 l6 6 M90 28 l-6 6 M60 16 v8" stroke="#911223" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  ),

  Purpose: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="38" fill="#FEFAF4" stroke="#2a0a0c" strokeWidth="4" />
      <circle cx="60" cy="60" r="24" fill="none" stroke="#911223" strokeWidth="4" />
      <circle cx="60" cy="60" r="10" fill="#E22A30" stroke="#2a0a0c" strokeWidth="3.5" />
      <path d="M92 18 L66 54" stroke="#2a0a0c" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M92 18 l-14 2 l12 12 Z" fill="#2a0a0c" />
    </svg>
  ),

  Truth: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 30 C50 24 30 24 22 30 V86 C30 80 50 80 60 86 Z" fill="#FEFAF4" stroke="#2a0a0c" strokeWidth="4" strokeLinejoin="round" />
      <path d="M60 30 C70 24 90 24 98 30 V86 C90 80 70 80 60 86 Z" fill="#FEFAF4" stroke="#2a0a0c" strokeWidth="4" strokeLinejoin="round" />
      <path d="M60 30 V86" stroke="#2a0a0c" strokeWidth="4" />
      <path d="M30 40 H50 M30 50 H48 M70 40 H90 M72 50 H90" stroke="#E22A30" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  ),

  Acceptance: (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 50 a14 14 0 0 1 14 -14 c8 0 12 6 16 12 c4 -6 8 -12 16 -12 a14 14 0 0 1 14 14 c0 16 -30 36 -30 36 s-30 -20 -30 -36 Z" fill="#E22A30" stroke="#2a0a0c" strokeWidth="4" strokeLinejoin="round" />
      <path d="M42 56 l8 8 l16 -18" fill="none" stroke="#FEFAF4" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  'Being enough': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 18 L74 44 L102 48 L82 68 L87 96 L60 82 L33 96 L38 68 L18 48 L46 44 Z" fill="#FEFAF4" stroke="#2a0a0c" strokeWidth="4" strokeLinejoin="round" />
      <path d="M48 60 l8 8 l16 -18" fill="none" stroke="#E22A30" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  'Being loved': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 96 C30 76 16 58 16 40 a18 18 0 0 1 32 -11 c4 4 8 9 12 15 c4 -6 8 -11 12 -15 a18 18 0 0 1 32 11 c0 18 -14 36 -44 56 Z" fill="#E22A30" stroke="#2a0a0c" strokeWidth="4" strokeLinejoin="round" />
      <path d="M36 38 q6 -8 14 -2" fill="none" stroke="#FEFAF4" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),

  "Jesus's way": (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="52" y="18" width="16" height="84" rx="4" fill="#E22A30" stroke="#2a0a0c" strokeWidth="3.5" />
      <rect x="24" y="40" width="72" height="16" rx="4" fill="#E22A30" stroke="#2a0a0c" strokeWidth="3.5" />
    </svg>
  ),

  'My way': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 78 L18 46 L38 62 L60 22 L82 62 L102 46 L102 78 Z" fill="#E22A30" stroke="#2a0a0c" strokeWidth="4" strokeLinejoin="round" />
      <rect x="18" y="78" width="84" height="16" rx="4" fill="#E22A30" stroke="#2a0a0c" strokeWidth="4" />
      <text x="60" y="72" textAnchor="middle" dominantBaseline="middle" fontFamily="Lora, Georgia, serif" fontWeight="800" fontSize="22" fill="#FEFAF4" letterSpacing="1">
        ME
      </text>
    </svg>
  ),
}

const FALLBACK = (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M60 24 C30 24 24 60 24 60 C24 90 60 96 60 96 C60 96 96 90 96 60 C96 60 90 24 60 24 Z" fill="#FEFAF4" stroke="#2a0a0c" strokeWidth="4" strokeLinejoin="round" />
    <circle cx="60" cy="60" r="10" fill="#E22A30" stroke="#2a0a0c" strokeWidth="3" />
  </svg>
)

export function CardIcon({ label }: { label: string }) {
  return ICONS[label] ?? FALLBACK
}
