---
name: Operational Excellence
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#5d5e66'
  on-secondary: '#ffffff'
  secondary-container: '#e3e1ec'
  on-secondary-container: '#63646c'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#e3e1ec'
  secondary-fixed-dim: '#c6c5cf'
  on-secondary-fixed: '#1a1b22'
  on-secondary-fixed-variant: '#46464e'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  table-header:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-tabular:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  table-cell-padding-x: 12px
  table-cell-padding-y: 8px
---

## Brand & Style

The brand personality of this design system is defined by precision, reliability, and extreme efficiency. It is built for property managers and operations professionals who require high information density without cognitive overload. The UI is designed to feel like a high-performance tool rather than a marketing site.

The design style follows a **Modern Corporate** approach with a heavy emphasis on **Minimalism**. Every pixel must serve a functional purpose. We prioritize clarity and rapid data scanning over visual flair, utilizing a strict structural grid and a restrained color palette to ensure the user's focus remains entirely on the data and operational tasks at hand.

## Colors

The palette is anchored in **Slate** for core UI surfaces and **Zinc** for secondary text and decorative elements. This creates a sophisticated, neutral backdrop that allows semantic indicators to stand out clearly.

- **Primary & Neutrals**: Slate-900 (#0f172a) is used for primary actions and headings to provide maximum contrast. Zinc-500 (#71717a) serves as the secondary color for icons and auxiliary labels.
- **Surface Strategy**: We use Slate-50 (#f8fafc) for application backgrounds and pure White (#ffffff) for card and table surfaces to create a subtle but clear distinction between the canvas and the content containers.
- **Semantic States**: High-saturation semantic colors are used sparingly for status badges and alerts. These colors must meet WCAG AA contrast ratios against white surfaces to ensure accessibility in fast-paced operational environments.

## Typography

This design system utilizes **Inter** exclusively to take advantage of its highly legible glyphs and robust OpenType features. 

For data-heavy interfaces, we enable `tabular-nums` (tnum) to ensure that numerical values in tables align vertically, facilitating easier comparison of financial and property data. A strict hierarchy is maintained:
- **Headlines** are reserved for page titles and section headers.
- **Table Headers** use a condensed, uppercase style to differentiate from the data itself.
- **Labels** are slightly weighted (Medium 500) to remain legible at small sizes (12px) used in high-density forms.

## Layout & Spacing

The layout philosophy centers on a **Fluid Grid** with fixed-width gutters to maximize the use of screen real estate. We employ a 4px base unit to create a high-density rhythm.

- **Grid**: A 12-column system is used for dashboard layouts, while data tables should span the full width of their containers.
- **Density**: In operational views, we prioritize "at-a-glance" visibility. Standard spacing between elements is 16px (md), but this is reduced to 8px (sm) within complex data components like property lists or filter bars.
- **Margins**: Consistent 24px (lg) outer margins ensure the content has room to breathe without wasting valuable dashboard space.

## Elevation & Depth

To maintain a clean and functional aesthetic, this design system avoids heavy shadows and skeuomorphic effects. Depth is conveyed primarily through **Low-contrast outlines** and **Tonal layers**.

- **Level 0 (Canvas)**: Slate-50. Used for the main application background.
- **Level 1 (Surfaces)**: White with a 1px border of Slate-200. Used for cards, table containers, and the sidebar.
- **Level 2 (Popovers/Modals)**: White with a subtle, diffused shadow (0px 4px 12px rgba(15, 23, 42, 0.08)) and a Slate-200 border. This is the only instance where shadows are permitted, to provide necessary focus separation.
- **Interactive Depth**: Buttons and input fields use a solid 1px border that darkens on hover, rather than an elevation change.

## Shapes

The shape language is **Soft** (Level 1). A 4px (0.25rem) radius is the standard for almost all UI components, including buttons, inputs, and table containers. 

This small radius maintains a professional, "engineered" look that feels more modern than sharp corners while being significantly more space-efficient than large, pill-shaped components. It ensures that when multiple components are stacked (like in a dense form or property list), the visual noise created by corner radii is kept to a minimum.

## Components

### High-Density Tables
Tables are the core of the experience. They must feature:
- **Zebra Striping**: Alternating rows using Slate-50 to assist horizontal scanning.
- **Row Hover**: A subtle highlight in Slate-100 to indicate interactivity.
- **Sticky Headers**: Essential for long property lists.
- **Condensed Padding**: 12px horizontal and 8px vertical cell padding.

### Status Badges
Badges use a "Subtle Background" style: a 10% opacity version of the semantic color for the background, with a 100% opacity bold version for the text. This ensures the status is visible without being distracting.

### Timeline Trackers
Operational steps (e.g., Lease Approval, Maintenance Workflow) are represented by a step-based tracker. 
- **Active Step**: Solid Slate-900 circle with a primary label.
- **Completed Step**: Success Green icon with a connecting line.
- **Pending Step**: Slate-200 hollow circle with muted Zinc text.

### Inputs & Buttons
Inputs should use a 1px Slate-200 border, turning Slate-900 on focus. Buttons are primarily "Filled" (Slate-900 with White text) or "Outline" (Slate-200 border with Slate-900 text) to keep the UI grounded and functional.