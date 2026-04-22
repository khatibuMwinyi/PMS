# Oweru Landing Page Design Options

## Overview
Three distinct landing page designs using the Oweru brand colors:
- **Primary**: #0F172A, #C89128, #F8F8F9
- **Secondary**: #2D3A58, #E5B972, #DDE1E8

## Design Options

### 1. Luxury Modern (page.option1.tsx)
- **Aesthetic**: Elegant, sophisticated, premium
- **Features**: 
  - Hero section with animated gradient background
  - Gold accent highlights (#C89128)
  - Soft shadows and smooth transitions
  - Professional typography with DM Serif Display
- **Best for**: High-end property management services
- **Mood**: Professional, trustworthy, premium

### 2. Modern Minimalist (page.option2.tsx)
- **Aesthetic**: Clean, functional, minimal
- **Features**:
  - Ample whitespace and breathing room
  - Subtle borders and rounded corners
  - Focus on content and readability
  - Tabbed interface for different user types
- **Best for**: Users who value simplicity and clarity
- **Mood**: Calm, efficient, professional

### 3. Bold Contemporary (page.option3.tsx)
- **Aesthetic**: Dynamic, vibrant, energetic
- **Features**:
  - Animated blob backgrounds
  - Gradient text effects
  - Interactive hover states
  - Bold typography and layouts
- **Best for**: Making a strong statement
- **Mood**: Energetic, modern, attention-grabbing

## How to Preview

1. Open the main landing page at `/`
2. A floating panel will appear in the bottom-right corner
3. Click on any design option to preview it
4. Click outside the preview or the X button to close

## How to Switch Designs

To make one of these designs the main landing page:

1. Copy the desired option file to `page.tsx`
2. Update any imports as needed
3. Delete the preview component if desired

Example:
```bash
cp src/app/(marketing)/page.option1.tsx src/app/(marketing)/page.tsx
```

## Brand Colors Implementation

All designs use the updated CSS custom properties:
- `--brand-primary`: #0F172A (Dark blue)
- `--brand-gold`: #C89128 (Gold)
- `--brand-light`: #F8F8F9 (Light cream)
- `--brand-secondary`: #2D3A58 (Dark blue-gray)
- `--brand-gold-light`: #E5B972 (Light gold)
- `--brand-gray`: #DDE1E8 (Light gray)

## Typography

- **Display Font**: DM Serif Display (elegant, serif)
- **Body Font**: DM Sans (clean, sans-serif)
- **Usage**: Display for headings, Sans for body text

## Animations

- **Framer Motion** is used for smooth animations
- Each design has unique animation patterns
- All animations are performance-optimized

## Notes

- All designs are fully responsive
- Accessibility considerations included
- Component-based architecture for easy maintenance
- Clean, semantic HTML structure