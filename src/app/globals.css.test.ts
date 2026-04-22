import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const cssContent = fs.readFileSync(
  path.join(process.cwd(), 'src/app/globals.css'),
  'utf-8'
);

describe('globals.css CSS Variables', () => {
  describe('brand-primary-dark', () => {
    it('should have --brand-primary-dark for headings', () => {
      expect(cssContent).toMatch(/--brand-primary-dark:\s*#[0-9a-fA-F]{6}/);
    });
  });

  describe('state-error-light', () => {
    it('should have --state-error-light for error message backgrounds', () => {
      expect(cssContent).toMatch(/--state-error-light:\s*#[0-9a-fA-F]{6}/);
    });
  });

  describe('text-secondary', () => {
    it('should have darker --text-secondary for better contrast', () => {
      const match = cssContent.match(/--text-secondary:\s*(#[0-9a-fA-F]{6})/);
      expect(match).not.toBeNull();
      const hexValue = match![1].toLowerCase();
      const isDarker = hexValue <= '#2d3a58';
      expect(isDarker).toBe(true);
    });
  });

  describe('spacing', () => {
    it('should have --space-20 defined', () => {
      expect(cssContent).toMatch(/--space-20:\s*\d+px/);
    });
  });
});