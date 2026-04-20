'use client';

interface PasswordStrengthMeterProps {
  password: string;
}

function getStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
}

const SEGMENT_COLORS = [
  '',                               // 0 - empty
  'bg-[var(--state-error)]',        // 1 - weak
  'bg-[var(--state-warning)]',      // 2 - fair
  'bg-green-500',                   // 3 - good
  'bg-[var(--brand-primary)]',      // 4 - strong
];

const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = getStrength(password);

  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={[
              'h-1 flex-1 rounded-full transition-all duration-300',
              i <= strength ? SEGMENT_COLORS[strength] : 'bg-[var(--border-default)]',
            ].join(' ')}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className="text-[12px] text-[var(--text-muted)]">
          Password strength: <span className="font-medium">{LABELS[strength]}</span>
        </p>
      )}
    </div>
  );
}