import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          dim:     'var(--brand-primary-dim)',
          gold:    'var(--brand-gold)',
        },
        surface: {
          page:     'var(--surface-page)',
          card:     'var(--surface-card)',
          overlay:  'var(--surface-overlay)',
          dark:     'var(--surface-dark)',
          darkCard: 'var(--surface-dark-card)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
          onDark:    'var(--text-on-dark)',
          onBrand:   'var(--text-on-brand)',
        },
        border: {
          subtle:  'var(--border-subtle)',
          default: 'var(--border-default)',
          strong:  'var(--border-strong)',
        },
        state: {
          success:    'var(--state-success)',
          successBg:  'var(--state-success-bg)',
          warning:    'var(--state-warning)',
          warningBg:  'var(--state-warning-bg)',
          error:      'var(--state-error)',
          errorBg:    'var(--state-error-bg)',
          info:       'var(--state-info)',
          infoBg:     'var(--state-info-bg)',
        },
      },
      borderColor: {
        DEFAULT: 'var(--border-default)',
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        card:     'var(--shadow-card)',
        modal:    'var(--shadow-modal)',
        dropdown: 'var(--shadow-dropdown)',
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
      },
      transitionDuration: {
        fast:   '120ms',
        base:   '200ms',
        slow:   '320ms',
        spring: '400ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};

export default config;