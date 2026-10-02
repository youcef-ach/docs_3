import { createThemeContract, createTheme } from '@vanilla-extract/css';

/**
 * Authoritative Majara Design Token Contract (ADR-005)
 * Formalizes all design variables across the host and Star Contexts.
 * Hydrated at runtime via ADR-016 remote config manifest.
 */
export const vars = createThemeContract({
  color: {
    bgBlack: null,
    bgPanelStart: null,
    bgPanelMid: null,
    bgPanelEnd: null,
    bgCardTranslucent: null,
    bgBadge: null,

    // Primary Accents
    gold: null,
    goldHover: null,
    goldDark: null,
    cyan: null,
    cyanDim: null,
    cyanGlow: null,
    greenSync: null,
    greenGlow: null,

    // Borders
    borderSlate: null,
    borderSubtle: null,
    borderBracket: null,
    borderBracketDim: null,

    // Text hierarchy
    textWhite: null,
    textPrimary: null,
    textSecondary: null,
    textMuted: null,
    textDim: null,
    textDark: null,

    // Star Context Lens
    starAccent: null,
    starAccentGlow: null,
  },
  font: {
    mono: null,
    display: null,
  },
  space: {
    chamferPanel: null,
    chamferBtn: null,
  },
  shadow: {
    glowGold: null,
    glowCyan: null,
    glowPanel: null,
  },
});

/**
 * 1. Default Nomad Star Theme: Deep Space Navy & Gold (#E6A23C)
 */
export const deepSpaceTheme = createTheme(vars, {
  color: {
    bgBlack: '#000000',
    bgPanelStart: '#0F1316',
    bgPanelMid: '#12171B',
    bgPanelEnd: '#141A1E',
    bgCardTranslucent: 'rgba(0, 0, 0, 0.55)',
    bgBadge: '#1B2228',

    gold: '#E6A23C',
    goldHover: '#F2B254',
    goldDark: '#CF8E30',
    cyan: '#6FB3C9',
    cyanDim: 'rgba(111, 179, 201, 0.25)',
    cyanGlow: 'rgba(111, 179, 201, 0.5)',
    greenSync: '#5FAE84',
    greenGlow: 'rgba(95, 174, 132, 0.6)',

    borderSlate: '#3B4750',
    borderSubtle: '#222C33',
    borderBracket: '#C5C9C6',
    borderBracketDim: 'rgba(197, 201, 198, 0.4)',

    textWhite: '#FFFFFF',
    textPrimary: '#E6EBE8',
    textSecondary: '#AAB4B2',
    textMuted: '#98A3A5',
    textDim: '#4A555B',
    textDark: '#07090A',

    starAccent: '#E6A23C',
    starAccentGlow: 'rgba(230, 162, 60, 0.5)',
  },
  font: {
    mono: "'Space Mono', monospace",
    display: "'Exo 2', sans-serif",
  },
  space: {
    chamferPanel: '18px',
    chamferBtn: '12px',
  },
  shadow: {
    glowGold: '0 0 25px rgba(230, 162, 60, 0.45)',
    glowCyan: '0 0 20px rgba(111, 179, 201, 0.45)',
    glowPanel: '0 24px 64px rgba(0, 0, 0, 0.95)',
  },
});

/**
 * 2. Afrobot Forge Star Theme (Terracotta / Deep Amber)
 */
export const forgeTheme = createTheme(vars, {
  color: {
    bgBlack: '#050201',
    bgPanelStart: '#1A0E0A',
    bgPanelMid: '#160B08',
    bgPanelEnd: '#120906',
    bgCardTranslucent: 'rgba(15, 6, 3, 0.6)',
    bgBadge: '#26120B',

    gold: '#F97316',
    goldHover: '#FB923C',
    goldDark: '#C2410C',
    cyan: '#FBBF24',
    cyanDim: 'rgba(251, 191, 36, 0.25)',
    cyanGlow: 'rgba(251, 191, 36, 0.5)',
    greenSync: '#5FAE84',
    greenGlow: 'rgba(95, 174, 132, 0.6)',

    borderSlate: '#572E20',
    borderSubtle: '#331B13',
    borderBracket: '#E2C2B8',
    borderBracketDim: 'rgba(226, 194, 184, 0.4)',

    textWhite: '#FFFFFF',
    textPrimary: '#FDEEE9',
    textSecondary: '#D6BCB4',
    textMuted: '#A88D84',
    textDim: '#664F47',
    textDark: '#0A0503',

    starAccent: '#F97316',
    starAccentGlow: 'rgba(249, 115, 22, 0.5)',
  },
  font: {
    mono: "'Space Mono', monospace",
    display: "'Exo 2', sans-serif",
  },
  space: {
    chamferPanel: '18px',
    chamferBtn: '12px',
  },
  shadow: {
    glowGold: '0 0 25px rgba(249, 115, 22, 0.45)',
    glowCyan: '0 0 20px rgba(251, 191, 36, 0.45)',
    glowPanel: '0 24px 64px rgba(10, 5, 3, 0.95)',
  },
});

/**
 * 3. The Canvas Star Theme (Teal / Creative Horizon)
 */
export const canvasTheme = createTheme(vars, {
  color: {
    bgBlack: '#010505',
    bgPanelStart: '#081717',
    bgPanelMid: '#061313',
    bgPanelEnd: '#040F0F',
    bgCardTranslucent: 'rgba(2, 10, 10, 0.6)',
    bgBadge: '#0D2424',

    gold: '#14B8A6',
    goldHover: '#2DD4BF',
    goldDark: '#0D9488',
    cyan: '#38BDF8',
    cyanDim: 'rgba(56, 189, 248, 0.25)',
    cyanGlow: 'rgba(56, 189, 248, 0.5)',
    greenSync: '#5FAE84',
    greenGlow: 'rgba(95, 174, 132, 0.6)',

    borderSlate: '#1E4444',
    borderSubtle: '#112B2B',
    borderBracket: '#B8DFDC',
    borderBracketDim: 'rgba(184, 223, 220, 0.4)',

    textWhite: '#FFFFFF',
    textPrimary: '#E8FAF8',
    textSecondary: '#B4D6D3',
    textMuted: '#84A8A5',
    textDim: '#4B6664',
    textDark: '#020A0A',

    starAccent: '#14B8A6',
    starAccentGlow: 'rgba(20, 184, 166, 0.5)',
  },
  font: {
    mono: "'Space Mono', monospace",
    display: "'Exo 2', sans-serif",
  },
  space: {
    chamferPanel: '18px',
    chamferBtn: '12px',
  },
  shadow: {
    glowGold: '0 0 25px rgba(20, 184, 166, 0.45)',
    glowCyan: '0 0 20px rgba(56, 189, 248, 0.45)',
    glowPanel: '0 24px 64px rgba(2, 10, 10, 0.95)',
  },
});

/**
 * 4. ACS Synapse Star Theme (Electric Cyan / Cognitive Science)
 */
export const synapseTheme = createTheme(vars, {
  color: {
    bgBlack: '#020408',
    bgPanelStart: '#081220',
    bgPanelMid: '#060E1A',
    bgPanelEnd: '#040B14',
    bgCardTranslucent: 'rgba(3, 8, 16, 0.6)',
    bgBadge: '#0D1E36',

    gold: '#06B6D4',
    goldHover: '#22D3EE',
    goldDark: '#0891B2',
    cyan: '#818CF8',
    cyanDim: 'rgba(129, 140, 248, 0.25)',
    cyanGlow: 'rgba(129, 140, 248, 0.5)',
    greenSync: '#5FAE84',
    greenGlow: 'rgba(95, 174, 132, 0.6)',

    borderSlate: '#1E3A5F',
    borderSubtle: '#12243D',
    borderBracket: '#B8D4F0',
    borderBracketDim: 'rgba(184, 212, 240, 0.4)',

    textWhite: '#FFFFFF',
    textPrimary: '#EAF3FD',
    textSecondary: '#B4CCE6',
    textMuted: '#849EBD',
    textDim: '#4B5F78',
    textDark: '#02050A',

    starAccent: '#06B6D4',
    starAccentGlow: 'rgba(6, 182, 212, 0.5)',
  },
  font: {
    mono: "'Space Mono', monospace",
    display: "'Exo 2', sans-serif",
  },
  space: {
    chamferPanel: '18px',
    chamferBtn: '12px',
  },
  shadow: {
    glowGold: '0 0 25px rgba(6, 182, 212, 0.45)',
    glowCyan: '0 0 20px rgba(129, 140, 248, 0.45)',
    glowPanel: '0 24px 64px rgba(2, 5, 10, 0.95)',
  },
});

import type { StarThemeKey } from '../machines/appMachine';

/**
 * Strongly typed map linking statechart StarThemeKey to compiled Vanilla Extract classes.
 * 'satisfies' enforces that every key is covered with zero string looseness.
 */
export const STAR_THEMES = {
  deepSpace: deepSpaceTheme,
  forge: forgeTheme,
  canvas: canvasTheme,
  synapse: synapseTheme,
} as const satisfies Record<StarThemeKey, string>;

export type StarThemeClass = (typeof STAR_THEMES)[StarThemeKey];

