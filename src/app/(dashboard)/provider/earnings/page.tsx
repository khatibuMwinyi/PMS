export default function ProviderEarningsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-semibold text-[var(--text-primary)]">Wallet</h1>
        <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Track your earnings and request withdrawals
        </p>
      </div>
      <div
        className="flex items-center justify-center min-h-[320px] rounded-[var(--radius-xl)] border border-dashed text-[14px]"
        style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
      >
        Wallet & earnings UI — coming in Phase 3
      </div>
    </div>
  );
}