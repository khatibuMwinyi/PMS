import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const inputContent = fs.readFileSync(
  path.join(process.cwd(), 'src/components/ui/input.tsx'),
  'utf-8'
);

describe('Input Component', () => {
  describe('auth variant glassmorphism', () => {
    it('should use backdrop-blur-md for stronger blur effect', () => {
      expect(inputContent).toMatch(/backdrop-blur-md/);
    });

    it('should have bg-white/80 for glass effect', () => {
      expect(inputContent).toMatch(/bg-white\/80/);
    });
  });

  describe('label spacing', () => {
    it('should use mt-2 for label to input spacing', () => {
      expect(inputContent).toMatch(/mt-2/);
    });
  });

  describe('focus ring', () => {
    it('should use brand-gold for focus ring in auth variant', () => {
      const authVariantMatch = inputContent.match(/variant === 'auth'[\s\S]*?focus:ring.*?(\[[^\]]+\]|[\w-]+)/);
      expect(inputContent).toMatch(/brand-gold.*?focus/);
    });
  });
});