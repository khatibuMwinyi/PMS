import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-display',
        'text-h1', 'text-h2', 'text-h3', 'text-h4',
        'text-body-lg',
        'text-body',
        'text-body-sm',
        'text-caption',
        'text-data',
        'text-mono',
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return customTwMerge(clsx(inputs));
}
