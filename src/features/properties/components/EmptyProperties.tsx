import { AddPropertyButton } from './AddPropertyButton';

export function EmptyProperties() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center min-h-[480px] rounded-[var(--radius-xl)] border border-dashed"
      style={{ borderColor: 'var(--border-default)' }}
    >
      {/* House illustration */}
      <div
        className="mb-6 w-20 h-20 rounded-[var(--radius-xl)] flex items-center justify-center"
        style={{ background: 'var(--surface-overlay)' }}
      >
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
          <path
            d="M40 14L10 38H18V66H32V50H48V66H62V38H70L40 14Z"
            stroke="var(--brand-primary)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            fill="none"
            opacity="0.6"
          />
          <rect
            x="32" y="44" width="16" height="22" rx="2"
            stroke="var(--brand-primary)"
            strokeWidth="2.5"
            fill="none"
            opacity="0.4"
          />
        </svg>
      </div>

      <h2 className="font-display text-[22px] text-[var(--text-primary)] mb-2">
        No properties yet
      </h2>
      <p
        className="text-[14px] mb-8 max-w-xs leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        Add your first property to start booking professional services through Oweru.
      </p>

      <AddPropertyButton label="+ Add Your First Property" />
    </div>
  );
}