import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Font Family ────────────────────────────────
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        h1: ['Inter', 'system-ui', 'sans-serif'],
        h2: ['Inter', 'system-ui', 'sans-serif'],
        'body-md': ['Inter', 'system-ui', 'sans-serif'],
        'body-sm': ['Inter', 'system-ui', 'sans-serif'],
        'table-header': ['Inter', 'system-ui', 'sans-serif'],
        'data-tabular': ['Inter', 'system-ui', 'sans-serif'],
        label: ['Inter', 'system-ui', 'sans-serif'],
      },

      // ─── Font Size (with lineHeight and letterSpacing) ──
      fontSize: {
        'h1': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'h2': ['18px', { lineHeight: '28px', fontWeight: '600' }],
        'body-md': ['14px', { lineHeight: '20px' }],
        'body-sm': ['13px', { lineHeight: '18px' }],
        'table-header': ['12px', { lineHeight: '16px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }],
        'data-tabular': ['14px', { lineHeight: '20px', fontVariantNumeric: 'tabular-nums' }],
        'label': ['14px', { lineHeight: '20px', fontWeight: '500' }],
      },

      // ─── Colors ────────────────────────────────────
      colors: {
        // Primary palette (dark navy)
        primary: {
          DEFAULT: '#131b2e',
          light: '#1B2A4A',
          dark: '#000000',
          foreground: '#ffffff',
        },
        // Accent gold
        accent: {
          DEFAULT: '#F0A500',
          light: '#F5C542',
          dark: '#D49400',
          foreground: '#000000',
        },
        // Background
        background: {
          DEFAULT: '#fcf8fa',
          card: '#ffffff',
          overlay: 'rgba(19, 27, 46, 0.05)',
        },
        // Surface variants
        surface: {
          DEFAULT: '#ffffff',
          '100': '#f8f9fa',
          '200': '#e9ecef',
          '300': '#dee2e6',
          variant: '#f5f5f5',
        },
        // On-colors (text on colored backgrounds)
        'on-primary': '#ffffff',
        'on-accent': '#000000',
        'on-surface': {
          DEFAULT: '#131b2e',
          variant: '#64748B',
        },
        // Secondary container
        'secondary-container': '#E8F7F2',
        'on-secondary-container': '#0F766E',
        // Tertiary container
        'tertiary-container': '#F3E8FF',
        'on-tertiary-container': '#6B21A8',
        // Outline
        outline: 'rgba(19, 27, 46, 0.14)',
        'outline-variant': 'rgba(19, 27, 46, 0.08)',
        // Status colors
        status: {
          urgent: '#EF4444',
          'in-progress': '#3B82F6',
          scheduled: '#8B5CF6',
          completed: '#6B7280',
        },
        // Brand (keeping existing for compatibility)
        brand: {
          primary: 'var(--brand-primary)',
          gold: 'var(--brand-gold)',
          goldLight: 'var(--brand-gold-light)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          onBrand: 'var(--text-on-brand)',
        },
        border: {
          DEFAULT: 'var(--border-default)',
          subtle: 'var(--border-subtle)',
        },
        state: {
          success: 'var(--state-success)',
          successBg: 'var(--state-success-bg)',
          error: 'var(--state-error)',
          errorBg: 'var(--state-error-bg)',
        },
      },

      // ─── Spacing ───────────────────────────────────
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        xl: '32px',
        lg: '24px',
        md: '16px',
        base: '4px',
        'table-cell-padding-x': '12px',
        'table-cell-padding-y': '8px',
      },

      // ─── Border Radius ──────────────────────────────
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        pill: 'var(--radius-pill)',
      },

      // ─── Box Shadow ────────────────────────────────
      boxShadow: {
        card: 'var(--shadow-card)',
        primary: '0 10px 40px rgba(0,0,0,0.1), 0 2px 12px rgba(0,0,0,0.08)',
        focus: '0 0 0 3px var(--border-focus)',
      },

      // ─── Transition Duration ────────────────────────
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '320ms',
      },
    },
  },
  plugins: [],
};

export default config;
