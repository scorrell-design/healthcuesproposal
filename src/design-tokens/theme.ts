export const tokens = {
  colors: {
    brandGreen:     '#2FBF8F',
    brandGreenDeep: '#22A578',
    brandBlue:      '#3F7FF4',
    brandBlueDeep:  '#2E65D4',

    pageBg:      '#FFFFFF',
    pageBgSoft:  '#F6F9FC',
    cardBg:      '#FFFFFF',
    cardBorder:  '#E6EEF6',

    textPrimary:   '#0F172A',
    textSecondary: '#475569',
    textMuted:     '#94A3B8',

    success: '#2FBF8F',
    warning: '#D97706',
    error:   '#DC2626',
    info:    '#3F7FF4',

    chart1: '#3F7FF4',
    chart2: '#2FBF8F',
    chart3: '#6BA8F5',
    chart4: '#5FD4AA',
    chart5: '#94A3B8',
    chart6: '#D97706',
  },

  fonts: {
    sans:    "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
    mono:    "'JetBrains Mono', 'SF Mono', Monaco, monospace",
  },

  radii: {
    input: '12px',
    card: '22px',
    cardSm: '16px',
    pill: '9999px',
    button: '14px',
    segment: '10px',
  },

  spacing: {
    sectionPadding: '24px',
    inputGroupGap: '16px',
    cardGridGap: '12px',
    labelToInput: '4px',
  },
} as const;
