import type { HTMLAttributes } from 'react';

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={
        'rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)] ' +
        (props.className ?? '')
      }
    />
  );
}
