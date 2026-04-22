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
      expect(inputContent).toMatch(/brand-gold.*?focus/);
    });
  });

  describe('light theme support', () => {
    it('should have data-theme attribute handling for light theme', () => {
      expect(inputContent).toMatch(/data-theme/);
    });

    it('should use brand-gold for light theme border color', () => {
      expect(inputContent).toMatch(/brand-gold.*?border|border.*?brand-gold/);
    });
  });
});