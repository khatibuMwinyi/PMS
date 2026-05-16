import Image from 'next/image';

export function PropertyBackdrop() {
  return (
    <div className="auth-backdrop" aria-hidden="true">
      <div className="auth-backdrop-image">
        <Image
          src="/images/auth-backdrop.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="auth-backdrop-overlay" />
      <div className="auth-backdrop-glow" />
      <div className="auth-backdrop-glow-2" />
    </div>
  );
}
