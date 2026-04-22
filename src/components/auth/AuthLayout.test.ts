import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const authLayoutContent = fs.readFileSync(
  path.join(process.cwd(), 'src/components/auth/AuthLayout.tsx'),
  'utf-8'
);

describe('AuthLayout Component', () => {
  describe('grid layout', () => {
    it('should use grid layout on large screens', () => {
      expect(authLayoutContent).toMatch(/grid.*lg:grid-cols-2/);
    });

    it('should have responsive padding', () => {
      expect(authLayoutContent).toMatch(/py-\d+/);
    });
  });

  describe('centered container', () => {
    it('should have max-w container', () => {
      expect(authLayoutContent).toMatch(/max-w-\d+xl/);
    });

    it('should have mx-auto for centering', () => {
      expect(authLayoutContent).toMatch(/mx-auto/);
    });
  });

  describe('right panel scrollable', () => {
    it('should have overflow-y-auto for form panel', () => {
      expect(authLayoutContent).toMatch(/overflow-y-auto/);
    });
  });
});