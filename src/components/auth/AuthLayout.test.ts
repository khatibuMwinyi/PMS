import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const authLayoutContent = fs.readFileSync(
  path.join(process.cwd(), 'src/components/auth/AuthLayout.tsx'),
  'utf-8'
);

describe('AuthLayout Component', () => {
  describe('layout', () => {
    it('should use auth-split CSS class for layout', () => {
      expect(authLayoutContent).toMatch(/auth-split/);
    });
  });

  describe('panels', () => {
    it('should use auth-panel-left CSS class', () => {
      expect(authLayoutContent).toMatch(/auth-panel-left/);
    });

    it('should use auth-panel-right CSS class', () => {
      expect(authLayoutContent).toMatch(/auth-panel-right/);
    });
  });

  describe('framer-motion', () => {
    it('should import and use framer-motion', () => {
      expect(authLayoutContent).toMatch(/framer-motion/);
    });

    it('should use motion.div for animations', () => {
      expect(authLayoutContent).toMatch(/motion\.div/);
    });
  });
});