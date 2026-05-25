# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CSC UI is a **Stencil-based Web Component library** implementing the CSC Design System. It provides framework-agnostic UI components (73+ components) that can be used with React, Vue 3, Vue 2, and vanilla JavaScript.

**Repository**: https://github.com/CSCfi/ui

### Architecture

This is a **monorepo** managed with Lerna and pnpm workspaces, containing:

- **`packages/csc-ui`**: Core Stencil web component library (the main package)
- **`packages/csc-ui-react`**: Auto-generated React wrapper components (generated from Stencil)
- **`packages/csc-ui-vue`**: Vue 3 directive wrapper
- **`packages/csc-ui-vue2`**: Vue 2 directive wrapper
- **`packages/csc-ui-documentation`**: Nuxt 3 documentation site
- **`packages/react-app`**: Example React application

The primary development happens in `packages/csc-ui`. The React wrapper is auto-generated via the Stencil `@stencil/react-output-target` plugin during the build process. Vue wrappers are hand-written utilities.

### Tech Stack

**Core Library (Stencil)**:
- Stencil 4.28.2
- TypeScript 4.9.5
- SASS (via `@stencil/sass`)
- Style Dictionary for design tokens

**Frameworks**:
- Vue 3.5.13, Vue 2.7.14, React 18.3.1

**Testing & Linting**:
- Jest 27 + Playwright 1.48.1 for component testing
- ESLint with TypeScript support
- Stylelint for SCSS
- Prettier for code formatting

**Build & Publishing**:
- Release-please GitHub Action for automated releases
- npm publishing with Node.js 20

## Build Commands

### Core Library (csc-ui)

```bash
# Build once
npm run build

# Watch mode - rebuilds on file changes
npm run build:watch

# Start dev server (watch + serve)
npm run start
```

### All Packages

```bash
# Build all packages in workspace
npm run build

# Publish all packages (from root)
npm run publish
```

### Documentation Site

```bash
cd packages/csc-ui-documentation
npm run dev    # Dev server on http://localhost:3000
npm run build  # Build for production
npm run generate # Generate static site
```

### React Example App

```bash
cd packages/react-app
npm run dev    # Vite dev server
npm run build
```

### Combined Development

```bash
# From root: Start watching csc-ui + docs dev server concurrently
npm run dev
```


## Code Style & Conventions

### Design Tokens & Styling

- Tokens defined via **Style Dictionary** (`style-dictionary.config.js`)
- Generates SCSS variables, CSS variables, Tailwind theme, etc.
- Build tokens with: `npm run style-dictionary:build`
- Tokens live in `/tokens` (check style-dictionary config for exact path)
- SCSS globals injected via `/src/assets/global.scss`

Styles are exported as:
- CSS: `dist/styles/css/*.css`
- SCSS: `dist/styles/css/*.css` (same files)
- Tailwind config: `dist/styles/tailwind/theme.js`

### Component Documentation

- Use JSDoc comments with `@group`, `@slot` tags
- Stencil generates `docs.json` and `vscode-data.json` during build
- Documentation site in `packages/csc-ui-documentation` displays components

## Output Targets (Build Configuration)

The Stencil config (`stencil.config.ts`) generates multiple output targets:

- **dist**: Standard ESM/CJS distribution
- **dist/components**: Custom elements with single-export module
- **docs-json**: JSON schema of all components (`docs.json`)
- **docs-vscode**: VSCode IntelliSense data (`vscode-data.json`)
- **www**: Development server
- **React**: Auto-generated React components to `../csc-ui-react/src/components/stencil-generated/`

The React package (`csc-ui-react`) wraps the auto-generated components and exports them.

## Important Notes

- **React wrapper is auto-generated**: Do not edit files in `packages/csc-ui-react/src/components/stencil-generated/`. They are overwritten during the csc-ui build.
- **Props are reactive**: Stencil watches `@Prop()` values and re-renders when they change
- **Styles are scoped**: Shadow DOM means component styles won't leak; use CSS custom properties for theming
- **73 components**: Use the design system docs at https://design-system.csc.fi/ to understand component APIs
- **Web Components**: These are native browser elements that work in any framework. Test with vanilla HTML when needed.

## Common Development Tasks

### Update Design Tokens

1. Modify token definitions (location depends on style-dictionary config)
2. Run `npm run style-dictionary:build` in csc-ui
3. Rebuild styles will be regenerated

### Test Changes Locally

```bash
# In packages/react-app, use the local csc-ui-react:
npm run dev

# Or in documentation site:
cd packages/csc-ui-documentation
npm run dev
```

Both automatically use local packages via workspace symlinks.

### View Component in Documentation

After building, the documentation site auto-discovers components:
```bash
cd packages/csc-ui-documentation
npm run dev
```

Navigate to http://localhost:3000 to see components.
