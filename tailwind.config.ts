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
        sans:  ['var(--font-sans)',  'Inter',     'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia',   'serif'],
        mono:  ['var(--font-mono)',  'ui-monospace', 'monospace'],
      },

      // ─── Font Size ──────────────────────────────────
      fontSize: {
        display:    ['var(--text-display)', { lineHeight: '1.1',  fontWeight: '500', letterSpacing: '-0.02em' }],
        h1:         ['var(--text-h1)',      { lineHeight: '1.2',  fontWeight: '500', letterSpacing: '-0.01em' }],
        h2:         ['var(--text-h2)',      { lineHeight: '1.3',  fontWeight: '600', letterSpacing: '-0.005em' }],
        h3:         ['var(--text-h3)',      { lineHeight: '1.4',  fontWeight: '600' }],
        h4:         ['var(--text-h4)',      { lineHeight: '1.5',  fontWeight: '600' }],
        'body-lg':  ['var(--text-body-lg)', { lineHeight: '1.6' }],
        body:       ['var(--text-body)',    { lineHeight: '1.6' }],
        'body-sm':  ['var(--text-body-sm)', { lineHeight: '1.55' }],
        caption:    ['var(--text-caption)', { lineHeight: '1.35', fontWeight: '500', letterSpacing: '0.04em' }],
        data:       ['var(--text-body)',    { lineHeight: '1.35', fontWeight: '500' }],
        mono:       ['var(--text-body-sm)', { lineHeight: '1.55' }],
      },

      // ─── Colors ────────────────────────────────────
      colors: {
        primary: {
          DEFAULT:    'var(--brand-primary)',
          light:      'var(--brand-primary-light)',
          dark:       'var(--brand-primary-dark)',
          foreground: 'var(--text-on-brand)',
        },
        accent: {
          DEFAULT:    'var(--brand-gold)',
          light:      'var(--brand-gold-light)',
          dark:       'var(--brand-gold-dark)',
          foreground: 'var(--brand-primary)',
        },
        surface: {
          page:      'var(--surface-page)',
          card:      'var(--surface-card)',
          overlay:   'var(--surface-overlay)',
          dark:      'var(--surface-dark)',
          'dark-card': 'var(--surface-dark-card)',
          'container-lowest':  'var(--surface-container-lowest)',
          'container-low':     'var(--surface-container-low)',
          container:           'var(--surface-container)',
          'container-high':    'var(--surface-container-high)',
          'container-highest': 'var(--surface-container-highest)',
        },
        text: {
          primary:             'var(--text-primary)',
          secondary:           'var(--text-secondary)',
          muted:               'var(--text-muted)',
          'on-dark':           'var(--text-on-dark)',
          'on-brand':          'var(--text-on-brand)',
          'secondary-on-dark': 'var(--text-secondary-on-dark)',
          'muted-on-dark':     'var(--text-muted-on-dark)',
        },
        border: {
          DEFAULT:  'var(--border-default)',
          subtle:   'var(--border-subtle)',
          strong:   'var(--border-strong)',
          focus:    'var(--border-focus)',
        },
        'outline-variant': 'var(--outline-variant)',
        state: {
          success:      'var(--state-success)',
          'success-bg': 'var(--state-success-bg)',
          warning:      'var(--state-warning)',
          'warning-bg': 'var(--state-warning-bg)',
          error:        'var(--state-error)',
          'error-bg':   'var(--state-error-bg)',
          info:         'var(--state-info)',
          'info-bg':    'var(--state-info-bg)',
        },
        status: {
          urgent:       'var(--status-urgent)',
          'in-progress': 'var(--status-in-progress)',
          scheduled:    'var(--status-scheduled)',
          completed:    'var(--status-completed)',
        },
      },

      // ─── Spacing ───────────────────────────────────
      spacing: {
        '1':  'var(--space-1)',
        '2':  'var(--space-2)',
        '3':  'var(--space-3)',
        '4':  'var(--space-4)',
        '5':  'var(--space-5)',
        '6':  'var(--space-6)',
        '8':  'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
      },

      // ─── Border Radius ──────────────────────────────
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        card: 'var(--radius-card)',
        pill: 'var(--radius-pill)',
      },

      // ─── Box Shadow ────────────────────────────────
      boxShadow: {
        card:     'var(--shadow-card)',
        modal:    'var(--shadow-modal)',
        dropdown: 'var(--shadow-dropdown)',
        bold:     'var(--shadow-bold)',
        focus:    'var(--shadow-focus)',
      },

      // ─── Max Width ─────────────────────────────────
      maxWidth: {
        editorial: 'var(--container-editorial)',
        dashboard: 'var(--container-dashboard)',
      },

      // ─── Transition Duration ────────────────────────
      transitionDuration: {
        fast:   '120ms',
        base:   '200ms',
        slow:   '320ms',
        spring: '400ms',
      },
    },
  },
  plugins: [],
};

export default config;
