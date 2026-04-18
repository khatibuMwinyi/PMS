import type { ButtonHTMLAttributes } from 'react';

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        'inline-flex items-center justify-center rounded-[var(--radius-md)] px-4 py-2 transition duration-200 ' +
        (props.className ?? '')
      }
    />
  );
}
