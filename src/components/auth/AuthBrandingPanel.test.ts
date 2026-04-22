import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const brandingPanelContent = fs.readFileSync(
  path.join(process.cwd(), 'src/components/auth/AuthBrandingPanel.tsx'),
  'utf-8'
);

describe('AuthBrandingPanel Component', () => {
  describe('typography', () => {
    it('should use text-4xl on mobile and text-5xl on desktop for heading', () => {
      expect(brandingPanelContent).toMatch(/text-4xl\s+md:text-5xl/);
    });
  });

  describe('spacing', () => {
    it('should use mb-6 for bottom margin on brand section', () => {
      expect(brandingPanelContent).toMatch(/mb-6/);
    });
  });

  describe('color consistency', () => {
    it('should use var(--brand-gold) instead of hardcoded color', () => {
      expect(brandingPanelContent).toMatch(/text-\[var\(--brand-gold\)\]/);
    });
  });
});