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
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          gold:    'var(--brand-gold)',
          goldLight: 'var(--brand-gold-light)',
        },
        surface: {
          page:     'var(--surface-page)',
          card:     'var(--surface-card)',
          overlay:  'var(--surface-overlay)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
          onBrand:   'var(--text-on-brand)',
        },
        border: {
          DEFAULT: 'var(--border-default)',
          subtle:  'var(--border-subtle)',
        },
        state: {
          success:    'var(--state-success)',
          successBg:  'var(--state-success-bg)',
          error:      'var(--state-error)',
          errorBg:    'var(--state-error-bg)',
        },
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
        primary:  '0 10px 40px rgba(0,0,0,0.1), 0 2px 12px rgba(0,0,0,0.08)',
        focus:    '0 0 0 3px var(--border-focus)',
      },
      spacing: {
        '1':  'var(--space-1)',
        '2':  'var(--space-2)',
        '3':  'var(--space-3)',
        '4':  'var(--space-4)',
        '5':  'var(--space-5)',
        '6':  'var(--space-6)',
        '8':  'var(--space-8)',
        '10': 'var(--space-10)',
      },
      transitionDuration: {
        fast:   '120ms',
        base:   '200ms',
        slow:   '320ms',
      },
    },
  },
  plugins: [],
};

export default config;
