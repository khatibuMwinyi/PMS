import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  href?: string;
}

export function Logo({ width = 120, height = 40, className = '', href = '/' }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/images/logo.webp"
        alt="Oweru Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </Link>
  );
}

export function LogoIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/logo.webp"
      alt="Oweru"
      width={size}
      height={size}
      className={`rounded object-contain w-auto h-auto ${className}`}
      priority
    />
  );
}
