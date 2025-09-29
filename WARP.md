# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Browsertrix Behaviors is a TypeScript-based library that injects browser behaviors to perform automated actions like scrolling, fetching additional URLs, or performing site-specific interactions on social media platforms. The compiled output is a single JavaScript file (`dist/behaviors.js`) that can be injected into any modern browser.

## Development Commands

### Build Commands
- `yarn build` - Build production bundle (minified)
- `yarn build-dev` - Build development bundle (unminified)
- `yarn build-dev-copy` - Build development bundle and copy to clipboard (macOS only)
- `yarn watch` - Watch mode for production build
- `yarn watch-dev` - Watch mode for development build

### Testing Commands
- `yarn test` - Run the test harness (requires a URL argument, e.g., `yarn test 'https://twitter.com/webrecorder_io'`)
- Test harness opens a browser with devtools and runs behaviors on the specified URL

### Code Quality
- `yarn lint` - Run ESLint with automatic fixes
- `yarn lint:check` - Run ESLint in check mode (no fixes)
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check code formatting without making changes

## Code Architecture

### Core Architecture Pattern
The codebase follows a behavior management system where:

1. **BehaviorManager** (`src/index.ts`) - Central orchestrator that:
   - Initializes and manages all behavior instances
   - Handles site-specific behavior selection
   - Coordinates background vs active behaviors
   - Manages timeouts and cleanup

2. **Background Behaviors** - Run automatically without changing the page:
   - **AutoFetcher** - Fetches additional resources (images, stylesheets, data attributes)
   - **Autoplay** - Attempts to play media and fetch video stream URLs
   - **AutoClick** - Clicks through UI elements

3. **Active Behaviors** - Modify the page and run until completion:
   - **AutoScroll** - Generic scrolling behavior
   - **Site-Specific Behaviors** - Custom behaviors for specific platforms

### Behavior System Design

#### Base Classes
- **Behavior** (`src/lib/behavior.ts`) - Base class for all behaviors with:
  - Async iterator pattern (`async *run()`)
  - Pause/unpause capability
  - State management and logging
  - Cleanup hooks

- **BehaviorRunner** - Wrapper for external behaviors with standardized context

#### Site-Specific Behaviors
Located in `src/site/`, these behaviors target specific platforms:
- Facebook (`facebook.ts`)
- Instagram (`instagram.ts`) 
- Twitter (`twitter.ts`)
- TikTok (`tiktok.ts`)
- Telegram (`telegram.ts`)
- YouTube (`youtube.ts`)

Each site behavior must implement:
- Static `id` property
- Static `isMatch()` method to determine if behavior should run
- Static `init()` method returning state and options
- `async *run(ctx)` generator method

#### Behavior Selection Logic
1. If `siteSpecific: true`, check all site behaviors for matches
2. Site-specific behaviors take precedence over generic autoscroll
3. Falls back to AutoScroll if no site match and `autoscroll: true`
4. Background behaviors always run when enabled

### Build System

#### Webpack Configuration
- Single entry point: `index.ts`
- Output: Single file `dist/behaviors.js` (no chunks)
- TypeScript compilation via ts-loader
- Minification via TerserPlugin
- Banner injection with license information

#### Key Build Features
- Development vs production modes
- Source maps in development
- Copyright banner injection
- Single chunk output for browser injection

### Testing Infrastructure

#### Test Harness (`scripts/test-harness.mjs`)
- Uses Puppeteer for browser automation
- Webpack compilation in memory (memfs)
- Watch mode for development
- Automatic behavior injection and execution
- Supports any URL for testing

### Browser Integration Pattern

The behaviors are designed to be injected via:

```javascript
// Inject the compiled behaviors.js content, then:
self.__bx_behaviors.init({
  autofetch: true,
  autoplay: true, 
  autoscroll: true,
  siteSpecific: true,
  timeout: 30000  // optional timeout in ms
});

// Run behaviors
await self.__bx_behaviors.run();
```

### XPath-Based Element Selection

Site behaviors primarily use XPath for element selection via `ctx.Lib.xpathNode()` and related utilities. This provides more flexible element selection than CSS selectors, especially for dynamic content.

### State Management

Each behavior maintains its own state object, passed through the context (`ctx.state`). The BehaviorManager handles behavior lifecycle and ensures proper cleanup.

## Development Patterns

### Adding New Site Behaviors
1. Create new file in `src/site/`
2. Implement required static methods (`id`, `isMatch`, `init`)
3. Implement `async *run(ctx)` generator
4. Add to `src/site/index.ts` exports
5. Test using the test harness

### Debugging Behaviors
- Use `ctx.log()` for behavior-specific logging
- Test harness runs with devtools open
- Development builds are unminified for easier debugging
- Use `yarn build-dev-copy` for quick clipboard testing

### Context Object Structure
```javascript
ctx = {
  Lib,        // Utility functions (xpathNode, sleep, etc.)
  state,      // Behavior-specific state object
  opts,       // Merged options from init() and runtime
  log         // Logging function
}
```